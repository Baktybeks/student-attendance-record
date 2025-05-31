import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Действия
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
  logout: () => void;

  // Вспомогательные геттеры
  isAuthenticated: () => boolean;
  isActive: () => boolean;
  getRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user: User | null) => {
        set({ user, error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearUser: () => {
        set({ user: null, error: null });
      },

      logout: () => {
        set({ user: null, error: null, isLoading: false });
      },

      // Геттеры
      isAuthenticated: () => {
        const { user } = get();
        return !!user;
      },

      isActive: () => {
        const { user } = get();
        return user?.isActive === true;
      },

      getRole: () => {
        const { user } = get();
        return user?.role || null;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
