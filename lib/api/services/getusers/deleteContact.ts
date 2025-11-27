import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

interface DeleteContactResponse {
  success: boolean;
  message: string;
}

export async function deleteContact(token: string, contactId: string): Promise<boolean> {
  try {
    const endpoint = `${API_ENDPOINTS.CONTECTS.BASE}/${contactId}`;

    const response = await serverFetch<DeleteContactResponse>(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

   
    return response.data?.success || false;

  } catch (error) {
    console.error("Delete contact error:", error);
    return false;
  }
}
