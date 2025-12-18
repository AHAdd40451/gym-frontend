import { cookies } from "next/headers";
import { UserDietCalendarClient } from "./calendar-client";
import { DietPlanPreset, mockUserDietPlan } from "./mock-data";
import { getAllMeals, MealPlanDocument } from "@/lib/api/services/meals/meals";
import { toIsoUtcStartFromDate, transformMealPlanToPreset } from "./utils";
import { formatDateKey } from "@/lib/utils/date";

export default async function UserDietCalendarPage() {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("authToken")?.value || cookieStore.get("token")?.value || "";
  const storedUser = cookieStore.get("currentUser")?.value;

  let userId = "";
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      userId = parsed?.id || parsed?._id || parsed?.userId || "";
    } catch {
      userId = "";
    }
  }

  const todayDate = new Date();
  const todayKey = formatDateKey(todayDate);

  let todayPreset: DietPlanPreset | null = null;
  let todayError: string | null = null;

  try {
    if (!userId || !storedToken) {
      todayPreset = mockUserDietPlan[todayKey] ?? mockUserDietPlan.default;
    } else {
      const startIso = toIsoUtcStartFromDate(todayDate);
      const res = await getAllMeals({ user: userId, startDate: startIso, endDate: startIso }, storedToken);
      const payload = (res as any)?.data ?? res;
      const list: MealPlanDocument[] = payload?.meals ?? payload?.data ?? (Array.isArray(payload) ? payload : []);

      if (Array.isArray(list) && list.length > 0) {
        todayPreset = transformMealPlanToPreset(list[0]);
        todayError = (res as any)?.error || null;
      } else {
        todayPreset = mockUserDietPlan[todayKey] ?? mockUserDietPlan.default;
        todayError = "No plan found for today.";
      }
    }
  } catch (err: any) {
    console.error("Failed to load today diet plan", err);
    todayPreset = mockUserDietPlan[todayKey] ?? mockUserDietPlan.default;
    todayError = "Unable to load plan.";
  }

  return <UserDietCalendarClient initialTodayPreset={todayPreset} initialTodayError={todayError} />;
}
