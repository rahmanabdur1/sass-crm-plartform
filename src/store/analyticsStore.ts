import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AnalyticsSnapshot, AIInsight, KPIData } from "@/types/analytics.types";

interface AnalyticsState {
  snapshots: AnalyticsSnapshot[];
  insights: AIInsight[];
  kpis: KPIData[];
  isLoading: boolean;
  lastRefreshed: number | null;

  setSnapshots: (snapshots: AnalyticsSnapshot[]) => void;
  setInsights: (insights: AIInsight[]) => void;
  setKPIs: (kpis: KPIData[]) => void;
  addSnapshot: (snapshot: AnalyticsSnapshot) => void;
  updateTodayRevenue: (delta: number) => void;
  setLoading: (loading: boolean) => void;
  setLastRefreshed: (ts: number) => void;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  immer((set) => ({
    snapshots: [],
    insights: [],
    kpis: [],
    isLoading: false,
    lastRefreshed: null,

    setSnapshots: (snapshots) =>
      set((state) => { state.snapshots = snapshots; }),

    setInsights: (insights) =>
      set((state) => { state.insights = insights; }),

    setKPIs: (kpis) =>
      set((state) => { state.kpis = kpis; }),

    addSnapshot: (snapshot) =>
      set((state) => { state.snapshots.push(snapshot); }),

    updateTodayRevenue: (delta) =>
      set((state) => {
        const today = new Date().toISOString().slice(0, 10);
        const idx = state.snapshots.findIndex((s) => s.date === today);
        if (idx !== -1) state.snapshots[idx].revenue += delta;
      }),

    setLoading: (loading) =>
      set((state) => { state.isLoading = loading; }),

    setLastRefreshed: (ts) =>
      set((state) => { state.lastRefreshed = ts; }),

    reset: () =>
      set((state) => {
        state.snapshots = [];
        state.insights = [];
        state.kpis = [];
        state.lastRefreshed = null;
      }),
  }))
);