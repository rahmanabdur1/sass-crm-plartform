"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";
import { useCompanyStore } from "@/store/companyStore";
import { Avatar } from "@/components/shared/Avatar";
import { formatCurrency } from "@/utils/formatters";
import { ROLE_LABELS } from "@/utils/constants";

interface StaffStat {
  userId: string;
  name: string;
  role: string;
  assignedLeads: number;
  convertedLeads: number;
  conversionRate: string;
  totalValue: number;
  avgResponseTime: string;
}

export function StaffPerformanceSection() {
  const { activeCompany } = useCompanyStore();
  const [stats, setStats] = useState<StaffStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeCompany) return;
    analyticsService.getStaffPerformance(activeCompany.id).then((data) => {
      setStats(data);
      setIsLoading(false);
    });
  }, [activeCompany]);

  const topPerformer = stats[0];

  return (
    <div className="space-y-4">
      {/* Top Performer Banner */}
      {topPerformer && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex items-center gap-4"
          style={{ borderLeft: "3px solid var(--warning)" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}>
            <Trophy size={20} style={{ color: "var(--warning)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>TOP PERFORMER THIS MONTH</p>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{topPerformer.name}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {topPerformer.convertedLeads} conversions · {topPerformer.conversionRate}% rate ·{" "}
              {formatCurrency(topPerformer.totalValue, "BDT")} value
            </p>
          </div>
        </motion.div>
      )}

      {/* Staff Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Staff Performance</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Staff", "Role", "Assigned", "Converted", "Rate", "Value", "Avg Response"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              : stats.map((s, i) => (
                  <motion.tr key={s.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {i === 0 && (
                          <span className="text-sm">🥇</span>
                        )}
                        {i === 1 && <span className="text-sm">🥈</span>}
                        {i === 2 && <span className="text-sm">🥉</span>}
                        {i > 2 && <span className="w-5 text-xs text-center font-mono" style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                        <Avatar name={s.name} size="sm" />
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                        {ROLE_LABELS[s.role] || s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                      {s.assignedLeads}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--accent-green)" }}>
                      {s.convertedLeads}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--border-subtle)" }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${parseFloat(s.conversionRate)}%`,
                              background: parseFloat(s.conversionRate) > 30 ? "var(--accent-green)" : "var(--warning)",
                            }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{s.conversionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(s.totalValue, "BDT")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Clock size={11} style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.avgResponseTime}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}