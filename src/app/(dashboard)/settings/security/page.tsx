"use client";
import { useState } from "react";
import { LogOut,} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyStore } from "@/store/companyStore";
import { db } from "@/db/schema";
import { formatDate } from "@/utils/formatters";
import { useAuthStore } from "@/store/authStore";

const SIMULATED_SESSIONS = [
  { id: "sess_1", device: "Chrome — Windows", ip: "192.168.1.45", location: "Dhaka, BD", active: true, lastSeen: Date.now() },
  { id: "sess_2", device: "Mobile Safari — iOS", ip: "192.168.1.62", location: "Chittagong, BD", active: false, lastSeen: Date.now() - 3600000 },
];

export default function SecuritySettingsPage() {
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const [retention, setRetention] = useState(90);
  const [minPasswordLength, setMinPasswordLength] = useState(6);

  async function handleClearSessions() {
    if (!user || !activeCompany) return;
    await db.auditLogs.add({
      id: crypto.randomUUID(),
      companyId: activeCompany.id,
      actorId: user.id,
      actorName: user.name,
      action: "security.sessions_cleared",
      target: "auth",
      ip: "127.0.0.1",
      timestamp: Date.now(),
    });
    logout();
  }

  const toggleStyle = (active: boolean) => ({
    background: active ? "var(--primary)" : "var(--bg-elevated)",
    border: `2px solid ${active ? "var(--primary)" : "var(--border-default)"}`,
  });

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Security Settings</h2>

      {/* Active Sessions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Active Sessions</h3>
          <button onClick={handleClearSessions}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
            <LogOut size={12} /> Force Logout All
          </button>
        </div>
        <div className="space-y-3">
          {SIMULATED_SESSIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "var(--bg-elevated)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.device}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {s.ip} · {s.location} · {formatDate(s.lastSeen)}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: s.active ? "var(--accent-green-muted)" : "var(--bg-card)",
                  color: s.active ? "var(--accent-green)" : "var(--text-muted)",
                }}>
                {s.active ? "Current" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Password Policy */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Password Policy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              Minimum Password Length: <span style={{ color: "var(--primary)" }}>{minPasswordLength}</span>
            </label>
            <input type="range" min={6} max={20} value={minPasswordLength}
              onChange={(e) => setMinPasswordLength(Number(e.target.value))}
              className="w-full" style={{ accentColor: "var(--primary)" }} />
          </div>

          {[
            { label: "Require uppercase letters", defaultChecked: false },
            { label: "Require numbers", defaultChecked: true },
            { label: "Require special characters", defaultChecked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <input type="checkbox" defaultChecked={item.defaultChecked}
                style={{ accentColor: "var(--primary)", width: 16, height: 16 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Audit Retention */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Audit Log Retention</h3>
        <div className="flex gap-2">
          {[30, 60, 90].map((days) => (
            <button key={days} onClick={() => setRetention(days)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: retention === days ? "var(--primary)" : "var(--bg-elevated)",
                color: retention === days ? "white" : "var(--text-secondary)",
              }}>
              {days} days
            </button>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Logs older than {retention} days will be flagged for auto-deletion (simulated)
        </p>
      </div>

      <button className="w-full py-2.5 rounded-lg text-sm font-medium"
        style={{ background: "var(--primary)", color: "white" }}>
        Save Security Settings
      </button>
    </div>
  );
}