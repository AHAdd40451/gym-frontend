import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: any) => {
    // Get token from localStorage (client-side) or cookies (server-side)
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Client-side
      token = localStorage.getItem('authToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

export default apiClient;
