import apiClient from './axios';
import { API_ENDPOINTS } from './constants';
import { handleApiResponse, handleApiError } from './utils';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  PasswordChangeData, 
  ForgotPasswordData, 
  ResetPasswordData,
  User 
} from '../types/models';

// Auth API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const result = handleApiResponse(response);


      console.log('Login response: for the user', result);
      return result?.data?.data; // Access the nested data property
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      const result = handleApiResponse(response);
      return result.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string; refreshToken: string }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      const result = handleApiResponse(response);
      return result.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      const result = handleApiResponse(response);
      return result.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      const result = handleApiResponse(response);
      return result.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change password
  changePassword: async (passwordData: PasswordChangeData): Promise<void> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', data);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Resend verification email
  resendVerification: async (): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/resend-verification');
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
