import axios from "axios";
import { env } from "../../config/env";

export const getAdminDashboard = async (token: string) => {
  const res = await axios.get(
    `${env.API_BASE_URL}/admin/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data;
};
