import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export async function deleteUser(token: string, userId: string): Promise<boolean> {
  try {
    const endpoint = `${API_ENDPOINTS.USERS.BASE}/${userId}`;
    // Example result: http://localhost:3001/api/users/6925e42b67562bcf646ee329

    const response = await serverFetch<DeleteUserResponse>(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data?.success || false;

  } catch (error) {
    console.error("Delete user error:", error);
    return false;
  }
}
