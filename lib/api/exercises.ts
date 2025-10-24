import apiClient from './axios';
import { API_ENDPOINTS } from './constants';
import { handleApiResponse, handleApiError, buildQueryString } from './utils';
import type { 
  Exercise, 
  ExerciseFilters 
} from '../types/models';

// Exercise API functions
export const exercisesApi = {
  // Get all exercises
  getAll: async (filters?: ExerciseFilters): Promise<{ data: Exercise[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BASE}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get exercise by ID
  getById: async (id: string): Promise<Exercise> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get exercises by category
  getByCategory: async (category: string, filters?: ExerciseFilters): Promise<{ data: Exercise[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BY_CATEGORY}/${category}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search exercises
  search: async (query: string, filters?: ExerciseFilters): Promise<{ data: Exercise[]; pagination?: any }> => {
    try {
      const searchParams = { search: query, ...filters };
      const queryString = buildQueryString(searchParams);
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.SEARCH}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create exercise
  create: async (exerciseData: Partial<Exercise>): Promise<Exercise> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EXERCISES.BASE, exerciseData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update exercise
  update: async (id: string, exerciseData: Partial<Exercise>): Promise<Exercise> => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`, exerciseData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete exercise
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get similar exercises
  getSimilar: async (exerciseId: string, limit = 5): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BASE}/${exerciseId}/similar?limit=${limit}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get popular exercises
  getPopular: async (limit = 10): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BASE}/popular?limit=${limit}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get exercise statistics
  getStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BASE}/stats`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Rate exercise
  rate: async (exerciseId: string, rating: number): Promise<Exercise> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.EXERCISES.BASE}/${exerciseId}/rate`, { rating });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add to favorites
  addToFavorites: async (exerciseId: string): Promise<void> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.EXERCISES.BASE}/${exerciseId}/favorite`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove from favorites
  removeFromFavorites: async (exerciseId: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.EXERCISES.BASE}/${exerciseId}/favorite`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's favorite exercises
  getFavorites: async (): Promise<Exercise[]> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.EXERCISES.BASE}/favorites`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Increment usage count
  incrementUsage: async (exerciseId: string): Promise<void> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.EXERCISES.BASE}/${exerciseId}/usage`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
