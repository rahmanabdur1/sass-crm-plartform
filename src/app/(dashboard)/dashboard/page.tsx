"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, DollarSign,
  GitBranch, Target, Activity, ArrowUpRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useAuthStore } from "../../../store/authStore";
import { useCompanyStore } from "../../../store/companyStore";
import { db } from "../../../db/schema";
import { formatCurrency, formatNumber, formatRelativeTime } from "../../../utils/formatters";
import { LEAD_STATUS_COLORS } from "../../../utils/constants";

interface KPICard {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [leadStatusData, setLeadStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [branchData, setBranchData] = useState<{ name: string; revenue: number; leads: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ id: string; text: string; time: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !activeCompany) return;
    loadDashboardData();
  }, [user, activeCompany]);

  // KPI live update
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis((prev) =>
        prev.map((kpi) => ({
          ...kpi,
          change: kpi.change + (Math.random() - 0.5) * 0.5,
        }))
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    if (!activeCompany) return;
    setIsLoading(true);
    try {
      const [leads, branches, snapshots] = await Promise.all([
        db.leads.where("companyId").equals(activeCompany.id).toArray(),
        db.branches.where("companyId").equals(activeCompany.id).toArray(),
        db.analyticsSnapshots.where("companyId").equals(activeCompany.id).toArray(),
      ]);

      const totalRevenue = branches.reduce((sum, b) => sum + b.metrics.revenue, 0);
      const totalLeads = leads.length;
      const convertedLeads = leads.filter((l) => l.status === "converted").length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      setKpis([
        {
          label: "Total Revenue",
          value: formatCurrency(totalRevenue, activeCompany.currency as "BDT"),
          change: 12.5,
          icon: <DollarSign size={20} />,
          color: "#6366F1",
        },
        {
          label: "Active Leads",
          value: formatNumber(totalLeads),
          change: 8.2,
          icon: <Users size={20} />,
          color: "#22C55E",
        },
        {
          label: "Conversion Rate",
          value: `${conversionRate.toFixed(1)}%`,
          change: -2.1,
          icon: <Target size={20} />,
          color: "#F59E0B",
        },
        {
          label: "Active Branches",
          value: String(branches.filter((b) => b.status === "active").length),
          change: 5.0,
          icon: <GitBranch size={20} />,
          color: "#3B82F6",
        },
      ]);

      // Revenue chart data (last 12 weeks)
      const sorted = snapshots.sort((a, b) => a.date.localeCompare(b.date));
      setRevenueData(
        sorted.slice(-12).map((s) => ({
          date: s.date.slice(5), // MM-DD
          revenue: s.revenue,
        }))
      );

      // Lead status pie
      const statusCounts: Record<string, number> = {};
      leads.forEach((l) => {
        statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
      });
      setLeadStatusData(
        Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
          color: LEAD_STATUS_COLORS[name] || "#9CA3AF",
        }))
      );

      // Branch bar chart
      setBranchData(
        branches.slice(0, 5).map((b) => ({
          name: b.name.replace(" Branch", ""),
          revenue: b.metrics.revenue,
          leads: b.metrics.totalLeads,
        }))
      );

      // Simulated activity
      setRecentActivity([
        { id: "1", text: "New lead Rahim Uddin created in Dhaka Branch", time: Date.now() - 120000 },
        { id: "2", text: "Lead converted by Manager Rakib Hasan", time: Date.now() - 300000 },
        { id: "3", text: "Monthly report generated for Apex Solutions", time: Date.now() - 600000 },
        { id: "4", text: "New staff member added to Chittagong Branch", time: Date.now() - 900000 },
        { id: "5", text: "Analytics snapshot taken for all branches", time: Date.now() - 1800000 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const customTooltipStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "var(--text-primary)",
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)" }} className="text-sm mt-1">
          Welcome back, {user?.name} — {activeCompany?.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-5 h-28 skeleton" />
            ))
          : kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${kpi.color}15`, color: kpi.color }}
                  >
                    {kpi.icon}
                  </div>
                  <span
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: kpi.change >= 0 ? "var(--accent-green)" : "var(--danger)" }}
                  >
                    {kpi.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {kpi.value}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {kpi.label}
                </div>
              </motion.div>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Revenue Trend
          </h3>
          {isLoading ? (
            <div className="skeleton h-48" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(value) => formatCurrency(Number(value || 0), "BDT")}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Lead Status Pie */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Lead Pipeline
          </h3>
          {isLoading ? (
            <div className="skeleton h-48" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {leadStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {leadStatusData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                    </div>
                    <span className="font-mono" style={{ color: "var(--text-primary)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Branch Performance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Branch Performance
          </h3>
          {isLoading ? (
            <div className="skeleton h-40" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={branchData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <Activity size={16} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "var(--primary)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(item.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}