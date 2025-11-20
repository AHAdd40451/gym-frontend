import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
  timeout: 10000,
});

// Automatically attach token (if available)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
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
