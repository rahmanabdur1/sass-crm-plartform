import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Company } from "../types/company.types";

interface CompanyState {
  activeCompany: Company | null;
  companies: Company[];
  isSwitching: boolean;

  setActiveCompany: (company: Company) => void;
  setCompanies: (companies: Company[]) => void;
  setSwitching: (val: boolean) => void;
  updateCompany: (partial: Partial<Company>) => void;
  reset: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    immer((set) => ({
      activeCompany: null,
      companies: [],
      isSwitching: false,

      setActiveCompany: (company) =>
        set((state) => {
          state.activeCompany = company;
        }),

      setCompanies: (companies) =>
        set((state) => {
          state.companies = companies;
        }),

      setSwitching: (val) =>
        set((state) => {
          state.isSwitching = val;
        }),

      updateCompany: (partial) =>
        set((state) => {
          if (state.activeCompany) {
            Object.assign(state.activeCompany, partial);
          }
        }),

      reset: () =>
        set((state) => {
          state.activeCompany = null;
          state.companies = [];
        }),
    })),
    {
      name: "saas_company",
      partialize: (state) => ({
        activeCompany: state.activeCompany,
      }),
    }
  )
);