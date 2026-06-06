"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "@/services/branchService";
import { Branch } from "@/types/branch.types";
import { useCompanyStore } from "@/store/companyStore";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";

export function useBranchesQuery() {
  const { activeCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { setBranches } = useBranchStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["branches", activeCompany?.id],
    queryFn: async () => {
      if (!activeCompany) return [];
      const branches = await branchService.getBranches(activeCompany.id);
      setBranches(branches);
      return branches;
    },
    enabled: !!activeCompany,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Branch, "id" | "createdAt" | "updatedAt">) =>
      branchService.createBranch(data, user?.id || "", user?.name || ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches", activeCompany?.id] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, partial }: { id: string; partial: Partial<Branch> }) =>
      branchService.updateBranch(id, partial, user?.id || "", user?.name || "", activeCompany?.id || ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches", activeCompany?.id] }),
  });

  return {
    branches: query.data || [],
    isLoading: query.isLoading,
    createBranch: createMutation.mutateAsync,
    updateBranch: updateMutation.mutateAsync,
    refetch: query.refetch,
  };
}