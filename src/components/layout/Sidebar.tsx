"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, MapPin, GitBranch, BarChart2,
  FileText, Bell, Shield, Settings, ChevronLeft, ChevronRight,
  Zap, Building2, LogOut
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useCompanyStore } from "../../store/companyStore";
import { useAuth } from "../../hooks/useAuth";
import { usePermission } from "../../hooks/usePermission";
import { useNotificationStore } from "../../store/notificationStore";
import { cn } from "../../utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  permission?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { activeCompany } = useCompanyStore();
  const { logout } = useAuth();
  const { canAccess, isPlatformAdmin } = usePermission();
  const { unreadCount } = useNotificationStore();

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "CRM", href: "/crm", icon: <Users size={18} /> },
    { label: "GIS Map", href: "/gis-map", icon: <MapPin size={18} /> },
    { label: "Branches", href: "/branches", icon: <GitBranch size={18} /> },
    { label: "Analytics", href: "/analytics", icon: <BarChart2 size={18} /> },
    { label: "Reports", href: "/reports", icon: <FileText size={18} /> },
    { label: "Notifications", href: "/notifications", icon: <Bell size={18} />, badge: unreadCount },
    { label: "Audit Log", href: "/audit-log", icon: <Shield size={18} /> },
    { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  if (isPlatformAdmin()) {
    navItems.push({ label: "Admin Platform", href: "/admin-platform", icon: <Building2 size={18} /> });
  }

  const filteredNavItems = navItems.filter((item) => canAccess(item.href));

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen flex flex-col fixed left-0 top-0 z-30 overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-4 h-16 gap-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: activeCompany?.primaryColor || "var(--primary)" }}>
          <Zap size={16} color="white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-sm truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {activeCompany?.name || "SaaS CRM"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg relative transition-all",
                isActive && "active"
              )}
              style={{
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                background: isActive ? "var(--primary-muted)" : "transparent",
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    "absolute text-xs font-bold rounded-full flex items-center justify-center",
                    sidebarCollapsed ? "top-1 right-1 w-4 h-4" : "right-2 min-w-5 h-5 px-1"
                  )}
                  style={{ background: "var(--danger)", color: "white", fontSize: "10px" }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={logout}
          className="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-50"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          color: "var(--text-muted)",
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}