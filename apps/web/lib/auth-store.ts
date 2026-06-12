import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAccessToken, clearAccessToken } from "./api";

export interface User {
  user_id: string;
  email: string;
  username: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.login({ email, password });
          setAccessToken(data.access_token);
          set({
            user: {
              user_id: data.user_id,
              email,
              username: email.split("@")[0],
            },
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Login failed. Please try again.";
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          await api.register(payload);
          // Auto-login after registration
          const { data } = await api.login({
            email: payload.email,
            password: payload.password,
          });
          setAccessToken(data.access_token);
          set({
            user: {
              user_id: data.user_id,
              email: payload.email,
              username: payload.username,
            },
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Registration failed. Please try again.";
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await api.logout();
        } catch {
          // Ignore logout errors
        } finally {
          clearAccessToken();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      },

      initialize: () => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("meridian_access_token")
            : null;
        if (token) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: "meridian-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
