"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Database, Zap, Shield, Clock, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { seedService } from "@/services/seedService";
import { formatNumber } from "@/utils/formatters";
import { HeatmapWidget } from "@/components/charts/HeatmapWidget";

interface HealthMetric {
  label: string;
  value: string;
  status: "ok" | "warn" | "error";
  icon: React.ReactNode;
}

export default function SystemHealthPage() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ totalRecords: number; breakdown: Record<string, number> } | null>(null);
  const [uptime] = useState(Math.floor(Math.random() * 720) + 48);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated activity heatmap (7 days × 24 hours)
  const heatmapSeries = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    name: day,
    data: Array.from({ length: 8 }, (_, h) => ({
      x: `${h * 3}:00`,
      y: Math.floor(Math.random() * 100),
    })),
  }));

  useEffect(() => {
    loadHealth();
  }, []);

  async function loadHealth() {
    const info = await seedService.getStorageInfo();
    setStorageInfo(info);

    setMetrics([
      { label: "IndexedDB Status", value: "Healthy", status: "ok", icon: <Database size={16} /> },
      { label: "Active Connections", value: `${Math.floor(Math.random() * 8) + 2}`, status: "ok", icon: <Activity size={16} /> },
      { label: "Uptime", value: `${uptime}h`, status: "ok", icon: <Clock size={16} /> },
      { label: "Error Rate", value: "0.01%", status: "ok", icon: <AlertTriangle size={16} /> },
      { label: "Auth Service", value: "Running", status: "ok", icon: <Shield size={16} /> },
      { label: "Simulation Engine", value: "Active", status: "ok", icon: <Zap size={16} /> },
      { label: "Total Records", value: formatNumber(info.totalRecords), status: "ok", icon: <Database size={16} /> },
      { label: "Schema Version", value: "v1.0", status: "ok", icon: <CheckCircle size={16} /> },
    ]);
    setIsLoading(false);
  }

  const STATUS_COLORS = { ok: "var(--accent-green)", warn: "var(--warning)", error: "var(--danger)" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>System Health</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Platform infrastructure status</p>
        </div>
        <button onClick={loadHealth}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass-card h-24 skeleton" />)
          : metrics.map((m, i) => (
              <motion.div key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4"
                style={{ borderLeft: `3px solid ${STATUS_COLORS[m.status]}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: STATUS_COLORS[m.status] }}>{m.icon}</span>
                  <CheckCircle size={12} style={{ color: STATUS_COLORS[m.status] }} />
                </div>
                <p className="text-lg font-bold font-mono" style={{ color: "var(--text-primary)" }}>{m.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              </motion.div>
            ))}
      </div>

      {/* Storage Breakdown */}
      {storageInfo && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Storage Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(storageInfo.breakdown).map(([table, count]) => (
              <div key={table} className="text-center p-3 rounded-lg"
                style={{ background: "var(--bg-elevated)" }}>
                <p className="text-xl font-bold font-mono" style={{ color: "var(--primary)" }}>{count}</p>
                <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--text-muted)" }}>{table}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Simulated Activity Heatmap (Last 7 Days)
        </h3>
        <HeatmapWidget series={heatmapSeries} height={220} />
      </div>
    </div>
  );
}