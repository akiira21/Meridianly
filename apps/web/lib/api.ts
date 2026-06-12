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

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  energy_level: "low" | "medium" | "high";
  context: "desk" | "phone" | "errands" | "quick" | "any";
  status: "active" | "completed" | "snoozed" | "archived" | "parking_lot";
  snoozed_until: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  completed_at: string | null;
  done_for_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoListResponse {
  items: Todo[];
  total: number;
}

export interface TodoCreatePayload {
  title: string;
  description?: string | null;
  energy_level?: "low" | "medium" | "high";
  context?: "desk" | "phone" | "errands" | "quick" | "any";
  estimated_minutes?: number | null;
  status?: "active" | "completed" | "snoozed" | "archived" | "parking_lot";
}

export interface TodoUpdatePayload {
  title?: string;
  description?: string | null;
  energy_level?: "low" | "medium" | "high";
  context?: "desk" | "phone" | "errands" | "quick" | "any";
  estimated_minutes?: number | null;
  status?: "active" | "completed" | "snoozed" | "archived" | "parking_lot";
  snoozed_until?: string | null;
  done_for_day?: boolean;
}

export interface TodoStats {
  total: number;
  by_status: Record<string, number>;
  completed_today: number;
  active: number;
  snoozed: number;
  parking_lot: number;
}

export interface DoneForDayResponse {
  completed_today: number;
  carried_forward: number;
  archived: number;
  message: string;
}

export interface AITodoRequest {
  prompt: string;
}

export interface AITodoItem {
  title: string;
  description: string | null;
  energy_level: "low" | "medium" | "high";
  context: "desk" | "phone" | "errands" | "quick" | "any";
  estimated_minutes: number | null;
}

export interface AITodoResponse {
  todos: AITodoItem[];
  created_count: number;
}

export interface UserPlanInfo {
  plan: string;
  ai_requests_used: number;
  ai_requests_limit: number;
  ai_requests_remaining: number;
  ai_requests_reset_at: string | null;
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

  // Todos
  getTodos: (params?: Record<string, string | boolean | undefined>) =>
    axiosInstance.get<TodoListResponse>("/api/v1/todos", { params }),

  getTodo: (id: number) =>
    axiosInstance.get<Todo>(`/api/v1/todos/${id}`),

  createTodo: (payload: TodoCreatePayload) =>
    axiosInstance.post<Todo>("/api/v1/todos", payload),

  updateTodo: (id: number, payload: TodoUpdatePayload) =>
    axiosInstance.patch<Todo>(`/api/v1/todos/${id}`, payload),

  deleteTodo: (id: number) =>
    axiosInstance.delete(`/api/v1/todos/${id}`),

  snoozeTodo: (id: number, duration: string) =>
    axiosInstance.post<Todo>(`/api/v1/todos/${id}/snooze`, { duration }),

  startFocus: (id: number) =>
    axiosInstance.post<Todo>(`/api/v1/todos/${id}/focus/start`),

  endFocus: (id: number, actual_minutes: number) =>
    axiosInstance.post<Todo>(`/api/v1/todos/${id}/focus/end`, { actual_minutes }),

  promoteTodo: (id: number) =>
    axiosInstance.post<Todo>(`/api/v1/todos/${id}/promote`),

  getStats: () =>
    axiosInstance.get<TodoStats>("/api/v1/todos/stats"),

  getSuggestedTodos: () =>
    axiosInstance.get<{ suggested: Todo[]; hour: number | null }>("/api/v1/todos/suggest"),

  getParkingLot: () =>
    axiosInstance.get<TodoListResponse>("/api/v1/todos/parking-lot"),

  doneForDay: (carryForward: boolean = true) =>
    axiosInstance.post<DoneForDayResponse>("/api/v1/todos/done-for-day", {
      carry_forward_unfinished: carryForward,
    }),

  reactivateSnoozed: () =>
    axiosInstance.post<{ reactivated: number; items: Todo[] }>("/api/v1/todos/reactivate-snoozed"),

  // AI
  generateTodos: (prompt: string) =>
    axiosInstance.post<AITodoResponse>("/api/v1/ai/todos", { prompt }),

  getPlanInfo: () =>
    axiosInstance.get<UserPlanInfo>("/api/v1/ai/plan"),
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
