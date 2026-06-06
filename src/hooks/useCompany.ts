"use client";
import { useCallback } from "react";
import { useCompanyStore } from "@/store/companyStore";
import { useCRMStore } from "@/store/crmStore";
import { useBranchStore } from "@/store/branchStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuditStore } from "@/store/auditStore";
import { Company } from "@/types/company.types";
import { db } from "@/db/schema";
import { crmService } from "@/services/crmService";
import { branchService } from "@/services/branchService";
import { analyticsService } from "@/services/analyticsService";
import { notificationService } from "@/services/notificationService";
import { auditService } from "@/services/auditService";
import { useAuthStore } from "@/store/authStore";

export function useCompany() {
  const { activeCompany, companies, setActiveCompany, setSwitching } = useCompanyStore();
  const { setLeads } = useCRMStore();
  const { setBranches } = useBranchStore();
  const { setSnapshots, setInsights, setKPIs } = useAnalyticsStore();
  const { setNotifications } = useNotificationStore();
  const { setLogs } = useAuditStore();
  const { user } = useAuthStore();

  const loadCompanyData = useCallback(async (company: Company) => {
    if (!user) return;

    const [leads, branches, snapshots, notifications, auditLogs, kpis] = await Promise.all([
      crmService.getLeads(company.id),
      branchService.getBranches(company.id),
      analyticsService.getSnapshots(company.id),
      notificationService.getNotifications(company.id, user.id),
      auditService.getLogs(company.id),
      analyticsService.buildKPIs(company.id),
    ]);

    setLeads(leads);
    setBranches(branches);
    setSnapshots(snapshots);
    setNotifications(notifications);
    setLogs(auditLogs);
    setKPIs(kpis);
    setInsights(analyticsService.generateInsights(snapshots, company.id));
  }, [user, setLeads, setBranches, setSnapshots, setNotifications, setLogs, setKPIs, setInsights]);

  const switchCompany = useCallback(async (company: Company) => {
    setSwitching(true);
    setActiveCompany(company);
    await loadCompanyData(company);
    localStorage.setItem("saas_active_company", company.id);
    setSwitching(false);
  }, [setActiveCompany, setSwitching, loadCompanyData]);

  return {
    activeCompany,
    companies,
    switchCompany,
    loadCompanyData,
  };
}