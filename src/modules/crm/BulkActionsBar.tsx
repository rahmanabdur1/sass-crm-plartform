"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, UserCheck, Download, X } from "lucide-react";
import { Lead } from "@/types/crm.types";
import { exportService } from "@/services/exportService";

interface Props {
  selectedIds: Set<string>;
  leads: Lead[];
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkAssign: () => void;
}

export function BulkActionsBar({ selectedIds, leads, onClearSelection, onBulkDelete, onBulkAssign }: Props) {
  const count = selectedIds.size;

  const handleExport = () => {
    const selected = leads.filter((l) => selectedIds.has(l.id));
    exportService.exportCSV(
      selected.map((l) => ({
        name: l.name, email: l.email, phone: l.phone,
        status: l.status, source: l.source, value: l.value,
      })),
      `leads_export_${Date.now()}`
    );
  };

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <span className="text-sm font-semibold px-2 py-0.5 rounded-md"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
            {count} selected
          </span>

          <div className="w-px h-5" style={{ background: "var(--border-default)" }} />

          <button onClick={onBulkAssign}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
            <UserCheck size={14} /> Assign
          </button>

          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
            <Download size={14} /> Export
          </button>

          <button onClick={onBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
            <Trash2 size={14} /> Delete
          </button>

          <div className="w-px h-5" style={{ background: "var(--border-default)" }} />

          <button onClick={onClearSelection} style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}