import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Lead, LeadStatus, LeadsByStatus } from "../types/crm.types";

interface CRMState {
  leads: Lead[];
  selectedLead: Lead | null;
  isLoading: boolean;
  filter: {
    status?: LeadStatus;
    source?: string;
    assignedTo?: string;
    search?: string;
    branchId?: string;
  };

  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, partial: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setFilter: (filter: Partial<CRMState["filter"]>) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;

  getLeadsByStatus: () => LeadsByStatus;
  getFilteredLeads: () => Lead[];
}

export const useCRMStore = create<CRMState>()(
  immer((set, get) => ({
    leads: [],
    selectedLead: null,
    isLoading: false,
    filter: {},

    setLeads: (leads) =>
      set((state) => {
        state.leads = leads;
      }),

    addLead: (lead) =>
      set((state) => {
        state.leads.unshift(lead);
      }),

    updateLead: (id, partial) =>
      set((state) => {
        const idx = state.leads.findIndex((l) => l.id === id);
        if (idx !== -1) Object.assign(state.leads[idx], partial);
        if (state.selectedLead?.id === id) {
          Object.assign(state.selectedLead, partial);
        }
      }),

    deleteLead: (id) =>
      set((state) => {
        state.leads = state.leads.filter((l) => l.id !== id);
        if (state.selectedLead?.id === id) state.selectedLead = null;
      }),

    setSelectedLead: (lead) =>
      set((state) => {
        state.selectedLead = lead;
      }),

    setFilter: (filter) =>
      set((state) => {
        Object.assign(state.filter, filter);
      }),

    clearFilter: () =>
      set((state) => {
        state.filter = {};
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    getLeadsByStatus: () => {
      const { leads } = get();
      const grouped: LeadsByStatus = {
        new: [], contacted: [], qualified: [],
        negotiation: [], converted: [], lost: [],
      };
      leads.forEach((l) => grouped[l.status].push(l));
      return grouped;
    },

    getFilteredLeads: () => {
      const { leads, filter } = get();
      return leads.filter((l) => {
        if (filter.status && l.status !== filter.status) return false;
        if (filter.source && l.source !== filter.source) return false;
        if (filter.assignedTo && l.assignedTo !== filter.assignedTo) return false;
        if (filter.branchId && l.branchId !== filter.branchId) return false;
        if (filter.search) {
          const q = filter.search.toLowerCase();
          return (
            l.name.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.phone.includes(q)
          );
        }
        return true;
      });
    },
  }))
);