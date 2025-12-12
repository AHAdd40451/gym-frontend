import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface SubCategory {
  _id: string;
  name: string;
  category: string | {
    _id: string;
    name: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Create SubCategory (Admin)
export async function createSubCategory(
  data: { name: string; category: string; description?: string },
  token?: string
) {
  return serverFetch<{ success: boolean; message: string; data: SubCategory }>(
    API_ENDPOINTS.SUBCATEGORIES.BASE,
    {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(data)
    }
  );
}

// Get All SubCategories (Public)
export async function getSubCategories(params: { page?: number; limit?: number } = {}) {
  const { page, limit } = params;
  const query = buildQueryString({ page, limit });
  return serverFetch<SubCategory[]>(
    `${API_ENDPOINTS.SUBCATEGORIES.BASE}${query}`
  );
}

// Get Single SubCategory (Public)
export async function getSubCategoryById(id: string) {
  return serverFetch<SubCategory>(
    `${API_ENDPOINTS.SUBCATEGORIES.BASE}/${id}`
  );
}

// Get SubCategories by Category ID (Public)
export async function getSubCategoriesByCategory(categoryId: string) {
  return serverFetch<{ success: boolean; subcategories: SubCategory[] }>(
    `${API_ENDPOINTS.SUBCATEGORIES.BASE}/category/${categoryId}`
  );
}

// Update SubCategory (Admin)
export async function updateSubCategory(
  id: string,
  data: { name?: string; category?: string; description?: string },
  token?: string
) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided.",
      data: null
    };
  }

  return serverFetch<{ success: boolean; message: string; data: SubCategory }>(
    `${API_ENDPOINTS.SUBCATEGORIES.BASE}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
}

// Delete SubCategory (Admin)
export async function deleteSubCategory(id: string, token?: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided."
    };
  }

  return serverFetch<{ success: boolean; message: string }>(
    `${API_ENDPOINTS.SUBCATEGORIES.BASE}/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );
}