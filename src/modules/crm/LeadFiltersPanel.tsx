"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import { LeadStatus, LeadSource } from "@/types/crm.types";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS } from "@/utils/constants";
import { useEffect, useState } from "react";
import { db } from "@/db/schema";
import { User } from "@/types/auth.types";
import { useCompanyStore } from "@/store/companyStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "negotiation", "converted", "lost"];
const SOURCES: LeadSource[] = ["web", "referral", "cold_call", "social", "event", "other"];

export function LeadFiltersPanel({ isOpen, onClose }: Props) {
  const { filter, setFilter, clearFilter } = useCRMStore();
  const { activeCompany } = useCompanyStore();
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    if (!activeCompany) return;
    db.users.where("companyId").equals(activeCompany.id).toArray().then(setStaff);
  }, [activeCompany]);

  const selectStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    borderRadius: 8,
    padding: "8px 12px",
    width: "100%",
    fontSize: 13,
    outline: "none",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-40 overflow-y-auto"
            style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Filter Leads</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearFilter}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                  style={{ color: "var(--text-muted)" }}>
                  <RotateCcw size={12} /> Reset
                </button>
                <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                  STATUS
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s}
                      onClick={() => setFilter({ status: filter.status === s ? undefined : s })}
                      className="text-xs px-2.5 py-1 rounded-full transition-all capitalize"
                      style={{
                        background: filter.status === s ? `${LEAD_STATUS_COLORS[s]}25` : "var(--bg-elevated)",
                        color: filter.status === s ? LEAD_STATUS_COLORS[s] : "var(--text-secondary)",
                        border: `1px solid ${filter.status === s ? LEAD_STATUS_COLORS[s] + "50" : "var(--border-subtle)"}`,
                      }}>
                      {LEAD_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                  SOURCE
                </label>
                <select value={filter.source || ""} onChange={(e) => setFilter({ source: e.target.value || undefined })}
                  style={selectStyle}>
                  <option value="">All Sources</option>
                  {SOURCES.map((s) => <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>)}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                  ASSIGNED TO
                </label>
                <select value={filter.assignedTo || ""} onChange={(e) => setFilter({ assignedTo: e.target.value || undefined })}
                  style={selectStyle}>
                  <option value="">Anyone</option>
                  {staff.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                  SEARCH
                </label>
                <input
                  value={filter.search || ""}
                  onChange={(e) => setFilter({ search: e.target.value || undefined })}
                  placeholder="Name, email, phone..."
                  style={selectStyle}
                />
              </div>

              {/* Active filter count badge */}
              {Object.values(filter).filter(Boolean).length > 0 && (
                <div className="p-3 rounded-lg text-xs text-center"
                  style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
                  {Object.values(filter).filter(Boolean).length} filter{Object.values(filter).filter(Boolean).length > 1 ? "s" : ""} active
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}