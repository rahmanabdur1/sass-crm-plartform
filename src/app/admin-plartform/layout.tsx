"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isPlatformAdmin } = usePermission();
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const router = useRouter();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isPlatformAdmin())) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, isPlatformAdmin, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <Topbar />
      <main className="pt-16 min-h-screen transition-all duration-250"
        style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}