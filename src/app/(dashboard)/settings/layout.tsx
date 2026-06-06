"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_TABS = [
  { href: "/settings", label: "Profile & Appearance", exact: true },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/data", label: "Data" },
  { href: "/settings/localization", label: "Localization" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage your account, team, and company preferences</p>
      </div>

      {/* Settings Sub-Nav */}
      <div className="flex gap-1 flex-wrap"
        style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: 0 }}>
        {SETTINGS_TABS.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href}>
              <button
                className="px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  borderBottom: `2px solid ${isActive ? "var(--primary)" : "transparent"}`,
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}