import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { User, AuthToken } from "../types/auth.types";

interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  setToken: (token: AuthToken) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
        }),

      setToken: (token) =>
        set((state) => {
          state.token = token;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      updateUser: (partial) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, partial);
          }
        }),
    })),
    {
      name: "saas_auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);