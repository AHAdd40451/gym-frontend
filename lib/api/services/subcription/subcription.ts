import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";
import apiClient from "../../axios";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from '@tanstack/react-query';

const QUERY_KEYS = {
  TRAINER_SUBSCRIBED_USERS: 'trainerSubscribedUsers',
  GYM_SUBSCRIBED_USERS: 'gymSubscribedUsers',
};

export interface SubscribedUser {
  _id: string;
  status: string;
  user: {
    _id?: string;
    username: string;
    email: string;
    address?: string;
    role?: string;
    userType?: string;
  };
  plan: {
    name: string;
    price?: number;
  };
  startDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

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
  _id?: string;
  // The /subscriptions/:id/details endpoint formats each subscription with
  // `id` instead of `_id` — both are optional here so callers must check both.
  id?: string;
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

/** Response from GET /subscriptions/trainer/:trainerId/status */
export interface TrainerSubscriptionStatusResponse {
  success: boolean;
  hasActiveSubscription: boolean;
  subscription: {
    _id: string;
    status: string;
    startDate: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
  } | null;
}

/** Response from GET /subscriptions/trainer/me (paginated) */
export interface TrainerSubscribedUsersParams {
  page?: number;
  limit?: number;
  memberName?: string;
  status?: string;
}

export interface TrainerSubscribedUsersResponse {
  success: boolean;
  data: any[];
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Response from GET /subscriptions/subscribed-users (gym-wide, not paginated) */
export interface GymSubscribedUsersResponse {
  success: boolean;
  total: number;
  users: any[];
}

const subscriptionApi = {
  getTrainerSubscribedUsers: async (params?: TrainerSubscribedUsersParams) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.page != null) queryParams.page = params.page;
    if (params?.limit != null) queryParams.limit = params.limit;
    if (params?.memberName?.trim()) queryParams.memberName = params.memberName.trim();
    if (params?.status?.trim() && params.status.toLowerCase() !== "all") queryParams.status = params.status.trim();
    const response = await apiClient.get("subscriptions/trainer/me", { params: queryParams });
    return response?.data as TrainerSubscribedUsersResponse;
  },

  getGymSubscribedUsers: async () => {
    const response = await apiClient.get("subscriptions/subscribed-users");
    return response?.data as GymSubscribedUsersResponse;
  },
};


export const useGetTrainerSubscribedUsers = (params?: TrainerSubscribedUsersParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRAINER_SUBSCRIBED_USERS, params?.page, params?.limit, params?.memberName, params?.status],
    queryFn: () => subscriptionApi.getTrainerSubscribedUsers(params),
  });
};

/**
 * All of the gym's subscribed members (not scoped to a single trainer) —
 * used by the staff "All Members" directory, since members are onboarded
 * as walk-in "platform" subscriptions, not per-trainer subscriptions.
 */
export const useGetGymSubscribedUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GYM_SUBSCRIBED_USERS],
    queryFn: () => subscriptionApi.getGymSubscribedUsers(),
  });
};

/**
 * Check if the current user (or given userId) has an active subscription with the given trainer.
 * Used on trainer profile to show "Subscribed" vs "Subscribe".
 */
export async function getTrainerSubscriptionStatus(
  trainerId: string,
  userId?: string | null
): Promise<TrainerSubscriptionStatusResponse> {
  const url = API_ENDPOINTS.SUBSCRIPTIONS.TRAINER_STATUS(trainerId);
  const params = userId ? { userId } : {};
  const response = await apiClient.get(url, { params });
  const data = response?.data;
  return {
    success: data?.success ?? false,
    hasActiveSubscription: data?.hasActiveSubscription ?? false,
    subscription: data?.subscription ?? null,
  };
}

// Fetch user with subscriptions and transactions (for details UI)
function getAuthTokenFromStorage(): string | undefined {
  if (typeof window === "undefined") return undefined;

  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    undefined
  );
}

function extractSubscriptionDetailsPayload(responseData: unknown) {
  const raw = responseData as Record<string, unknown> | null;
  const payload = (raw?.data as Record<string, unknown> | undefined) || raw;

  return {
    user: payload?.user,
    subscriptions: Array.isArray(payload?.subscriptions) ? payload.subscriptions : [],
    transactions: Array.isArray(payload?.transactions) ? payload.transactions : [],
  };
}

