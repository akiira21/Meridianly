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

    const isAuthEndpoint =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register");

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/refresh") &&
      !isAuthEndpoint
    ) {
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
        // Refresh failed — clear token and redirect to login
        localStorage.removeItem("meridian_access_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Extract server error message for better frontend errors
    const responseData = error.response?.data as Record<string, unknown> | undefined;
    let message = error.message;
    if (responseData) {
      if (typeof responseData.detail === "string") {
        message = responseData.detail;
      } else if (typeof responseData.detail === "object" && responseData.detail !== null) {
        const detailObj = responseData.detail as Record<string, unknown>;
        if (typeof detailObj.message === "string") {
          message = detailObj.message;
        } else if (typeof detailObj.code === "string") {
          message = detailObj.code;
        }
      } else if (typeof responseData.message === "string") {
        message = responseData.message;
      }
    }
    const enhancedError = new Error(message);
    (enhancedError as Error & { statusCode?: number }).statusCode = error.response?.status;
    return Promise.reject(enhancedError);
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

export interface WaterIntake {
  id: number;
  user_id: number;
  amount_ml: number;
  logged_at: string;
}

export interface WaterIntakeListResponse {
  items: WaterIntake[];
  total: number;
}

export interface WaterDailySummary {
  goal_ml: number;
  consumed_ml: number;
  remaining_ml: number;
  percentage: number;
}

export interface WaterTodayResponse {
  intakes: WaterIntake[];
  summary: WaterDailySummary;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string | null;
  is_pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteListResponse {
  items: Note[];
  total: number;
}

export interface NoteCreatePayload {
  title: string;
  content?: string | null;
  is_pinned?: boolean;
  color?: string;
}

export interface NoteUpdatePayload {
  title?: string;
  content?: string | null;
  is_pinned?: boolean;
  color?: string;
}

export interface FoodPreset {
  id: number;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_system: boolean;
  user_id: number | null;
  created_at: string;
}

export interface FoodPresetListResponse {
  items: FoodPreset[];
  total: number;
}

export interface FoodPresetCreatePayload {
  name: string;
  category?: string;
  calories_per_100g: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
}

export interface FoodLog {
  id: number;
  user_id: number;
  food_preset_id: number | null;
  food_name: string;
  amount_g: number;
  calculated_calories: number;
  calculated_protein: number;
  calculated_carbs: number;
  calculated_fat: number;
  logged_at: string;
}

export interface FoodLogListResponse {
  items: FoodLog[];
  total: number;
}

export interface FoodLogCreatePayload {
  food_preset_id?: number | null;
  food_name: string;
  amount_g: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface DailyNutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entry_count: number;
}

export interface TodayFoodResponse {
  logs: FoodLog[];
  summary: DailyNutritionSummary;
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

  // Water
  logWater: (amount_ml: number) =>
    axiosInstance.post<WaterIntake>("/api/v1/water/log", { amount_ml }),

  getWaterToday: () =>
    axiosInstance.get<WaterTodayResponse>("/api/v1/water/today"),

  getWaterHistory: (limit?: number, offset?: number) =>
    axiosInstance.get<WaterIntakeListResponse>("/api/v1/water/history", {
      params: { limit, offset },
    }),

  deleteWaterIntake: (id: number) =>
    axiosInstance.delete(`/api/v1/water/${id}`),

  // Notes
  createNote: (payload: NoteCreatePayload) =>
    axiosInstance.post<Note>("/api/v1/notes", payload),

  getNotes: (search?: string) =>
    axiosInstance.get<NoteListResponse>("/api/v1/notes", {
      params: search ? { search } : undefined,
    }),

  updateNote: (id: number, payload: NoteUpdatePayload) =>
    axiosInstance.patch<Note>(`/api/v1/notes/${id}`, payload),

  deleteNote: (id: number) =>
    axiosInstance.delete(`/api/v1/notes/${id}`),

  togglePinNote: (id: number) =>
    axiosInstance.post<Note>(`/api/v1/notes/${id}/pin`),

  // Food
  getFoodPresets: (category?: string) =>
    axiosInstance.get<FoodPresetListResponse>("/api/v1/food/presets", {
      params: category ? { category } : undefined,
    }),

  createFoodPreset: (payload: FoodPresetCreatePayload) =>
    axiosInstance.post<FoodPreset>("/api/v1/food/presets", payload),

  deleteFoodPreset: (id: number) =>
    axiosInstance.delete(`/api/v1/food/presets/${id}`),

  logFood: (payload: FoodLogCreatePayload) =>
    axiosInstance.post<FoodLog>("/api/v1/food/log", payload),

  getFoodToday: () =>
    axiosInstance.get<TodayFoodResponse>("/api/v1/food/today"),

  getFoodHistory: (limit?: number, offset?: number) =>
    axiosInstance.get<FoodLogListResponse>("/api/v1/food/history", {
      params: { limit, offset },
    }),

  deleteFoodLog: (id: number) =>
    axiosInstance.delete(`/api/v1/food/log/${id}`),
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
