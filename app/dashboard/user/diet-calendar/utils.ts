import { DietPlanPreset } from "./mock-data";
import { MealPlanDocument } from "@/lib/api/services/meals/meals";
import { formatDateKey } from "@/lib/utils/date";

// Convert a MealPlanDocument coming from the API into the UI-friendly DietPlanPreset
export function transformMealPlanToPreset(plan: MealPlanDocument): DietPlanPreset {
  const mealsObj: Record<string, any> = {};

  (plan.meals || []).forEach((meal) => {
    const id =
      meal.type === "mid_morning_snack"
        ? "mid-morning"
        : meal.type === "evening_snack"
          ? "evening"
          : meal.type || "meal";

    mealsObj[id] = {
      description: meal.description || "",
      calories: (meal.calories || 0).toString(),
      protein: (meal.protein || 0).toString(),
      carbs: (meal.carbs || 0).toString(),
      fats: (meal.fat || 0).toString(),
      notes: meal.note || ""
    };
  });

  const totals = (plan.meals || []).reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories || 0);
      acc.protein += Number(meal.protein || 0);
      acc.carbs += Number(meal.carbs || 0);
      acc.fats += Number(meal.fat || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const supplementsKnown = {
    multivitamin: false,
    omega3: false,
    protein: false,
    custom: [] as string[]
  };

  (plan.supplements || []).forEach((supplement) => {
    const low = (supplement || "").toLowerCase();
    if (low.includes("multivitamin")) supplementsKnown.multivitamin = true;
    else if (low.includes("omega")) supplementsKnown.omega3 = true;
    else if (low.includes("protein")) supplementsKnown.protein = true;
    else supplementsKnown.custom.push(supplement);
  });

  // Normalize water intake to liters for display. Incoming values may be stored in
  // milliliters (e.g., 2500) or already in liters (e.g., 2.5). Convert numbers
  // above 20 to liters, otherwise keep as-is.
  const rawWater = Number(plan.waterIntake || 0);
  const waterLiters = rawWater > 20 ? (rawWater / 1000).toFixed(1) : rawWater.toString();

  return {
    dietData: {
      meals: mealsObj,
      waterIntake: waterLiters,
      supplements: supplementsKnown,
      specialInstructions: plan.dietaryInstructions || "",
      status: plan.status || "planned"
    },
    summary: {
      targetCalories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      water: `${waterLiters}L`,
      goal: "Daily diet plan",
      coachNote: plan.dietaryInstructions || "",
      recovery: ""
    },
    timeline: (plan.meals || []).map((meal) => ({
      time: "-", // backend has no time field for now
      title: (meal.type || "Meal").replace(/_/g, " "),
      details: meal.description || "",
      calories: Number(meal.calories || 0),
      protein: Number(meal.protein || 0),
      carbs: Number(meal.carbs || 0),
      fats: Number(meal.fat || 0),
      badge: meal.type
    }))
  };
}

// Safely read current user's id from localStorage
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "";
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) return "";
  try {
    const parsed = JSON.parse(storedUser);
    return parsed?.id || parsed?._id || parsed?.userId || "";
  } catch {
    return "";
  }
}

// Return an ISO string anchored to UTC midnight for the given date key (YYYY-MM-DD)
export function toIsoUtcStartOfDay(dateKey: string): string {
  const date = new Date(dateKey);
  if (isNaN(date.getTime())) return dateKey;
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  return utcDate.toISOString();
}

// Build a date key from Date in local time then convert to UTC ISO (helps avoid tz drift)
export function toIsoUtcStartFromDate(date: Date): string {
  const key = formatDateKey(date);
  return toIsoUtcStartOfDay(key);
}

// Get ISO range for a full local day (start/end) to query date ranges safely
export function getLocalDayRangeIso(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString()
  };
}

// Parse a YYYY-MM-DD string as a local date (avoids UTC interpretation)
export function parseLocalDateKey(dateKey?: string): Date {
  if (!dateKey || typeof dateKey !== "string") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  const parts = dateKey.split("-");
  if (parts.length !== 3) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  const [y, m, d] = parts.map((v) => Number(v));
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

