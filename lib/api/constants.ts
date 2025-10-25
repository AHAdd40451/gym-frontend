// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
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

  // Gym/Workout endpoints
  WORKOUTS: {
    BASE: "/workouts",
    BY_USER: "/workouts/user",
    BY_DATE: "/workouts/date",
    STATS: "/workouts/stats"
  },

  // Exercise endpoints
  EXERCISES: {
    BASE: "/exercises",
    BY_CATEGORY: "/exercises/category",
    SEARCH: "/exercises/search"
  },

  // Membership endpoints
  MEMBERSHIPS: {
    BASE: "/memberships",
    PLANS: "/memberships/plans",
    CURRENT: "/memberships/current"
  },

  // Schedule endpoints
  SCHEDULES: {
    BASE: "/schedules",
    BY_TRAINER: "/schedules/trainer",
    BY_DATE: "/schedules/date"
  },

  // Trainer endpoints
  TRAINERS: {
    BASE: "/trainers",
    AVAILABLE: "/trainers/available",
    SPECIALIZATIONS: "/trainers/specializations"
  },

  // Blog/News endpoints
  BLOGS: {
    BASE: "/blogs",
    FEATURED: "/blogs/featured",
    BY_CATEGORY: "/blogs/category"
  },

  // Contact endpoints
  CONTACT: {
    BASE: "/contact",
    INQUIRY: "/contact/inquiry",
    FEEDBACK: "/contact/feedback"
  },

  // Product endpoints
  PRODUCTS: {
    BASE: "/products",
    SEARCH: "/products/search",
    BY_CATEGORY: "/products/category"
  },

  // Category endpoints
  CATEGORIES: {
    BASE: "/categories"
  },

  // Attendance endpoints
  ATTENDANCE: {
    BASE: "/attendance",
    BY_USER: "/attendance/user",
    BY_DATE: "/attendance/date"
  },

  // Order endpoints
  ORDERS: {
    BASE: "/orders",
    BY_USER: "/orders/user"
  },

  // Card endpoints
  CARDS: {
    BASE: "/cards",
    BY_USER: "/cards/user"
  },

  // Service endpoints
  SERVICES: {
    BASE: "/services"
  },

  // Dashboard endpoints
  DASHBOARD: {
    STATS: "/dashboard/stats",
    REVENUE: "/dashboard/revenue",
    ATTENDANCE: "/dashboard/attendance"
  }
};

// Query Keys
export const QUERY_KEYS = {
  // Auth queries
  AUTH: {
    PROFILE: ["auth", "profile"],
    USER: ["auth", "user"]
  },

  // User queries
  USERS: {
    ALL: ["users"],
    PROFILE: (id: string) => ["users", "profile", id],
    LIST: (params: any) => ["users", "list", params]
  },

  // Workout queries
  WORKOUTS: {
    ALL: ["workouts"],
    BY_USER: (userId: string) => ["workouts", "user", userId],
    BY_DATE: (date: string) => ["workouts", "date", date],
    STATS: (userId: string) => ["workouts", "stats", userId],
    DETAIL: (id: string) => ["workouts", "detail", id]
  },

  // Exercise queries
  EXERCISES: {
    ALL: ["exercises"],
    BY_CATEGORY: (category: string) => ["exercises", "category", category],
    SEARCH: (query: string) => ["exercises", "search", query]
  },

  // Membership queries
  MEMBERSHIPS: {
    ALL: ["memberships"],
    PLANS: ["memberships", "plans"],
    CURRENT: (userId: string) => ["memberships", "current", userId]
  },

  // Schedule queries
  SCHEDULES: {
    ALL: ["schedules"],
    BY_TRAINER: (trainerId: string) => ["schedules", "trainer", trainerId],
    BY_DATE: (date: string) => ["schedules", "date", date]
  },

  // Trainer queries
  TRAINERS: {
    ALL: ["trainers"],
    AVAILABLE: ["trainers", "available"],
    SPECIALIZATIONS: ["trainers", "specializations"]
  },

  // Blog queries
  BLOGS: {
    ALL: ["blogs"],
    FEATURED: ["blogs", "featured"],
    BY_CATEGORY: (category: string) => ["blogs", "category", category],
    DETAIL: (id: string) => ["blogs", "detail", id]
  }
};

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Request Timeouts
export const TIMEOUTS = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000
};
