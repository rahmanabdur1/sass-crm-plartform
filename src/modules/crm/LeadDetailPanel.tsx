"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, MapPin, Tag, Activity, DollarSign, Calendar } from "lucide-react";
import { Lead } from "../../types/crm.types";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from "../../utils/constants";
import { formatCurrency, formatDate, formatRelativeTime } from "../../utils/formatters";

export function LeadDetailPanel({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
            style={{
              background: "var(--bg-secondary)",
              borderLeft: "1px solid var(--border-default)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                  {lead.name}
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${LEAD_STATUS_COLORS[lead.status]}15`,
                    color: LEAD_STATUS_COLORS[lead.status],
                  }}
                >
                  {LEAD_STATUS_LABELS[lead.status]}
                </span>
              </div>
              <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Contact Info */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  CONTACT INFO
                </h3>
                {[
                  { icon: <Mail size={14} />, value: lead.email },
                  { icon: <Phone size={14} />, value: lead.phone },
                  { icon: <MapPin size={14} />, value: lead.location ? `${lead.location.city}, ${lead.location.region}` : "—" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span style={{ color: "var(--primary)" }}>{item.icon}</span>
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Deal Info */}
              <div className="glass-card p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Deal Value</p>
                  <p className="font-mono font-bold" style={{ color: "var(--accent-green)" }}>
                    {formatCurrency(lead.value, "BDT")}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Source</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {LEAD_SOURCE_LABELS[lead.source]}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Lead Score</p>
                  <p className="font-mono font-bold" style={{ color: "var(--warning)" }}>
                    {lead.score ?? "—"}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Created</p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {formatDate(lead.createdAt)}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {lead.tags.length > 0 && (
                <div>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>TAGS</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: "var(--primary-muted)",
                          color: "var(--primary)",
                          border: "1px solid var(--primary)30",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {lead.notes && (
                <div className="glass-card p-4">
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>NOTES</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{lead.notes}</p>
                </div>
              )}

              {/* Activity Timeline */}
              <div>
                <p className="text-xs mb-3 font-semibold" style={{ color: "var(--text-secondary)" }}>
                  ACTIVITY TIMELINE
                </p>
                {lead.activities.length > 0 ? (
                  <div className="space-y-3">
                    {lead.activities.map((act) => (
                      <div key={act.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: "var(--primary)" }} />
                        <div>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{act.description}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {formatRelativeTime(act.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No activities yet</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}