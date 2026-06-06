"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmService } from "@/services/crmService";
import { Lead } from "@/types/crm.types";
import { useCompanyStore } from "@/store/companyStore";
import { useAuthStore } from "@/store/authStore";
import { useCRMStore } from "@/store/crmStore";

export function useLeadsQuery() {
  const { activeCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { setLeads } = useCRMStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["leads", activeCompany?.id],
    queryFn: async () => {
      if (!activeCompany) return [];
      const leads = await crmService.getLeads(activeCompany.id);
      setLeads(leads); // sync to zustand too
      return leads;
    },
    enabled: !!activeCompany,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities">) =>
      crmService.createLead(data, user?.id || "", user?.name || ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", activeCompany?.id] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, partial }: { id: string; partial: Partial<Lead> }) =>
      crmService.updateLead(id, partial, user?.id || "", user?.name || "", activeCompany?.id || ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", activeCompany?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      crmService.deleteLead(id, user?.id || "", user?.name || "", activeCompany?.id || ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", activeCompany?.id] }),
  });

  return {
    leads: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createLead: createMutation.mutateAsync,
    updateLead: updateMutation.mutateAsync,
    deleteLead: deleteMutation.mutateAsync,
    refetch: query.refetch,
  };
}