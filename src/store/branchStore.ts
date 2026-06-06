import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Branch, BranchMetrics } from "@/types/branch.types";

interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;
  isLoading: boolean;

  setBranches: (branches: Branch[]) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, partial: Partial<Branch>) => void;
  updateBranchMetrics: (id: string, metrics: Partial<BranchMetrics>) => void;
  deleteBranch: (id: string) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  setLoading: (loading: boolean) => void;
  getActiveBranches: () => Branch[];
  reset: () => void;
}

export const useBranchStore = create<BranchState>()(
  immer((set, get) => ({
    branches: [],
    selectedBranch: null,
    isLoading: false,

    setBranches: (branches) =>
      set((state) => { state.branches = branches; }),

    addBranch: (branch) =>
      set((state) => { state.branches.unshift(branch); }),

    updateBranch: (id, partial) =>
      set((state) => {
        const idx = state.branches.findIndex((b) => b.id === id);
        if (idx !== -1) Object.assign(state.branches[idx], partial);
        if (state.selectedBranch?.id === id) Object.assign(state.selectedBranch, partial);
      }),

    updateBranchMetrics: (id, metrics) =>
      set((state) => {
        const idx = state.branches.findIndex((b) => b.id === id);
        if (idx !== -1) Object.assign(state.branches[idx].metrics, metrics);
      }),

    deleteBranch: (id) =>
      set((state) => {
        state.branches = state.branches.filter((b) => b.id !== id);
        if (state.selectedBranch?.id === id) state.selectedBranch = null;
      }),

    setSelectedBranch: (branch) =>
      set((state) => { state.selectedBranch = branch; }),

    setLoading: (loading) =>
      set((state) => { state.isLoading = loading; }),

    getActiveBranches: () =>
      get().branches.filter((b) => b.status === "active"),

    reset: () =>
      set((state) => {
        state.branches = [];
        state.selectedBranch = null;
      }),
  }))
);