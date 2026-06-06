"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Download, Search } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";
import { AuditLog } from "../../../db/schema";
import { auditService } from "../../../services/auditService";
import { exportService } from "../../../services/exportService";
import { formatDate, formatRelativeTime } from "../../../utils/formatters";
import { usePermission } from "../../../hooks/usePermission";

const ACTION_COLORS: Record<string, string> = {
  "user.login": "#22C55E",
  "user.logout": "#9CA3AF",
  "lead.created": "#6366F1",
  "lead.updated": "#F59E0B",
  "lead.deleted": "#EF4444",
  "branch.created": "#3B82F6",
};

export default function AuditLogPage() {
  const { activeCompany } = useCompanyStore();
  const { canAccess } = usePermission();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeCompany) return;
    loadLogs();
  }, [activeCompany]);

  useEffect(() => {
    if (!search) {
      setFiltered(logs);
    } else {
      const q = search.toLowerCase();
      setFiltered(logs.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.target.toLowerCase().includes(q)
      ));
    }
  }, [search, logs]);

  async function loadLogs() {
    if (!activeCompany) return;
    setIsLoading(true);
    const data = await auditService.getLogs(activeCompany.id, 100);
    setLogs(data);
    setFiltered(data);
    setIsLoading(false);
  }

  const handleExport = () => {
    exportService.exportCSV(
      logs.map((l) => ({
        actor: l.actorName,
        action: l.action,
        target: l.target,
        ip: l.ip,
        timestamp: formatDate(l.timestamp),
      })),
      "audit-log"
    );
  };

  if (!canAccess("/audit-log")) {
    return (
      <div className="glass-card p-12 text-center">
        <Shield size={32} style={{ color: "var(--danger)", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--text-muted)" }}>You don't have access to audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Audit Log</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {logs.length} events tracked
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="outline-none bg-transparent text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Time", "Actor", "Action", "Target", "IP"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton h-4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
                className="hover:opacity-80 transition-all"
              >
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(log.timestamp)}
                </td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {log.actorName}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${ACTION_COLORS[log.action] || "#9CA3AF"}15`,
                      color: ACTION_COLORS[log.action] || "#9CA3AF",
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {log.target} {log.targetId ? `#${log.targetId.slice(-6)}` : ""}
                </td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {log.ip}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}