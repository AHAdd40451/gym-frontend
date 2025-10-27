// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile"
  },

  // User endpoints
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password"
  },

  // Product endpoints
  PRODUCTS: {
    BASE: "/products",
    // SEARCH: "/products/search",
    // BY_CATEGORY: "/products/category"
  },

  // Category endpoints
  CATEGORIES: {
    BASE: "/categories"
  },

  // Order endpoints
  ORDERS: {
    BASE: "/orders",
    BY_USER: "/orders/my-orders"
  }, 
};
