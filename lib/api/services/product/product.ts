import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

//___________________________Usage example_____________________________________________________

// import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "@/lib/api/product";

// Get products filtered by category
// const { data, error } = await getAllProducts({ category: "Supplements" });

// Create product (requires admin token)
// const { data, error } = await createProduct({
//   name: "Protein Powder",
//   price: 49.99,
//   description: "High quality whey protein",
//   category: "categoryId"
// }, token);

//______________________________________________________________________________________________

export interface Category {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  ingredients?: string;
  servingSize?: string;
  stock: {
    quantity: number;
    inStock: boolean;
  };
  image: string;
  category: string | Category;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  description: string;
  image?: string;
  stock?: number;
  ingredients?: string;
  servingSize?: string;
  category: string;
}

// Create Product (Admin)
export async function createProduct(payload: ProductPayload, token?: string) {
  return serverFetch<{ success: boolean; message: string; product: Product }>(API_ENDPOINTS.PRODUCTS.BASE, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(payload)
  });
}

// Get All Products (Public, with optional category filter)
export async function getAllProducts(params: { category?: string } = {}) {
  const query = buildQueryString({ category: params.category });
  return serverFetch<{ success: boolean; count?: number; products: Product[] }>(
    `${API_ENDPOINTS.PRODUCTS.BASE}${query}`
  );
}

// Get Single Product (Public)
export async function getProductById(id: string) {
  return serverFetch<{ success: boolean; product: Product }>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
}

// Update Product (Admin)
export async function updateProduct(id: string, updates: Partial<ProductPayload>, token?: string) {
  return serverFetch<{ success: boolean; message: string; product: Product }>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(updates)
  });
}

// Delete Product (Admin)
export async function deleteProduct(id: string, token?: string) {
  return serverFetch<{ success: boolean; message: string }>(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
}
