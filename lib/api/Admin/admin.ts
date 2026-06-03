// import axios from "axios";
// import { env } from "../../config/env";

// export const getAdminDashboard = async (token: string) => {
//   const res = await axios.get(
//     `${env.API_BASE_URL}/admin/dashboard`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   console.log("new", token);

//   return res.data.data;
// };

import axios from "axios";
import { env } from "../../config/env";

const redirectToSubscriptionRequired = (error: any) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  if (
    typeof window !== "undefined" &&
    (status === 402 || code === "SUBSCRIPTION_REQUIRED")
  ) {
    window.location.replace("/subscription-required");
    return true;
  }

  return false;
};

export const getAdminDashboard = async (token: string) => {
  try {
    console.log("TOKEN SENT:", token);

    const res = await axios.get(`${env.API_BASE_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("ADMIN DASHBOARD RESPONSE:", res.data);

    return res.data.data;
  } catch (error: any) {
    console.log("ADMIN DASHBOARD ERROR STATUS:", error.response?.status);
    console.log("ADMIN DASHBOARD ERROR DATA:", error.response?.data);
    console.log("ADMIN DASHBOARD ERROR MESSAGE:", error.message);

    const redirected = redirectToSubscriptionRequired(error);

    if (redirected) {
      return null;
    }

    throw error;
  }
};