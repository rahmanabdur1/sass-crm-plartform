"use client";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/store/companyStore";
import { db } from "@/db/schema";
import { BarChartWidget } from "@/components/charts/BarChartWidget";
import { formatCurrency } from "@/utils/formatters";
import { MapPin } from "lucide-react";

interface RegionData {
  region: string;
  leads: number;
  revenue: number;
  branches: number;
}

export function GeographicSection() {
  const { activeCompany } = useCompanyStore();
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeCompany) return;
    loadData();
  }, [activeCompany]);

  async function loadData() {
    if (!activeCompany) return;
    const [leads, branches] = await Promise.all([
      db.leads.where("companyId").equals(activeCompany.id).toArray(),
      db.branches.where("companyId").equals(activeCompany.id).toArray(),
    ]);

    const regionMap: Record<string, RegionData> = {};

    leads.forEach((l) => {
      const r = l.location?.region || l.location?.city || "Unknown";
      if (!regionMap[r]) regionMap[r] = { region: r, leads: 0, revenue: 0, branches: 0 };
      regionMap[r].leads++;
    });

    branches.forEach((b) => {
      const r = b.location.region || b.location.city || "Unknown";
      if (!regionMap[r]) regionMap[r] = { region: r, leads: 0, revenue: 0, branches: 0 };
      regionMap[r].revenue += b.metrics.revenue;
      regionMap[r].branches++;
    });

    setRegionData(Object.values(regionMap).sort((a, b) => b.leads - a.leads));
    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <BarChartWidget
            title="Lead Density by Region"
            data={regionData.slice(0, 6)}
            dataKey="leads"
            xKey="region"
            color="#6366F1"
            height={220}
          />
        </div>
        <div className="glass-card p-5">
          <BarChartWidget
            title="Revenue by Region"
            data={regionData.slice(0, 6)}
            dataKey="revenue"
            xKey="region"
            color="#22C55E"
            height={220}
            formatter={(v) => `৳${(v / 1000).toFixed(0)}K`}
          />
        </div>
      </div>

      {/* Region Comparison Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Region Comparison</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Region", "Total Leads", "Revenue", "Branches", "Lead Density"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionData.map((r, i) => {
              const maxLeads = regionData[0]?.leads || 1;
              return (
                <tr key={r.region} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} style={{ color: "var(--primary)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.region}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>{r.leads}</td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--accent-green)" }}>
                    {formatCurrency(r.revenue, "BDT")}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{r.branches}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border-subtle)" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${(r.leads / maxLeads) * 100}%`, background: "var(--primary)" }} />
                      </div>
                      <span className="text-xs font-mono w-8 text-right" style={{ color: "var(--text-muted)" }}>
                        {((r.leads / maxLeads) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}