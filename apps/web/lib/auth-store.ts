import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAccessToken, clearAccessToken } from "./api";

export interface User {
  user_id: string;
  email: string;
  username: string;
  name?: string | null;
  avatar_url?: string | null;
  plan?: string;
  role?: string;
  ai_requests_used?: number;
  ai_requests_reset_at?: string | null;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  rehydrated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: { name?: string | null; avatar_url?: string | null }) => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      rehydrated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchProfile: async () => {
        try {
          const { data } = await api.getMe();
          set({
            user: {
              user_id: String(data.user_id),
              email: data.email,
              username: data.username,
              name: data.name,
              avatar_url: data.avatar_url,
              plan: data.plan,
              role: data.role,
              ai_requests_used: data.ai_requests_used,
              ai_requests_reset_at: data.ai_requests_reset_at,
              created_at: data.created_at,
            },
          });
        } catch {
          // silently fail
        }
      },

      updateProfile: async (payload) => {
        try {
          const { data } = await api.updateMe(payload);
          set({
            user: {
              user_id: String(data.user_id),
              email: data.email,
              username: data.username,
              name: data.name,
              avatar_url: data.avatar_url,
              plan: data.plan,
              role: data.role,
              ai_requests_used: data.ai_requests_used,
              ai_requests_reset_at: data.ai_requests_reset_at,
              created_at: data.created_at,
            },
          });
        } catch (err) {
          throw err;
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.login({ email, password });
          setAccessToken(data.access_token);
          // Fetch full profile
          try {
            const { data: profile } = await api.getMe();
            set({
              user: {
                user_id: String(profile.user_id),
                email: profile.email,
                username: profile.username,
                name: profile.name,
                avatar_url: profile.avatar_url,
                plan: profile.plan,
                role: profile.role,
                ai_requests_used: profile.ai_requests_used,
                ai_requests_reset_at: profile.ai_requests_reset_at,
                created_at: profile.created_at,
              },
              isAuthenticated: true,
              loading: false,
            });
          } catch {
            // fallback to basic info
            set({
              user: {
                user_id: data.user_id,
                email,
                username: email.split("@")[0],
              },
              isAuthenticated: true,
              loading: false,
            });
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Login failed. Please try again.";
          set({ error: message, loading: false });
          throw err instanceof Error ? err : new Error(message);
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
          // Fetch full profile
          try {
            const { data: profile } = await api.getMe();
            set({
              user: {
                user_id: String(profile.user_id),
                email: profile.email,
                username: profile.username,
                name: profile.name,
                avatar_url: profile.avatar_url,
                plan: profile.plan,
                role: profile.role,
                ai_requests_used: profile.ai_requests_used,
                ai_requests_reset_at: profile.ai_requests_reset_at,
                created_at: profile.created_at,
              },
              isAuthenticated: true,
              loading: false,
            });
          } catch {
            // fallback
            set({
              user: {
                user_id: data.user_id,
                email: payload.email,
                username: payload.username,
              },
              isAuthenticated: true,
              loading: false,
            });
          }
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Registration failed. Please try again.";
          set({ error: message, loading: false });
          throw err instanceof Error ? err : new Error(message);
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
    }),
    {
      name: "meridian-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rehydrated = true;
        }
      },
    }
  )
);
