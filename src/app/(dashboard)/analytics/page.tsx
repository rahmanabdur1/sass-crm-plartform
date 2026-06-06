"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";
import { db } from "../../../db/schema";
import { AnalyticsSnapshot, AIInsight } from "../../../types/analytics.types";
import { formatCurrency, formatNumber, formatPercentage } from "../../../utils/formatters";
// import { LEAD_SOURCE_COLORS, LEAD_SOURCE_LABELS } from "@/utils/constants";

function generateAIInsights(snapshots: AnalyticsSnapshot[]): AIInsight[] {
  if (snapshots.length < 7) return [];

  const recent = snapshots.slice(-7);
  const prev = snapshots.slice(-14, -7);

  const recentRevenue = recent.reduce((s, x) => s + x.revenue, 0);
  const prevRevenue = prev.reduce((s, x) => s + x.revenue, 0);
  const revGrowth = ((recentRevenue - prevRevenue) / prevRevenue) * 100;

  const recentConv = recent.reduce((s, x) => s + x.conversionRate, 0) / 7;
  const prevConv = prev.reduce((s, x) => s + x.conversionRate, 0) / 7;

  const insights: AIInsight[] = [
    {
      id: "1",
      companyId: "",
      text: `Revenue ${revGrowth > 0 ? "grew" : "dropped"} by ${Math.abs(revGrowth).toFixed(1)}% this week vs last week. ${revGrowth > 0 ? "Keep up the momentum!" : "Focus on high-value leads."}`,
      type: "revenue",
      trend: revGrowth > 0 ? "up" : "down",
      generatedAt: Date.now(),
    },
    {
      id: "2",
      companyId: "",
      text: `Lead conversion rate is ${recentConv.toFixed(1)}% — ${recentConv > prevConv ? "improving" : "declining"} compared to last week's ${prevConv.toFixed(1)}%.`,
      type: "lead",
      trend: recentConv > prevConv ? "up" : "down",
      generatedAt: Date.now(),
    },
    {
      id: "3",
      companyId: "",
      text: `Referral leads historically convert 3x better than cold calls. Consider increasing referral programs.`,
      type: "lead",
      trend: "up",
      generatedAt: Date.now(),
    },
    {
      id: "4",
      companyId: "",
      text: `Tuesday and Wednesday show highest lead activity. Schedule follow-ups mid-week for best conversion.`,
      type: "branch",
      trend: "neutral",
      generatedAt: Date.now(),
    },
  ];

  return insights;
}

export default function AnalyticsPage() {
  const { activeCompany } = useCompanyStore();
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "revenue" | "leads">("overview");

  useEffect(() => {
    if (!activeCompany) return;
    loadData();
  }, [activeCompany]);

  async function loadData() {
    if (!activeCompany) return;
    setIsLoading(true);
    const data = await db.analyticsSnapshots
      .where("companyId")
      .equals(activeCompany.id)
      .sortBy("date");
    setSnapshots(data);
    setInsights(generateAIInsights(data));
    setIsLoading(false);
  }

  const chartData = snapshots.map((s) => ({
    date: s.date.slice(5),
    revenue: s.revenue,
    leads: s.leadsCreated,
    converted: s.leadsConverted,
    convRate: Number(s.conversionRate.toFixed(1)),
  }));

  const totalRevenue = snapshots.reduce((s, x) => s + x.revenue, 0);
  const totalLeads = snapshots.reduce((s, x) => s + x.leadsCreated, 0);
  const avgConversion = snapshots.length
    ? snapshots.reduce((s, x) => s + x.conversionRate, 0) / snapshots.length
    : 0;

  const tooltipStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "var(--text-primary)",
    fontSize: 12,
  };

  const TABS = ["overview", "revenue", "leads"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Last 30 days · {activeCompany?.name}
          </p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue, "BDT"), color: "#6366F1" },
          { label: "Total Leads", value: formatNumber(totalLeads), color: "#22C55E" },
          { label: "Avg Conversion", value: formatPercentage(avgConversion), color: "#F59E0B" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 text-center"
          >
            <p className="text-3xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? "var(--primary)" : "var(--bg-card)",
              color: tab === t ? "white" : "var(--text-secondary)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Charts */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Revenue Trend</h3>
            {isLoading ? <div className="skeleton h-48" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickFormatter={formatNumber} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Conversion Rate</h3>
            {isLoading ? <div className="skeleton h-48" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="convRate" stroke="#22C55E" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === "leads" && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Daily Lead Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="leads" fill="#6366F1" radius={[4, 4, 0, 0]} name="Created" />
              <Bar dataKey="converted" fill="#22C55E" radius={[4, 4, 0, 0]} name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} style={{ color: "var(--warning)" }} />
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--warning)15", color: "var(--warning)" }}>
            Auto-generated
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 flex gap-3"
            >
              <span className="text-lg">
                {insight.trend === "up" ? "📈" : insight.trend === "down" ? "📉" : "💡"}
              </span>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}







// // In src/app/(dashboard)/analytics/page.tsx
// // Replace the TABS constant and tab rendering with:

// const TABS = ["overview", "revenue", "leads", "staff", "geographic"] as const;

// // Add imports:
// import { StaffPerformanceSection } from "@/modules/analytics/StaffPerformanceSection";
// import { GeographicSection } from "@/modules/analytics/GeographicSection";

// // Add these tab render blocks after existing tab blocks:
// {tab === "staff" && <StaffPerformanceSection />}
// {tab === "geographic" && <GeographicSection />}