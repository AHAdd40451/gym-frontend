// lib/api/services/biometricDevices/biometricDevices.ts

import apiClient from "../../axios";
import { API_ENDPOINTS } from "../../constants/constants";
import { handleApiError } from "../../../utils";

export type BiometricConnectionMode = "push" | "pull";

export interface BiometricDevice {
  _id: string;
  serialNumber?: string | null;
  gymId: string;
  name?: string;
  connectionMode: BiometricConnectionMode;
  ip?: string | null;
  port?: number;
  commKey?: number;
  isActive: boolean;
  lastSeenAt?: string | null;
  lastPushedAt?: string | null;
  lastSyncStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterDevicePayload {
  name?: string;
  connectionMode: BiometricConnectionMode;
  serialNumber?: string;
  ip?: string;
  port?: number;
  commKey?: number;
}

export interface SyncResult {
  created: number;
  duplicate: number;
  skipped: number;
  total: number;
}

export const biometricDevicesApi = {
  getAll: async (): Promise<BiometricDevice[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BIOMETRIC_DEVICES.BASE);
      return response.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  register: async (payload: RegisterDevicePayload): Promise<BiometricDevice> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BIOMETRIC_DEVICES.BASE, payload);
      return response.data?.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (
    id: string,
    payload: Partial<RegisterDevicePayload> & { isActive?: boolean }
  ): Promise<BiometricDevice> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BIOMETRIC_DEVICES.BY_ID(id), payload);
      return response.data?.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.BIOMETRIC_DEVICES.BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  },

  sync: async (id: string): Promise<SyncResult> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BIOMETRIC_DEVICES.SYNC(id));
      return response.data?.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
