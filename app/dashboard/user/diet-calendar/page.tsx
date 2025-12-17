import { UserDietCalendarClient } from "./calendar-client";
import { DietPlanPreset, mockUserDietPlan } from "./mock-data";
import { formatDateKey } from "@/lib/utils/date";

// Server component - no API call here, let client handle auth-dependent fetch
export default function UserDietCalendarPage() {
  const todayKey = formatDateKey(new Date());
  const fallbackPreset = mockUserDietPlan[todayKey] ?? mockUserDietPlan.default;

  return (
    <UserDietCalendarClient
      initialTodayPreset={fallbackPreset}
      initialTodayError={null}
    />
  );
}
