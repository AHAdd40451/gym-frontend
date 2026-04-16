import apiClient from "../../axios";
import { API_ENDPOINTS } from "../../constants/constants";
import { handleApiResponse, handleApiError } from "../../../utils";

// ======================
// 🔹 Types
// ======================

export interface ApiMessageResponse {
  message: string;
}

export interface FollowCountsResponse {
  followers: number;
  following: number;
}

// ======================
// 🔹 Follow API
// ======================

export const followApi = {
  followUser: async (id: string): Promise<ApiMessageResponse> => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.USERS.BASE}/follow/${id}`
      );

      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  unfollowUser: async (id: string): Promise<ApiMessageResponse> => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.USERS.BASE}/unfollow/${id}`
      );

      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getMyCounts: async (): Promise<FollowCountsResponse> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.USERS.BASE}/counts`
      );

      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};