"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users, TrendingUp, Target, Edit2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { db } from "@/db/schema";
import { Branch } from "@/types/branch.types";
import { Lead } from "@/types/crm.types";
import { User } from "@/types/auth.types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { LEAD_STATUS_COLORS } from "@/utils/constants";

export default function BranchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadBranchData(String(id));
  }, [id]);

  async function loadBranchData(branchId: string) {
    const [b, l] = await Promise.all([
      db.branches.get(branchId),
      db.leads.where("branchId").equals(branchId).toArray(),
    ]);
    setBranch(b || null);
    setLeads(l);

    if (b?.staffIds?.length) {
      const members = await db.users.bulkGet(b.staffIds);
      setStaff(members.filter(Boolean) as User[]);
    }
    setIsLoading(false);
  }

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card h-32 skeleton" />
      ))}
    </div>
  );

  if (!branch) return (
    <div className="glass-card p-12 text-center">
      <p style={{ color: "var(--text-muted)" }}>Branch not found</p>
    </div>
  );

  const conversionRate = leads.length > 0
    ? ((leads.filter((l) => l.status === "converted").length / leads.length) * 100).toFixed(1)
    : "0";

  const leadsByStatus = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(leadsByStatus).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    color: LEAD_STATUS_COLORS[status],
  }));

  // Simulated monthly revenue trend
  const revenueData = Array.from({ length: 6 }).map((_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
    revenue: Math.floor(branch.metrics.revenue * (0.5 + i * 0.1) + Math.random() * 20000),
  }));

  const tooltipStyle = {
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
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-lg transition-all hover:opacity-80"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{branch.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
              style={{
                background: branch.status === "active" ? "var(--accent-green-muted)" : "rgba(239,68,68,0.1)",
                color: branch.status === "active" ? "var(--accent-green)" : "var(--danger)",
              }}>
              {branch.status}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {branch.location.address} · {branch.location.city}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
          <Edit2 size={14} /> Edit Branch
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: formatCurrency(branch.metrics.revenue, "BDT"), icon: <TrendingUp size={18} />, color: "#6366F1" },
          { label: "Total Leads", value: String(leads.length), icon: <Users size={18} />, color: "#22C55E" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: <Target size={18} />, color: "#F59E0B" },
          { label: "Active Staff", value: String(branch.metrics.activeStaff), icon: <Users size={18} />, color: "#3B82F6" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${kpi.color}15`, color: kpi.color }}>
              {kpi.icon}
            </div>
            <p className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Revenue Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value ?? 0), "BDT")} />
              <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusChartData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="status" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, index) => (
                  <rect key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Table */}
      {staff.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Staff Members</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Member", "Role", "Joined"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{member.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                      style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDate(member.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}