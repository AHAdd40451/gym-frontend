import { serverFetch, buildQueryString } from "./server";
import { API_ENDPOINTS } from "./constants";

// Types aligned with Gym-management backend Order model
export type OrderStatus = "Pending" | "Confirmed" | "Cancelled";

export interface OrderItem {
  productId?: string;
  title?: string;
  price?: number;
  size?: string;
  color?: string;
  image?: string;
  quantity?: number;
}

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface OrderPayload {
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  discountRef?: string | null;
  delivery?: number;
  total: number;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name?: string; email?: string };
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountRef: string | null;
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// 1) Create Order (User)
export async function createOrder(payload: OrderPayload, token?: string) {
  return serverFetch<{ message: string; order: Order }>(API_ENDPOINTS.ORDERS.BASE, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(payload)
  });
}

// 2) Get All Orders (Admin)
export async function getAllOrders(params: { page?: number; limit?: number } = {}, token?: string) {
  const { page = 1, limit = 10 } = params;
  const queryString = buildQueryString({ page, limit });
  return serverFetch<Order[]>(`${API_ENDPOINTS.ORDERS.BASE}${queryString}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
}

// 3) Get My Orders (User)
export async function getMyOrders(token?: string) {
  return serverFetch<Order[]>(API_ENDPOINTS.ORDERS.BY_USER, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
}

// 4) Get Single Order (Admin)
export async function getOrderById(id: string, token?: string) {
  return serverFetch<Order>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
}

// 5) Update Order Status (Admin)
export async function updateOrderStatus(id: string, status: OrderStatus, token?: string) {
  return serverFetch<{ message: string; order: Order }>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify({ status })
  });
}

// 6) Delete/Cancel Order (User)
export async function deleteOrder(id: string, token?: string) {
  return serverFetch<{ message: string; order: Order }>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
}
