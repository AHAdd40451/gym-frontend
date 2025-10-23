import apiClient from './axios';
import { API_ENDPOINTS } from './constants';
import { handleApiResponse, handleApiError, buildQueryString } from './utils';
import type { 
  User, 
  UserFilters 
} from '../types/models';

// User API functions
export const usersApi = {
  // Get all users
  getAll: async (filters?: UserFilters): Promise<{ data: User[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search users
  search: async (query: string, filters?: UserFilters): Promise<{ data: User[]; pagination?: any }> => {
    try {
      const searchParams = { search: query, ...filters };
      const queryString = buildQueryString(searchParams);
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/search${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get active users
  getActive: async (filters?: UserFilters): Promise<{ data: User[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString({ ...filters, status: 'active' }) : '?status=active';
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/active${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get users by role
  getByRole: async (role: string, filters?: UserFilters): Promise<{ data: User[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString({ ...filters, role }) : `?role=${role}`;
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/role/${role}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create user
  create: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS.BASE, userData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, userData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.USERS.BASE}/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user status
  updateStatus: async (id: string, status: string): Promise<User> => {
    try {
      const response = await apiClient.patch(`${API_ENDPOINTS.USERS.BASE}/${id}/status`, { status });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk update users
  bulkUpdate: async (userIds: string[], updateData: Partial<User>): Promise<User[]> => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.USERS.BASE}/bulk`, { 
        userIds, 
        updateData 
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user statistics
  getStats: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/${id}/stats`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user dashboard data
  getDashboardData: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/${id}/dashboard`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload profile image
  uploadProfileImage: async (id: string, file: File): Promise<{ imageUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post(`${API_ENDPOINTS.USERS.BASE}/${id}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete profile image
  deleteProfileImage: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.USERS.BASE}/${id}/profile-image`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user activity log
  getActivityLog: async (id: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<any[]> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/${id}/activity${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export user data
  exportData: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}/${id}/export`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
