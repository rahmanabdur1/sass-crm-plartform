import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Theme } from "../types/common.types";

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  activeModal: string | null;
  pageLoading: boolean;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarMobile: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  setPageLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    immer((set) => ({
      theme: "dark",
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      activeModal: null,
      pageLoading: false,

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
          document.documentElement.setAttribute("data-theme", theme);
        }),

      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          state.theme = next;
          document.documentElement.setAttribute("data-theme", next);
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        }),

      setSidebarMobile: (open) =>
        set((state) => {
          state.sidebarMobileOpen = open;
        }),

      openModal: (id) =>
        set((state) => {
          state.activeModal = id;
        }),

      closeModal: () =>
        set((state) => {
          state.activeModal = null;
        }),

      setPageLoading: (loading) =>
        set((state) => {
          state.pageLoading = loading;
        }),
    })),
    { name: "saas_ui", partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }) }
  )
);