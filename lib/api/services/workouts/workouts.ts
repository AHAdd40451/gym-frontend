import apiClient from "../../axios";
import { API_ENDPOINTS } from "../../constants/constants";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | string;
export type WorkoutType = "Strength" | "Cardio" | "Weight Loss" | string;

export type WorkoutExerciseInput = {
  exerciseId: string;
  sets: number;
  reps: number;
  restInSeconds: number;
  order: number;
};

export type WorkoutExercise = WorkoutExerciseInput & {
  _id?: string;
};

export type Workout = {
  _id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  type: WorkoutType;
  day?: string;
  isActive: boolean;
  isPublic: boolean;
  exercises: WorkoutExercise[];
  createdBy?: string | { _id: string; firstName?: string; lastName?: string; email?: string };
  createdAt: string;
  updatedAt: string;
};

export async function fetchWorkouts(params: Record<string, string | boolean | undefined> = {}) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUTS.BASE, { params });
  return res.data as { success: boolean; data: Workout[]; count?: number };
}

export async function fetchWorkoutById(id: string) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUTS.BY_ID(id));
  return res.data as { success: boolean; data: Workout };
}

export async function createWorkout(data: {
  title: string;
  description?: string;
  difficulty: Difficulty;
  type: WorkoutType;
  day: string;
  exercises: WorkoutExerciseInput[];
}) {
  const res = await apiClient.post(API_ENDPOINTS.WORKOUTS.BASE, data);
  return res.data as { success: boolean; message?: string; data: Workout };
}

export async function updateWorkout(
  workoutId: string,
  data: {
    title: string;
    description?: string;
    difficulty: Difficulty;
    type: WorkoutType;
    day: string;
    exercises: WorkoutExerciseInput[];
  }
) {
  const res = await apiClient.put(API_ENDPOINTS.WORKOUTS.BY_ID(workoutId), data);
  return res.data as { success: boolean; message?: string; data?: Workout };
}

export async function fetchWorkoutsByDay(day: string) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUTS.BY_DAY(day));
  return res.data as { success: boolean; data: Workout[]; count?: number; day?: string };
}

export async function checkoutWorkout(workoutId: string, selectedExercises?: WorkoutExercise[] | string[]) {
  // Check if it's an array of exercise objects or just IDs (for backward compatibility)
  const isExerciseObjects = selectedExercises && selectedExercises.length > 0 && typeof selectedExercises[0] === 'object' && 'exerciseId' in selectedExercises[0];
  
  const payload: any = {
    workoutId
  };
  
  if (isExerciseObjects) {
    // Explicitly map to ensure correct structure with numbers (not arrays)
    payload.selectedExercises = (selectedExercises as WorkoutExercise[]).map(ex => ({
      exerciseId: ex.exerciseId,
      sets: typeof ex.sets === 'number' ? ex.sets : Number(ex.sets) || 0, // Ensure it's a number
      reps: typeof ex.reps === 'number' ? ex.reps : Number(ex.reps) || 0, // Ensure it's a number
      restInSeconds: typeof ex.restInSeconds === 'number' ? ex.restInSeconds : Number(ex.restInSeconds) || 0, // Ensure it's a number
      order: typeof ex.order === 'number' ? ex.order : Number(ex.order) || 0 // Ensure it's a number
    }));
    
    console.log('API Service - Sending payload:', JSON.stringify(payload, null, 2));
  } else {
    // Backward compatibility: if it's an array of strings, treat as IDs
    payload.selectedExerciseIds = selectedExercises as string[];
  }
  
  const res = await apiClient.post(API_ENDPOINTS.WORKOUTS.CHECKOUT, payload);
  return res.data as { success: boolean; message?: string; data: any };
}

export async function assignWorkout(workoutId: string, userIds: string[]) {
  const res = await apiClient.post(API_ENDPOINTS.WORKOUTS.ASSIGN(workoutId), { userIds });
  return res.data as { success: boolean; message?: string; data?: Workout };
}

export async function deleteWorkout(workoutId: string) {
  const res = await apiClient.delete(API_ENDPOINTS.WORKOUTS.BY_ID(workoutId));
  return res.data as { success: boolean; message?: string };
}

export async function fetchWorkoutStats(params: Record<string, string> = {}) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUT_LOGS.STATS, { params });
  return res.data as { success: boolean; data: any };
}

export async function fetchTodayUserActivities(params: { userId?: string; date?: string } = {}) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUT_LOGS.TODAY, { params });
  return res.data as { success: boolean; data: any[]; count?: number; date?: string };
}

export async function fetchWorkoutLogs(params: Record<string, string | undefined> = {}) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUT_LOGS.BASE, { params });
  return res.data as { success: boolean; data: any[]; count?: number };
}
export async function fetchUserWorkoutHistory(userId: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const res = await apiClient.get(
    API_ENDPOINTS.WORKOUT_LOGS.HISTORY(userId)
  );

  return res.data as {
    success: boolean;
    count?: number;
    data: any[];
  };
}

// Check if a workout was already completed today by the current user
export async function checkWorkoutCompletedToday(workoutId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const res = await apiClient.get(API_ENDPOINTS.WORKOUT_LOGS.BASE, {
      params: {
        workoutId,
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      }
    });
    
    const data = res.data as { success: boolean; data: any[]; count?: number };
    
    // Check if there's at least one log for this workout today
    // The API automatically filters by current user for regular users
    return data.success && data.data && data.data.length > 0;
  } catch (error) {
    console.error('Error checking workout completion:', error);
    return false; // Return false on error to allow workout
  }
}