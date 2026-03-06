export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile"
  },

  NOTIFICATIONS: {
    BASE: '/notifications',
    SETTINGS: '/notifications/settings',
    GET_SETTINGS: '/notifications/settings', // GET user's notification settings
    UPDATE_SETTINGS: '/notifications/settings', // PUT update settings
    PREFERENCES: '/notifications/preferences', // GET/PUT preferences
    SEND: '/notifications/send', // POST send notification
    DEVICES_REGISTER: '/notifications/devices/register', // POST register device token
    MARK_READ: (id: string) => `/notifications/${id}/read`, // PUT mark as read
    MARK_ALL_READ: '/notifications/mark-all-read', // PUT mark all as read
    DELETE: (id: string) => `/notifications/${id}`, // DELETE specific notification
    DELETE_ALL: '/notifications/delete-all', // DELETE all notifications
  },

  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    BY_ROLE: "/users/role",
    TRAINER: "/users/trainer"
  },

  PRODUCTS: {
    BASE: "/products"
  },

  CATEGORIES: {
    BASE: "/categories"
  },

  SUBCATEGORIES: {
    BASE: "/subcategories"
  },

  REVIEWS: {
    BASE: "/reviews"
  },

  ORDERS: {
    BASE: "/orders",
    BY_USER: "/orders/my-orders"
  },

  // ✅ UPDATED SUBSCRIPTIONS SECTION
  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
    CREATE: "/subscriptions",
    GET_ALL: "/subscriptions",
    GET_BY_ID: (id: string) => `/subscriptions/${id}`,
    UPDATE: (id: string) => `/subscriptions/${id}`,
    CANCEL: (id: string) => `/subscriptions/cancel/${id}`,
    DELETE: (id: string) => `/subscriptions/${id}`,
    
    // User-specific subscriptions
    BY_USER: "/subscriptions/user",
    BY_USER_ID: (userId: string) => `/subscriptions/user/${userId}`,
    
    // ✅ Main endpoint for billing page (returns user + subscriptions + transactions)
    USER_DETAILS: (userId: string) => `/subscriptions/${userId}/details`,
    
    // Transaction management
    ADD_TRANSACTION: "/subscriptions/addTransaction",
    USER_TRANSACTIONS: (userId: string) => `/subscriptions/user/${userId}/transactions`,
    
    // Other
    SUBSCRIBED_USERS: "/subscriptions/subscribed-users",

    // Trainer subscription status (for profile: show Subscribed vs Subscribe)
    TRAINER_STATUS: (trainerId: string) => `/subscriptions/trainer/${trainerId}/status`,
  },

  PLANS: {
    BASE: "/plans",
    BY_ID: (id: string) => `/plans/${id}`
  },

  CONTECTS: {
    BASE: "/contect"
  },

  // ✅ UPDATED TRANSACTIONS SECTION (for backward compatibility)
  TRANSACTIONS: {
    BASE: "/subscriptions",
    BY_USER: (userId: string) => `/subscriptions/user/${userId}/transactions`,
    BY_SUBSCRIPTION: (subscriptionId: string) => `/subscription/${subscriptionId}`
  },

  MEALS: {
    BASE: "/meals",
    BY_USER: (userId: string) => `/meals/user/${userId}`
  },

  ATTENDANCE: {
    BASE: "/attendance",
    CREATE: "/attendance/mark",
    RUN_DAILY: "/attendance/mark",
    ALL: "/attendance/all",
    GET_BY_USER: "/attendance/user",
    CHECK_TODAY: "/attendance/today",

  },
  EXERCISES: {
    // v2 endpoints (JWT protected)
    BASE: "/exercises-new",
    ALL: "/exercises-new"
  },
  WORKOUTS: {
    BASE: "/workouts",
    BY_ID: (id: string) => `/workouts/${id}`,
    ASSIGN: (id: string) => `/workouts/${id}/assign`,
    ASSIGNED: "/workouts/assigned",
    BY_DAY: (day: string) => `/workouts/day/${day}`,
    CHECKOUT: "/workouts/checkout"
  },
  WORKOUT_LOGS: {
    BASE: "/workout-logs",
    STATS: "/workout-logs/stats",
    TODAY: "/workout-logs/today",
      HISTORY: (userId: string) => `/workouts/user/${userId}`,

  },

  STRIPE: {
    CREATE_TRAINER_CHECKOUT_SESSION: "/stripe/create-trainer-checkout-session",
  },
} as const;
