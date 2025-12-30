import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";

// Use Next.js API proxy to avoid CORS issues
const USE_PROXY = true; // Set to true to use Next.js API proxy
const PROXY_BASE_URL = '/api/proxy';
const BACKEND_BASE_URL = env.API_BASE_URL || "";

const apiClient = axios.create({
  baseURL: USE_PROXY ? PROXY_BASE_URL : BACKEND_BASE_URL,
  withCredentials: !USE_PROXY, // Don't use withCredentials for proxy
  timeout: 30000, // Increased timeout for proxy
});

// Automatically attach token (if available) and convert backend URLs to proxy URLs
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If using proxy, convert backend URL to proxy URL
    if (USE_PROXY && config.url) {
      // If URL starts with backend base URL, extract the path
      if (config.url.startsWith(BACKEND_BASE_URL)) {
        const backendPath = config.url.replace(BACKEND_BASE_URL, '').replace(/^\//, '');
        config.url = backendPath;
      } else if (config.url.startsWith('http')) {
        // If it's a full URL, extract the path after /api
        const urlObj = new URL(config.url);
        const pathAfterApi = urlObj.pathname.replace(/^\/api/, '').replace(/^\//, '');
        config.url = pathAfterApi;
      }
      // If URL is already relative, use it as is
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — token expired or invalid.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
