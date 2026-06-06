import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AuditLog } from "@/db/schema";

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  filter: { actorId?: string; action?: string; dateFrom?: number; dateTo?: number };

  setLogs: (logs: AuditLog[]) => void;
  addLog: (log: AuditLog) => void;
  setFilter: (filter: Partial<AuditState["filter"]>) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;
  getFilteredLogs: () => AuditLog[];
}

export const useAuditStore = create<AuditState>()(
  immer((set, get) => ({
    logs: [],
    isLoading: false,
    filter: {},

    setLogs: (logs) =>
      set((state) => { state.logs = logs; }),

    addLog: (log) =>
      set((state) => { state.logs.unshift(log); }),

    setFilter: (filter) =>
      set((state) => { Object.assign(state.filter, filter); }),

    clearFilter: () =>
      set((state) => { state.filter = {}; }),

    setLoading: (loading) =>
      set((state) => { state.isLoading = loading; }),

    getFilteredLogs: () => {
      const { logs, filter } = get();
      return logs.filter((l) => {
        if (filter.actorId && l.actorId !== filter.actorId) return false;
        if (filter.action && !l.action.includes(filter.action)) return false;
        if (filter.dateFrom && l.timestamp < filter.dateFrom) return false;
        if (filter.dateTo && l.timestamp > filter.dateTo) return false;
        return true;
      });
    },
  }))
);