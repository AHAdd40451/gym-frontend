import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  muscleGroup: string[];
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy?: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type CreateExercisePayload = Pick<
  Exercise,
  "name" | "description" | "muscleGroup" | "equipment" | "difficulty"
> & {
  videoUrl?: string;
  imageUrl?: string;
};

type UpdateExercisePayload = Partial<CreateExercisePayload> & {
  isActive?: boolean;
};

/* =========================
   Create Exercise (Staff/Admin)
========================= */
export async function createExercise(data: CreateExercisePayload, token?: string) {
  return serverFetch<{
    success: boolean;
    message?: string;
    data?: Exercise;
  }>(API_ENDPOINTS.EXERCISES.BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
}

/* =========================
   Get Exercises (Auth required)
========================= */
export async function getExercises(
  params: {
    isActive?: boolean;
    difficulty?: string;
    equipment?: string;
    muscleGroup?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
  token?: string
) {
  const query = buildQueryString(params);

  return serverFetch<{
    success: boolean;
    count?: number;
    data: Exercise[];
  }>(`${API_ENDPOINTS.EXERCISES.BASE}${query}`, {}, token);
}

/* =========================
   Get Single Exercise
========================= */
export async function getExerciseById(id: string, token?: string) {
  return serverFetch<{
    success: boolean;
    data: Exercise;
  }>(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`, {}, token);
}

/* =========================
   Update Exercise (Staff/Admin)
========================= */
export async function updateExercise(id: string, data: UpdateExercisePayload, token?: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided.",
      data: null
    };
  }

  return serverFetch<{
    success: boolean;
    message?: string;
    data?: Exercise;
  }>(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

/* =========================
   Delete Exercise (Staff/Admin)
========================= */
export async function deleteExercise(id: string, token?: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided."
    };
  }

  return serverFetch<{
    success: boolean;
    message: string;
  }>(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
}
