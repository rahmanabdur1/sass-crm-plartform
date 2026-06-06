"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { seedService } from "@/services/seedService";
import { db } from "@/db/schema";
import { exportService } from "@/services/exportService";
import { useCompanyStore } from "@/store/companyStore";
import { useCompany } from "@/hooks/useCompany";

type ActionStatus = "idle" | "loading" | "done" | "error";

export default function DataSettingsPage() {
  const { activeCompany } = useCompanyStore();
  const { loadCompanyData } = useCompany();
  const [exportStatus, setExportStatus] = useState<ActionStatus>("idle");
  const [reseedStatus, setReseedStatus] = useState<ActionStatus>("idle");
  const [clearStatus, setClearStatus] = useState<ActionStatus>("idle");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  async function handleExportAll() {
    if (!activeCompany) return;
    setExportStatus("loading");
    try {
      const [leads, branches, users, snapshots] = await Promise.all([
        db.leads.where("companyId").equals(activeCompany.id).toArray(),
        db.branches.where("companyId").equals(activeCompany.id).toArray(),
        db.users.where("companyId").equals(activeCompany.id).toArray(),
        db.analyticsSnapshots.where("companyId").equals(activeCompany.id).toArray(),
      ]);
      exportService.exportJSON(
        { company: activeCompany, leads, branches, users, snapshots, exportedAt: new Date().toISOString() },
        `${activeCompany.slug}_export_${Date.now()}`
      );
      setExportStatus("done");
    } catch {
      setExportStatus("error");
    } finally {
      setTimeout(() => setExportStatus("idle"), 3000);
    }
  }

  async function handleReseed() {
    setReseedStatus("loading");
    try {
      await seedService.reseed();
      if (activeCompany) await loadCompanyData(activeCompany);
      setReseedStatus("done");
    } catch {
      setReseedStatus("error");
    } finally {
      setTimeout(() => setReseedStatus("idle"), 3000);
    }
  }

  async function handleClearData() {
    if (!activeCompany) return;
    setClearStatus("loading");
    setShowClearConfirm(false);
    try {
      await seedService.clearAll();
      if (activeCompany) await loadCompanyData(activeCompany);
      setClearStatus("done");
    } catch {
      setClearStatus("error");
    } finally {
      setTimeout(() => setClearStatus("idle"), 3000);
    }
  }

  const StatusIcon = ({ status }: { status: ActionStatus }) => {
    if (status === "loading") return <Loader2 size={16} className="animate-spin" />;
    if (status === "done") return <CheckCircle size={16} style={{ color: "var(--accent-green)" }} />;
    if (status === "error") return <AlertTriangle size={16} style={{ color: "var(--danger)" }} />;
    return null;
  };

  const DATA_ACTIONS = [
    {
      title: "Export All Data",
      description: "Download all leads, branches, analytics, and user data as JSON.",
      icon: <Download size={18} />,
      color: "#6366F1",
      status: exportStatus,
      label: "Export JSON",
      onClick: handleExportAll,
      danger: false,
    },
    {
      title: "Reload Demo Data",
      description: "Clear all current data and reload fresh demo dataset with 60 leads and 5 branches.",
      icon: <RefreshCw size={18} />,
      color: "#F59E0B",
      status: reseedStatus,
      label: "Reload Demo",
      onClick: handleReseed,
      danger: false,
    },
    {
      title: "Clear All Data",
      description: "Permanently delete all leads, branches, analytics, and reports. This cannot be undone.",
      icon: <Trash2 size={18} />,
      color: "#EF4444",
      status: clearStatus,
      label: "Clear Data",
      onClick: () => setShowClearConfirm(true),
      danger: true,
    },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Data Management</h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Manage your company data — export, reset, or clear.
      </p>

      <div className="space-y-3">
        {DATA_ACTIONS.map((action) => (
          <motion.div key={action.title}
            whileHover={{ scale: 1.005 }}
            className="glass-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${action.color}15`, color: action.color }}>
              {action.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{action.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{action.description}</p>
            </div>
            <button
              onClick={action.onClick}
              disabled={action.status === "loading"}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shrink-0 transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: action.danger ? "rgba(239,68,68,0.1)" : `${action.color}15`,
                color: action.color,
                border: `1px solid ${action.color}30`,
              }}>
              <StatusIcon status={action.status} />
              {action.status === "idle" ? action.label : action.status === "done" ? "Done!" : action.status === "loading" ? "Working..." : "Failed"}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Confirm Clear Dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowClearConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} style={{ color: "var(--danger)" }} />
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Confirm Data Clear</h3>
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                This will permanently delete all leads, branches, analytics snapshots, notifications, audit logs, and reports.
                <strong style={{ color: "var(--danger)" }}> This action cannot be undone.</strong>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button onClick={handleClearData}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--danger)", color: "white" }}>
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}