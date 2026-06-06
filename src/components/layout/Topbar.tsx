"use client";
import { Bell, Sun, Moon, Search, ChevronDown } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useCompanyStore } from "../../store/companyStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useState } from "react";
import Link from "next/link";

export function Topbar() {
  const { theme, toggleTheme, sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();
  const { activeCompany, companies, setActiveCompany } = useCompanyStore();
  const { unreadCount } = useNotificationStore();
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-6 z-20"
      style={{
        left: sidebarWidth,
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "left 0.25s ease",
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", width: 280 }}>
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search leads, branches..."
          className="text-sm outline-none bg-transparent w-full"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Company Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
          >
            <div className="w-4 h-4 rounded"
              style={{ background: activeCompany?.primaryColor || "var(--primary)" }} />
            <span className="max-w-32 truncate">{activeCompany?.name}</span>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </button>
          {showCompanySwitcher && (
            <div
              className="absolute right-0 top-12 rounded-lg overflow-hidden shadow-xl z-50 min-w-48"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
            >
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveCompany(c); setShowCompanySwitcher(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:opacity-80 transition-all"
                  style={{
                    color: "var(--text-primary)",
                    background: c.id === activeCompany?.id ? "var(--primary-muted)" : "transparent",
                  }}
                >
                  <div className="w-3 h-3 rounded" style={{ background: c.primaryColor || "var(--primary)" }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <Link href="/notifications">
          <button
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "var(--danger)", color: "white", fontSize: "10px" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {user?.name}
            </p>
            <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
              {user?.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}