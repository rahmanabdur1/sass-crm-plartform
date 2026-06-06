"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../../store/authStore";
import { useCompanyStore } from "../../../store/companyStore";
import { useUIStore } from "../../../store/uiStore";
import { Sun, Moon, User, Building, Bell } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const { theme, toggleTheme } = useUIStore();
  const [tab, setTab] = useState<"profile" | "company" | "notifications">("profile");

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    borderRadius: 8,
    padding: "10px 14px",
    width: "100%",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "profile", icon: <User size={14} />, label: "Profile" },
          { key: "company", icon: <Building size={14} />, label: "Company" },
          { key: "notifications", icon: <Bell size={14} />, label: "Notifications" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === key ? "var(--primary)" : "var(--bg-card)",
              color: tab === key ? "white" : "var(--text-secondary)",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Profile Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                <input defaultValue={user?.name} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input defaultValue={user?.email} style={inputStyle} readOnly />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Role</label>
              <input
                value={user?.role.replace("_", " ").toUpperCase() || ""}
                readOnly
                style={{ ...inputStyle, color: "var(--text-muted)" }}
              />
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Theme</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Toggle between dark and light mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
              >
                {theme === "dark" ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "company" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Company Settings</h2>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Company Name</label>
            <input defaultValue={activeCompany?.name} style={inputStyle} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Currency</label>
              <select defaultValue={activeCompany?.currency} style={{ ...inputStyle }}>
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Language</label>
              <select defaultValue={activeCompany?.language} style={{ ...inputStyle }}>
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Brand Color</label>
              <input type="color" defaultValue={activeCompany?.primaryColor || "#6366F1"}
                style={{ ...inputStyle, padding: "4px", height: 42 }} />
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--primary)", color: "white" }}>
            Save Changes
          </button>
        </motion.div>
      )}

      {tab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Notification Preferences</h2>
          {[
            { label: "New Lead Assigned", desc: "When a lead is assigned to you" },
            { label: "Lead Converted", desc: "When a lead converts to customer" },
            { label: "Branch Updates", desc: "Branch status changes" },
            { label: "Report Generated", desc: "When a scheduled report is ready" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
              <div className="w-10 h-5 rounded-full relative cursor-pointer"
                style={{ background: "var(--primary)" }}>
                <div className="w-4 h-4 rounded-full absolute top-0.5 right-0.5"
                  style={{ background: "white" }} />
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}