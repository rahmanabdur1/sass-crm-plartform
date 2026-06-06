"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Save, Download, Plus, X, Loader2 } from "lucide-react";
import { reportService } from "@/services/reportService";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { Report } from "@/db/schema";

type DataSource = "crm" | "branches" | "analytics";
type Metric = { key: string; label: string; source: DataSource };

const AVAILABLE_METRICS: Metric[] = [
  { key: "lead_count", label: "Total Lead Count", source: "crm" },
  { key: "lead_value", label: "Total Lead Value", source: "crm" },
  { key: "conversion_rate", label: "Conversion Rate", source: "crm" },
  { key: "leads_by_source", label: "Leads by Source", source: "crm" },
  { key: "branch_revenue", label: "Branch Revenue", source: "branches" },
  { key: "branch_staff", label: "Active Staff per Branch", source: "branches" },
  { key: "branch_leads", label: "Leads per Branch", source: "branches" },
  { key: "daily_revenue", label: "Daily Revenue Trend", source: "analytics" },
  { key: "daily_leads", label: "Daily Lead Creation", source: "analytics" },
  { key: "avg_conversion", label: "Avg Conversion Rate", source: "analytics" },
];

const SOURCE_COLORS: Record<DataSource, string> = {
  crm: "#6366F1",
  branches: "#F59E0B",
  analytics: "#22C55E",
};

interface ScheduleOption { label: string; value: string }
const SCHEDULES: ScheduleOption[] = [
  { label: "One-time", value: "once" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export function CustomReportBuilder({ onReportGenerated }: { onReportGenerated: (r: Report) => void }) {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [schedule, setSchedule] = useState("once");
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const [activeSource, setActiveSource] = useState<DataSource | "all">("all");

  function toggleMetric(metric: Metric) {
    setSelectedMetrics((prev) =>
      prev.find((m) => m.key === metric.key)
        ? prev.filter((m) => m.key !== metric.key)
        : [...prev, metric]
    );
  }

  const filteredMetrics = activeSource === "all"
    ? AVAILABLE_METRICS
    : AVAILABLE_METRICS.filter((m) => m.source === activeSource);

  async function handleGenerate() {
    if (!user || !activeCompany || !reportName.trim() || selectedMetrics.length === 0) return;
    setIsGenerating(true);

    try {
      const report = await reportService.generateReport(
        {
          type: "custom",
          name: reportName,
          dateFrom: dateRange.from || undefined,
          dateTo: dateRange.to || undefined,
        },
        activeCompany.id,
        user.id,
        user.name
      );

      // Build mock preview data based on selected metrics
      const previewRows = selectedMetrics.map((m) => ({
        metric: m.label,
        source: m.source.toUpperCase(),
        value: `Simulated — ${Math.floor(Math.random() * 10000).toLocaleString()}`,
        schedule,
      }));

      setPreview(previewRows);
      onReportGenerated(report);
    } finally {
      setIsGenerating(false);
    }
  }

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Custom Report Builder</h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Select metrics, apply filters, and generate a tailored report
        </p>
      </div>

      {/* Report Name */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
          REPORT NAME *
        </label>
        <input
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="e.g. Q2 Lead Performance Analysis"
          style={{ ...inputStyle, width: "100%" }}
        />
      </div>

      {/* Metric Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            SELECT METRICS ({selectedMetrics.length} selected)
          </label>
          {/* Source filter */}
          <div className="flex gap-1">
            {(["all", "crm", "branches", "analytics"] as const).map((src) => (
              <button key={src} onClick={() => setActiveSource(src)}
                className="text-xs px-2 py-1 rounded capitalize transition-all"
                style={{
                  background: activeSource === src ? "var(--primary)" : "var(--bg-elevated)",
                  color: activeSource === src ? "white" : "var(--text-muted)",
                }}>
                {src}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {filteredMetrics.map((metric) => {
            const isSelected = selectedMetrics.some((m) => m.key === metric.key);
            const color = SOURCE_COLORS[metric.source];
            return (
              <button key={metric.key} onClick={() => toggleMetric(metric)}
                className="text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: isSelected ? `${color}15` : "var(--bg-elevated)",
                  border: `1px solid ${isSelected ? `${color}40` : "var(--border-subtle)"}`,
                  color: isSelected ? color : "var(--text-secondary)",
                }}>
                <div className="flex items-center justify-between">
                  <span>{metric.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: `${color}20`, color }}>
                    {metric.source}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>FROM DATE</label>
          <input type="date" value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            style={{ ...inputStyle, width: "100%" }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>TO DATE</label>
          <input type="date" value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            style={{ ...inputStyle, width: "100%" }} />
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
          SCHEDULE (SIMULATION)
        </label>
        <div className="flex gap-2">
          {SCHEDULES.map((s) => (
            <button key={s.value} onClick={() => setSchedule(s.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: schedule === s.value ? "var(--primary)" : "var(--bg-elevated)",
                color: schedule === s.value ? "white" : "var(--text-secondary)",
              }}>
              {s.label}
            </button>
          ))}
        </div>
        {schedule !== "once" && (
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
            ℹ️ Scheduling is simulated — report will be flagged as "{schedule}" in history
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !reportName.trim() || selectedMetrics.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--primary)", color: "white" }}
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <><Play size={14} /> Generate Report</>}
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
          <Save size={14} /> Save Template
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Preview</p>
            <button onClick={() => reportService.exportReportJSON({ id: "preview", name: reportName, companyId: "", type: "custom", data: { rows: preview }, generatedAt: Date.now() })}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded"
              style={{ color: "var(--primary)", background: "var(--primary-muted)" }}>
              <Download size={11} /> Export JSON
            </button>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Metric", "Source", "Value", "Schedule"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}