async function fetchUserSubscriptionPayload(userId: string) {
  const token = getAuthTokenFromStorage();

  const detailsResponse = await serverFetch(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${userId}/details`,
    { method: "GET" },
    token
  );

  if (!detailsResponse.error && detailsResponse.data) {
    const payload = extractSubscriptionDetailsPayload(detailsResponse.data);
    if (payload.user || payload.subscriptions.length > 0) {
      return payload;
    }
  }

  const response = await serverFetch(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BY_USER}/${userId}`,
    { method: "GET" },
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const apiData = (response?.data as any)?.data || response?.data || [];

  return {
    user: null,
    subscriptions: Array.isArray(apiData) ? apiData : [],
    transactions: [],
  };
}

export async function getUserWithSubscriptionsDetails(userId: string, token?: string | null) {
  const resolvedToken = token ?? getAuthTokenFromStorage();
  const response = await serverFetch(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${userId}/details`,
    { method: "GET" },
    resolvedToken
  );
  if (response?.error) {
    throw new Error(response.error);
  }

  const payload = extractSubscriptionDetailsPayload(response?.data ?? response);
  if (!payload.user && payload.subscriptions.length === 0) {
    throw new Error("Failed to fetch user subscription details");
  }

  return payload;
}


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
export interface WalkInSubscriptionPayload {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  planId: string;
  amount: number;
  currency?: string;
  startDate: string;
  endDate: string;
  paymentStatus: "paid" | "pending";
}

export interface WalkInSubscriptionResponse {
  success: boolean;
  message?: string;
  subscription?: Subscription;
  error?: string;
  status?: number;
}

export async function createWalkInSubscription(
  payload: WalkInSubscriptionPayload,
  token: string
) {
  return serverFetch<WalkInSubscriptionResponse>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/walk-in`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );
}

export interface PlanOption {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  priceCents?: number;
  price?: number;
  currency?: string;
  durationMonths?: number;
  duration?: number;
}

export async function getSubscriptionPlans(
  token?: string
): Promise<PlanOption[]> {
  try {
    const response = await apiClient.get("plans", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    console.log("Plans API raw response:", response?.data);

    const plans =
      response?.data?.data?.plans ||
      response?.data?.plans ||
      response?.data?.result ||
      response?.data?.data ||
      response?.data ||
      [];

    console.log("Parsed plans:", plans);

    return Array.isArray(plans) ? plans : [];
  } catch (error: any) {
    console.error("Plans API error:", error?.response?.data || error);
    return [];
  }
}

// 2️⃣ Get all subscriptions (Admin)
export async function getAllSubscriptions(params: { page?: number; limit?: number } = {}, token: string) {
  const queryString = buildQueryString(params);
  return serverFetch<{ data: Subscription[] | null; error: string | null; status: number }>(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}${queryString}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}



export async function getMySubscriptions(userId?: string) {
  let resolvedUserId: string | null = userId || null;

  // If userId not provided, try to get from localStorage
  if (!resolvedUserId && typeof window !== "undefined") {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        resolvedUserId = parsedUser?._id || parsedUser?.id || null;
      } catch (err) {
        console.error("Error parsing currentUser from localStorage:", err);
      }
    }
  }

  if (!resolvedUserId) {
    throw new Error("No user ID found. Please provide userId or ensure user is logged in.");
  }

  const payload = await fetchUserSubscriptionPayload(resolvedUserId);
  const apiData = payload.subscriptions;

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
  const rawId = sub._id || sub.id || "";
  const numericId = parseInt(rawId.slice(-8), 16) || (index !== undefined ? index + 3000 : 0);
  const period = `${new Date(sub.currentPeriodStart).toLocaleDateString()} → ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`;
  return { id: numericId, user: { name: userName, image: userImage }, plan: { name: planName, price: planPrice }, status: sub.status, period };
}

export function transformSubscriptionsToUI(subs: Subscription[]): UISubscription[] {
  return subs.map(transformSubscriptionToUI);
}

export async function getMyTransactions(userId?: string) {
  let resolvedUserId: string | null = userId || null;

  // If userId not provided, try to get from localStorage
  if (!resolvedUserId && typeof window !== "undefined") {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        resolvedUserId = parsedUser?._id || parsedUser?.id || null;
      } catch (err) {
        console.error("Error parsing currentUser from localStorage:", err);
      }
    }
  }

  if (!resolvedUserId) {
    throw new Error("No user ID found. Please provide userId or ensure user is logged in.");
  }

  const payload = await fetchUserSubscriptionPayload(resolvedUserId);

  const topLevelTransactions = payload.transactions;
  if (topLevelTransactions.length > 0) {
    return topLevelTransactions.map((item: any) => ({
      ...item,
      amount: Number(item.amount || 0),
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  }

  const subscriptionTransactions = payload.subscriptions.flatMap((sub: any) => {
    const subTransactions = Array.isArray(sub.transactions) ? sub.transactions : [];

    return subTransactions.map((item: any, index: number) => ({
      ...item,
      _id: item._id || `${sub._id}-trx-${index}`,
      amount: Number(item.amount || 0),
      createdAt: item.createdAt || item.date || sub.createdAt || new Date().toISOString(),
    }));
  });

  if (subscriptionTransactions.length > 0) {
    return subscriptionTransactions;
  }

  const response = await serverFetch(
    `${API_ENDPOINTS.SUBSCRIPTIONS.BY_USER}/${resolvedUserId}/transactions`,
    { method: "GET" },
    getAuthTokenFromStorage()
  );

  const apiData =
    (response?.data as any)?.transactions ||
    (response?.data as any)?.data?.transactions ||
    (response?.data as any)?.data ||
    response?.data ||
    [];

  if (!Array.isArray(apiData)) {
    throw new Error("Invalid transactions data format from API");
  }

  return apiData.map((item: any) => ({
    ...item,
    amount: Number(item.amount || 0),
    createdAt: item.createdAt || new Date().toISOString(),
  }));
}

export function useSubscribedUsers(token: string) {
  const [data, setData] = useState<SubscribedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setData([]);
      setError("Missing auth token");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await serverFetch(
        `${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/subscribed-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiData =
        res?.data?.users || res?.data || res?.users || [];

      if (!Array.isArray(apiData)) {
        throw new Error("Invalid subscribed users format from API");
      }

      setData(apiData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch subscribed users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
}
