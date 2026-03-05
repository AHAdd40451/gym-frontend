import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";

const BACKEND_BASE_URL = env.API_BASE_URL || "";

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
});

// Automatically attach token (if available)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
