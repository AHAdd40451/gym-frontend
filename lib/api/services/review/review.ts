// lib/api/services/review/review.ts
import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface Review {
  _id: string;
  product: string | { _id: string; name: string; image: string };
  user: string | { _id: string; name: string; email: string };
  name: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  success: boolean;
  count: number;
  averageRating: string;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: Review[];
}

// Get All Reviews for a Product (Public)
export async function getProductReviews(productId: string) {
  return serverFetch<ProductReviewsResponse>(
    `${API_ENDPOINTS.REVIEWS.BASE}/product/${productId}`
  );
}

// Get All Reviews (Admin)
export async function getAllReviews(token: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided.",
      reviews: []
    };
  }

  return serverFetch<{ success: boolean; count: number; reviews: Review[] }>(
    API_ENDPOINTS.REVIEWS.BASE,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

// Delete Review (Admin only)
export async function deleteReview(id: string, token: string) {
  if (!token) {
    return {
      success: false,
      message: "Access denied. No token provided."
    };
  }

  return serverFetch<{ success: boolean; message: string }>(
    `${API_ENDPOINTS.REVIEWS.BASE}/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );
}