import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface Exercise {
  _id: string;
  title: string;
  points: string[]; // exactly 4
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================
   Create Exercise (Admin)
========================= */
export async function createExercise(
  data: {
    title: string;
    points: string[];
    videoUrl: string;
  },
  token?: string
) {
  return serverFetch<{
    success: boolean;
    message?: string;
    data?: Exercise;
  }>(API_ENDPOINTS.EXERCISES.BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  });
}

/* =========================
   Get All Exercises (Public)
========================= */
export async function getExercises(params: { page?: number; limit?: number } = {}) {
  const query = buildQueryString(params);

  return serverFetch<{
    success: boolean;
    count?: number;
    data: Exercise[];
  }>(`${API_ENDPOINTS.EXERCISES.BASE}${query}`);
}

/* =========================
   Get Single Exercise
========================= */
export async function getExerciseById(id: string) {
  return serverFetch<{
    success: boolean;
    data: Exercise;
  }>(`${API_ENDPOINTS.EXERCISES.BASE}/${id}`);
}

/* =========================
   Update Exercise (Admin)
========================= */
export async function updateExercise(
  id: string,
  data: {
    title?: string;
    points?: string[];
    videoUrl?: string;
  },
  token?: string
) {
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
   Delete Exercise (Admin)
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
