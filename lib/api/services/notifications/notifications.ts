// lib/api/services/notifications/notifications.ts

import apiClient from '../../axios';
import { API_ENDPOINTS } from '../../constants/constants';
import { handleApiResponse, handleApiError, buildQueryString } from '../../../utils';

// Types
export interface NotificationSettings {
  _id?: string;
  userId: string;
  type: 'all' | 'mentions' | 'none';
  mobile?: boolean;
  communication_emails?: boolean;
  social_emails?: boolean;
  marketing_emails?: boolean;
  security_emails: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type NotificationDevicePlatform = 'android' | 'ios' | 'web';

export interface NotificationDeviceRegistration {
  token: string;
  platform: NotificationDevicePlatform;
}

// Notification API functions
export const notificationsApi = {
  // Get user's notification settings
  getSettings: async (userId: string): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.GET_SETTINGS}/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update notification settings
  updateSettings: async (
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.NOTIFICATIONS.UPDATE_SETTINGS}/${userId}`,
        settings
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create notification settings (if not exists)
  createSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all notifications for a user
  getAll: async (
    userId: string,
    filters?: NotificationFilters
  ): Promise<{ data: Notification[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}/${userId}${queryString}`
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get unread count
  getUnreadCount: async (userId: string): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${userId}/unread-count`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Send notification (admin only)
  send: async (notificationData: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }): Promise<Notification> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, notificationData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register device token for push notifications
  registerDevice: async (
    payload: NotificationDeviceRegistration
  ): Promise<{ success: boolean; status: number; data: any }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.DEVICES_REGISTER, payload);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Mark notification as read
  markAsRead: async (
    notificationId: string,
    payload?: { userId?: string; isRead?: boolean }
  ): Promise<Notification> => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
        payload
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { userId });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete a notification
  delete: async (notificationId: string): Promise<void> => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete all notifications
  deleteAll: async (userId: string): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL, {
        data: { userId }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get notification preferences (alternative endpoint)
  getPreferences: async (userId: string): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.PREFERENCES}/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update notification preferences
  updatePreferences: async (
    userId: string,
    preferences: Partial<NotificationSettings>
  ): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.NOTIFICATIONS.PREFERENCES}/${userId}`,
        preferences
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
