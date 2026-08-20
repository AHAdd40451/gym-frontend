// Environment configuration
export const env = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5003/api',
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Gym Management Dashboard',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  APP_ENVIRONMENT: process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'development',
  
  // Authentication
  JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET || 'your-jwt-secret-key',
  TOKEN_STORAGE_KEY: process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'gym_auth_token',
  REFRESH_TOKEN_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'gym_refresh_token',
  
  // Email Configuration
  EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  
  // Google Analytics
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
  
  // Social Media
  FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
  
  // Payment Gateway
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  
  // Maps
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'),
  ALLOWED_FILE_TYPES: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ],
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_OFFLINE_MODE: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  
  // Development
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  MOCK_API: process.env.NEXT_PUBLIC_MOCK_API === 'true',
};

// Validate required environment variables
export const validateEnv = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
  }

  return missingVars.length === 0;
};

// Check if we're in development mode
export const isDevelopment = env.APP_ENVIRONMENT === 'development';

// Check if we're in production mode
export const isProduction = env.APP_ENVIRONMENT === 'production';
