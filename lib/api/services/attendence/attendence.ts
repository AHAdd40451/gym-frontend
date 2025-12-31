// import { serverFetch } from "../../api-actions/server";
// import { API_ENDPOINTS } from "../../constants/constants";


// export async function runDailyAttendanceJob(userId: string, token?: string) {
//   const authToken = token || localStorage.getItem("authToken");

//   if (!authToken) {
//     throw new Error("Access denied. No token provided.");
//   }

//   return serverFetch<{ message: string }>(
//     `${API_ENDPOINTS.ATTENDANCE.RUN_DAILY}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${authToken}`,
//       },
//       body: JSON.stringify({ userId }),
//     }
//   );
// }

// export async function getAttendanceByUserId(userId: string, token?: string) {
//   const authToken = token || localStorage.getItem("authToken");

//   if (!authToken) {
//     throw new Error("Access denied. No token provided.");
//   }

//   return serverFetch<any>(
//     `${API_ENDPOINTS.ATTENDANCE.GET_BY_USER}/${userId}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${authToken}`,
//       },
//     }
//   );
// }
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

export async function getAttendanceByUserId(userId: string, token?: string) {
  const authToken = token || localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("Access denied. No token provided.");
  }

  return serverFetch<any>(
    `${API_ENDPOINTS.ATTENDANCE.GET_BY_USER}/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
}

// ✅ New function to create/mark attendance manually
export async function createAttendance(
  userId: string,
  date: string, // YYYY-MM-DD
  status: "present" | "absent",
  token?: string
) {
  const authToken = token || localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("Access denied. No token provided.");
  }

  return serverFetch<{ message: string }>(
    `${API_ENDPOINTS.ATTENDANCE.CREATE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId, date, status }),
    }
  );
}
