import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";


export async function runDailyAttendanceJob(userId: string, token?: string) {
  const authToken = token || localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("Access denied. No token provided.");
  }

  return serverFetch<{ message: string }>(
    `${API_ENDPOINTS.ATTENDANCE.RUN_DAILY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId }),
    }
  );
}
