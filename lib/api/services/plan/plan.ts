import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

// 💎 Types aligned with backend Plan model
export type BillingInterval = "day" | "week" | "month" | "year";

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  intervalCount: number;
  maxCheckInsPerDay: number;
  trialDays: number;
  externalPriceId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 🧾 Payload for creating or updating a plan
export interface PlanPayload {
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  billingInterval?: BillingInterval;
  intervalCount?: number;
  maxCheckInsPerDay?: number;
  trialDays?: number;
  externalPriceId?: string;
  isActive?: boolean;
}

// 1️⃣ Create Plan (Admin)
export async function createPlan(payload: PlanPayload, token?: string) {
  return serverFetch<{ message: string; plan: Plan }>(API_ENDPOINTS.PLANS.BASE, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });
}

// 2️⃣ Get All Plans (Public/Admin)
export async function getAllPlans(
  params: { page?: number; limit?: number } = {},
  token?: string
) {
  const { page = 1, limit = 10 } = params;
  const queryString = buildQueryString({ page, limit });
  return serverFetch<Plan[]>(
    `${API_ENDPOINTS.PLANS.BASE}${queryString}`,
    token
      ? {
          headers: { Authorization: `Bearer ${token}` },
        }
      : undefined
  );
}

// 3️⃣ Get Single Plan by ID
export async function getPlanById(id: string, token?: string) {
  return serverFetch<Plan>(`${API_ENDPOINTS.PLANS.BASE}/${id}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
}

// 4️⃣ Update Plan (Admin)
export async function updatePlan(
  id: string,
  payload: Partial<PlanPayload>,
  token?: string
) {
  return serverFetch<{ message: string; plan: Plan }>(
    `${API_ENDPOINTS.PLANS.BASE}/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    }
  );
}

// 5️⃣ Delete Plan (Admin)
export async function deletePlan(id: string, token?: string) {
  return serverFetch<{ message: string; plan: Plan }>(
    `${API_ENDPOINTS.PLANS.BASE}/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
}

// 🧩 UI Transformation Utilities
export interface UIPlan {
  id: number;
  name: string;
  price: string;
  duration: string;
  status: "active" | "inactive";
}

/**
 * Transform backend Plan → UI format
 */
export function transformPlanToUI(plan: Plan, index?: number): UIPlan {
  const price = `${(plan.priceCents / 100).toFixed(2)} ${plan.currency}`;
  const duration = `Every ${plan.intervalCount} ${plan.billingInterval}${
    plan.intervalCount > 1 ? "s" : ""
  }`;

  const numericId =
    parseInt(plan._id.slice(-8), 16) || (index !== undefined ? index + 4000 : 0);

  return {
    id: numericId,
    name: plan.name,
    price,
    duration,
    status: plan.isActive ? "active" : "inactive",
  };
}

/**
 * Transform array of Plans → UI array
 */
export function transformPlansToUI(plans: Plan[]): UIPlan[] {
  return plans.map(transformPlanToUI);
}
