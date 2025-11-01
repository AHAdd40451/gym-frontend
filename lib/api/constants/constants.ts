// export const API_ENDPOINTS = {
//   AUTH: {
//     LOGIN: "/auth/login",
//     REGISTER: "/auth/register",
//     LOGOUT: "/auth/logout",
//     REFRESH: "/auth/refresh",
//     PROFILE: "/auth/profile",
//   },

//  USERS:  {
//   BASE: "/users",
//   PROFILE: "/users/profile",
//   UPDATE_PROFILE: "/users/profile",
//   CHANGE_PASSWORD: "/users/change-password",
//   BY_ROLE: "/users/role", // ✅ role ab query string se bhejna
// },


//   // Product endpoints
//   PRODUCTS: {
//     BASE: "/products",
//   },

//   // Category endpoints
//   CATEGORIES: {
//     BASE: "/categories",
//   },

//   // Order endpoints
//   ORDERS: {
//     BASE: "/orders",
//     BY_USER: "/orders/my-orders",
//   },

//   // Subscription endpoints
//   SUBSCRIPTIONS: {
//     BASE: "/subscriptions",
//     BY_USER: "/subscriptions/user",
//   },

//   // Plan endpoints
//   PLANS: {
//     BASE: "/plans",
//     BY_ID: (id: string) => `/plans/${id}`,
//   },
// } as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },

  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    BY_ROLE: "/users/role", // ✅ role ab query string se bhejna
  },

  PRODUCTS: {
    BASE: "/products",
  },

  CATEGORIES: {
    BASE: "/categories",
  },

  ORDERS: {
    BASE: "/orders",
    BY_USER: "/orders/my-orders",
  },

  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
    BY_USER: "/subscriptions/user", // ✅ static
    BY_USER_ID: (userId: string) => `/subscriptions/user/${userId}`, // ✅ user-specific
  },

  PLANS: {
    BASE: "/plans",
    BY_ID: (id: string) => `/plans/${id}`,
  },

  TRANSACTIONS: {
    BASE: "/subscriptions",
    BY_USER: (userId: string) => `/subscriptions/user/${userId}`, // ✅ get all transactions by user ID
    BY_SUBSCRIPTION: (subscriptionId: string) => `/subscription/${subscriptionId}`, // ✅ get transactions by subscription
  },
} as const;
