import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface MealEntry {
  type: string;
  description: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  note: string;
}

export interface MealPlanPayload {
  user: string;
  date: string;
  day: string;
  meals: MealEntry[];
  supplements: string[];
  dietaryInstructions: string;
  waterIntake: number;
  status: string;
}

export async function createMealPlan(payload: MealPlanPayload, token?: string) {
  return serverFetch(
    API_ENDPOINTS.MEALS.BASE,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    }
  );
}

export interface MealPlanDocument extends MealPlanPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getUserMeals(
  userId: string,
  params: { date?: string } = {},
  token?: string
) {
  const query = params.date ? `?date=${encodeURIComponent(params.date)}` : "";
  return serverFetch<{
    success?: boolean;
    count?: number;
    meals?: MealPlanDocument[];
    data?: MealPlanDocument[];
  }>(`${API_ENDPOINTS.MEALS.BY_USER(userId)}${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

export async function getAllMeals(
  params: { user?: string; startDate?: string; endDate?: string } = {},
  token?: string
) {
  const searchParams = new URLSearchParams();
  if (params.user) searchParams.append("user", params.user);
  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);
  const qs = searchParams.toString();
  const url = `${API_ENDPOINTS.MEALS.BASE}`;
  return serverFetch<{
    success?: boolean;
    count?: number;
    meals?: MealPlanDocument[];
    data?: MealPlanDocument[];
  }>(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}


