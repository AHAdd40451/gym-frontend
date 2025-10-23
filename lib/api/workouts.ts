import apiClient from './axios';
import { API_ENDPOINTS } from './constants';
import { handleApiResponse, handleApiError, buildQueryString } from './utils';
import type { 
  Workout, 
  WorkoutStats, 
  WorkoutFilters,
  ExerciseSet 
} from '../types/models';

// Workout API functions
export const workoutsApi = {
  // Get all workouts
  getAll: async (filters?: WorkoutFilters): Promise<{ data: Workout[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.WORKOUTS.BASE}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get workout by ID
  getById: async (id: string): Promise<Workout> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get workouts by user
  getByUser: async (userId: string, filters?: WorkoutFilters): Promise<{ data: Workout[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.WORKOUTS.BY_USER}/${userId}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get workouts by date
  getByDate: async (date: string, filters?: WorkoutFilters): Promise<{ data: Workout[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString({ ...filters, date }) : `?date=${date}`;
      const response = await apiClient.get(`${API_ENDPOINTS.WORKOUTS.BY_DATE}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create workout
  create: async (workoutData: Partial<Workout>): Promise<Workout> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WORKOUTS.BASE, workoutData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update workout
  update: async (id: string, workoutData: Partial<Workout>): Promise<Workout> => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}`, workoutData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete workout
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Start workout
  start: async (id: string): Promise<Workout> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}/start`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Pause workout
  pause: async (id: string): Promise<Workout> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}/pause`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Resume workout
  resume: async (id: string): Promise<Workout> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}/resume`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Complete workout
  complete: async (id: string): Promise<Workout> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WORKOUTS.BASE}/${id}/complete`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get workout statistics
  getStats: async (userId?: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<WorkoutStats> => {
    try {
      const queryString = buildQueryString({ userId, ...filters });
      const response = await apiClient.get(`${API_ENDPOINTS.WORKOUTS.STATS}${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add exercise to workout
  addExercise: async (workoutId: string, exercise: ExerciseSet): Promise<Workout> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WORKOUTS.BASE}/${workoutId}/exercises`, exercise);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update exercise in workout
  updateExercise: async (workoutId: string, exerciseId: string, exercise: Partial<ExerciseSet>): Promise<Workout> => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.WORKOUTS.BASE}/${workoutId}/exercises/${exerciseId}`, exercise);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove exercise from workout
  removeExercise: async (workoutId: string, exerciseId: string): Promise<Workout> => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.WORKOUTS.BASE}/${workoutId}/exercises/${exerciseId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get workout templates
  getTemplates: async (filters?: { type?: string; difficulty?: string }): Promise<{ data: Workout[]; pagination?: any }> => {
    try {
      const queryString = filters ? buildQueryString(filters) : '';
      const response = await apiClient.get(`${API_ENDPOINTS.WORKOUTS.BASE}/templates${queryString}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create workout from template
  createFromTemplate: async (templateId: string, workoutData?: Partial<Workout>): Promise<Workout> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WORKOUTS.BASE}/templates/${templateId}/create`, workoutData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
