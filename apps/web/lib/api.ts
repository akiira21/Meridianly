import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("meridian_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest.url?.includes("/refresh")) {
      try {
        const { data } = await axios.post<AuthTokenResponse>(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("meridian_access_token", data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("meridian_access_token");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name?: string | null;
  avatar_url?: string | null;
}

export interface RegisterResponse {
  username: string;
  email: string;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export const api = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<LoginResponse>("/api/v1/auth/login", payload),

  register: (payload: RegisterPayload) =>
    axiosInstance.post<RegisterResponse>("/api/v1/auth/register", payload),

  refresh: () =>
    axiosInstance.post<AuthTokenResponse>("/api/v1/auth/refresh"),

  logout: () =>
    axiosInstance.post<{ message: string }>("/api/v1/auth/logout"),
};

export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("meridian_access_token", token);
  }
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("meridian_access_token");
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("meridian_access_token");
  }
  return null;
}
