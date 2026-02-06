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

export async function fetchWorkoutsByDay(day: string) {
  const res = await apiClient.get(API_ENDPOINTS.WORKOUTS.BY_DAY(day));
  return res.data as { success: boolean; data: Workout[]; count?: number; day?: string };
}

export async function checkoutWorkout(workoutId: string, selectedExerciseIds?: string[]) {
  const res = await apiClient.post(API_ENDPOINTS.WORKOUTS.CHECKOUT, {
    workoutId,
    selectedExerciseIds
  });
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
// export async function fetchUserWorkoutHistory() {
//   const user = localStorage.getItem("user");
//   const parsedUser = user ? JSON.parse(user) : null;
//   const userId = parsedUser?._id;

//   if (!userId) {
//     throw new Error("User ID not found in localStorage");
//   }

//   const res = await apiClient.get(
//     API_ENDPOINTS.WORKOUT_LOGS.HISTORY(userId)
//   );

//   return res.data as {
//     success: boolean;
//     count?: number;
//     data: any[];
//   };
// }

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
