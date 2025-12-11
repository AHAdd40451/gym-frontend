import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Create Category (Admin)
export async function createCategory(name: string, token?: string) {
  return serverFetch<{ success: boolean; message: string; category: Category }>(
    API_ENDPOINTS.CATEGORIES.BASE,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({ name })
    }
  );
}

// Get All Categories (Public)
export async function getCategories(params: { page?: number; limit?: number } = {}) {
  const { page, limit } = params;
  const query = buildQueryString({ page, limit });
  return serverFetch<{ success: boolean; count?: number; categories: Category[] }>(
    `${API_ENDPOINTS.CATEGORIES.BASE}${query}`
  );
}

// Get Single Category (Public)
export async function getCategoryById(id: string) {
  return serverFetch<{ success: boolean; category: Category }>(
    `${API_ENDPOINTS.CATEGORIES.BASE}/${id}`
  );
}

// Update Category (Admin)
export async function updateCategory(id: string, name: string, token?: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided.",
      category: null
    };
  }

  return serverFetch<{ success: boolean; message: string; category: Category }>(
    `${API_ENDPOINTS.CATEGORIES.BASE}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    }
  );
}

// Delete Category (Admin)
export async function deleteCategory(id: string, token?: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided."
    };
  }

  return serverFetch<{ success: boolean; message: string }>(
    `${API_ENDPOINTS.CATEGORIES.BASE}/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );
}