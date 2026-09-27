import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken,setAccessToken } from "./token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Required so the browser attaches the httpOnly refresh cookie on
  // cross-origin requests to /api/auth/refresh/ (and clears it on logout).
  withCredentials: true,
});

// Attach the in-memory access token to every request, if we have one.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extend axios's request config to mark a request as "already retried",
// so a repeated 401 after a refresh attempt doesn't loop forever.
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// Only one refresh call should be in flight at a time, even if several
// requests 401 at once — they all await the same promise.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/api/auth/refresh/")
      .then((res) => {
        const newToken: string = res.data.access;
        setAccessToken(newToken);
        return newToken;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes("/api/auth/");
    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);