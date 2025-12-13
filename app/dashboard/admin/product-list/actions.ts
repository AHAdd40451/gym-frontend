"use server";

import { cookies } from "next/headers";
import { deleteProduct, updateProduct, ProductPayload } from "@/lib/api/services/product/product";

export async function deleteProductAction(productId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    const response = await deleteProduct(productId, token);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      message: response.data?.message || "Product deleted successfully",
    };
  } catch (error: any) {
    console.error("Delete product action error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product",
    };
  }
}

export async function updateProductAction(productId: string, updates: Partial<ProductPayload>) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    const response = await updateProduct(productId, updates, token);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      message: response.data?.message || "Product updated successfully",
      product: response.data?.product,
    };
  } catch (error: any) {
    console.error("Update product action error:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

