import axios from "axios";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";

const isLocal =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname));

const BASE_URL = isLocal
  ? "http://127.0.0.1:8000"
  : (import.meta.env.VITE_API_URL || "https://bhanova.onrender.com");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — accounts for Render cold start on first authenticated request
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (!navigator.onLine) {
      toast.error("No internet connection.");
      return Promise.reject(new Error("Offline"));
    }

    const token = localStorage.getItem("atlas_one_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (
      !error.response &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    const status = error.response?.status;

    switch (status) {
      case 400:
        toast.error(error.response?.data?.detail || "Bad Request");
        break;

      case 401:
        useAuthStore.getState().logout();
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        break;

      case 403:
        toast.error("Access denied.");
        break;

      case 404:
        toast.error("Resource not found.");
        break;

      default:
        if (status && status >= 500) {
          toast.error("Internal server error.");
        } else if (!error.response) {
          toast.error(
            "Unable to connect to the server. Please try again later."
          );
        }
    }

    return Promise.reject(error);
  }
);

export default api;