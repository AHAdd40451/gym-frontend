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
//   console.log("new",token);

//   return res.data.data;
// };
import axios from "axios";
import { env } from "../../config/env";

export const getAdminDashboard = async (token: string) => {
  try {
    // 🔍 Token check
    console.log("🔑 TOKEN SENT:", token);

    const res = await axios.get(
      `${env.API_BASE_URL}/admin/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 🔍 Full response check
    console.log("✅ RESPONSE:", res);
    console.log("📦 DATA:", res.data);

    return res.data.data;
  } catch (error: any) {
    // ❌ Error debugging
    console.log("❌ ERROR STATUS:", error.response?.status);
    console.log("❌ ERROR DATA:", error.response?.data);
    console.log("❌ ERROR MESSAGE:", error.message);

    throw error;
  }
};