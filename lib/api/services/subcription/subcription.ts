import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

// Types
export type SubscriptionStatus =
  | "pending"
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "canceled"
  | "expired";

export interface SubscriptionPlan {
  _id?: string;
  name?: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  durationMonths?: number;
}

export interface SubscriptionUser {
  _id?: string;
  name?: string;
  email?: string;
}

export interface Subscription {
  _id: string;
  user: string | SubscriptionUser;
  plan: string | SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  externalCustomerId?: string;
  externalSubId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayload {
  planId: string;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, any>;
}

// ----------------------- API CALLS -----------------------

// 1️⃣ Create subscription
export async function createSubscription(payload: SubscriptionPayload, token: string) {
  return serverFetch<{ message: string; subscription: Subscription }>(
    API_ENDPOINTS.SUBSCRIPTIONS.BASE,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );
}

// 2️⃣ Get all subscriptions (Admin)
export async function getAllSubscriptions(params: { page?: number; limit?: number } = {}, token: string) {
  const queryString = buildQueryString(params);
  return serverFetch<{ data: Subscription[] | null; error: string | null; status: number }>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}${queryString}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}



export async function getMySubscriptions() {
  let userId: string | null = null;

  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("auth-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser?.id || null;
      } catch (err) {
        console.error("Error parsing auth-user from localStorage:", err);
      }
    }
  }

  if (!userId) {
    throw new Error("No user ID found in localStorage (auth-user)");
  }

  const response = await serverFetch(`${API_ENDPOINTS.SUBSCRIPTIONS.BY_USER}/${userId}`);

  // ✅ Handle double-layer data structure
  const apiData = response?.data?.data || response?.data || [];

  if (!Array.isArray(apiData)) {
    throw new Error("Invalid subscriptions data format from API");
  }

  const cleanedSubs: Subscription[] = apiData.map((sub: any) => ({
    ...sub,
    plan: sub.plan,
  }));

  return cleanedSubs;
}


// 4️⃣ Get specific user subscriptions (Admin)
export async function getSubscriptionsByUserId(userId: string, token: string) {
  const response = await serverFetch<{ data: Subscription[] | null; error: string | null; status: number }>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/user/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const rawSubs: Subscription[] = Array.isArray(response.data) ? response.data : [];
  return rawSubs.map((sub) => ({
    ...sub,
    plan: typeof sub.plan === "object" && sub.plan !== null && "data" in sub.plan ? (sub.plan as any).data : sub.plan,
  }));
}

// 5️⃣ Other subscription operations (GET, UPDATE, CANCEL, DELETE)
export async function getSubscriptionById(id: string, token: string) {
  const response = await serverFetch<{ data: Subscription | null; error: string | null; status: number }>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.data) throw new Error("Subscription not found");
  return response.data;
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus, token: string) {
  return serverFetch<{ message: string; subscription: Subscription }>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }
  );
}

export async function cancelSubscription(id: string, token: string) {
  return serverFetch<{ message: string; subscription: Subscription }>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
}

// ----------------------- UI TRANSFORM -----------------------
export interface UISubscription {
  id: number;
  user: { name: string; image: string };
  plan: { name: string; price?: number };
  status: SubscriptionStatus;
  period: string;
}

export function transformSubscriptionToUI(sub: Subscription, index?: number): UISubscription {
  const userName = typeof sub.user === "object" && sub.user?.name ? sub.user.name : "Unknown User";
  const userImage = `/images/avatars/${Math.abs(userName.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0)) % 10}.png`;
  const planName = typeof sub.plan === "object" && sub.plan?.name ? sub.plan.name : "Unnamed Plan";
  const planPrice = typeof sub.plan === "object" && sub.plan?.priceCents ? sub.plan.priceCents / 100 : undefined;
  const numericId = parseInt(sub._id.slice(-8), 16) || (index !== undefined ? index + 3000 : 0);
  const period = `${new Date(sub.currentPeriodStart).toLocaleDateString()} → ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`;
  return { id: numericId, user: { name: userName, image: userImage }, plan: { name: planName, price: planPrice }, status: sub.status, period };
}

export function transformSubscriptionsToUI(subs: Subscription[]): UISubscription[] {
  return subs.map(transformSubscriptionToUI);
}
// 3️⃣ Get all transactions of the logged-in user
export async function getMyTransactions() {
  let userId: string | null = null;

  // 🔹 Get user ID from localStorage
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("auth-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser?.id || null;
      } catch (err) {
        console.error("Error parsing auth-user from localStorage:", err);
      }
    }
  }

  if (!userId) {
    throw new Error("No user ID found in localStorage (auth-user)");
  }

  // 🔹 Call backend route
  const response = await serverFetch(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BY_USER}/${userId}/transactions`
  );

  // 🔹 Handle possible data formats
  const apiData =
    response?.data?.transactions || response?.transactions || response?.data || [];

  if (!Array.isArray(apiData)) {
    throw new Error("Invalid transactions data format from API");
  }

  return apiData;
}
