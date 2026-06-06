"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { useRealtime } from "@/hooks/useRealtime";
import { useNotifications } from "@/hooks/useNotifications";
import { useSimulationEngine } from "@/hooks/useSimulationEngine";
import { useCookieSync } from "@/hooks/useCookieSync";
import { usePWA } from "@/hooks/usePWA";
import { useCompany } from "@/hooks/useCompany";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const { activeCompany, loadCompanyData } = useCompany();
  const router = useRouter();

  // Hooks that run for all dashboard pages
  useRealtime();
  useNotifications();
  useSimulationEngine();
  useCookieSync();
  usePWA();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && activeCompany) {
      loadCompanyData(activeCompany);
    }
  }, [isAuthenticated, activeCompany?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
          <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Sidebar />
        <Topbar />
        <main
          className="pt-16 min-h-screen"
          style={{
            marginLeft: sidebarWidth,
            transition: "margin-left 0.25s ease",
          }}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ErrorBoundary>
  );
}