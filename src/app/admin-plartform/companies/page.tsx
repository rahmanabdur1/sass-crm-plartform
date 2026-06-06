"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ToggleRight, ToggleLeft, Plus } from "lucide-react";
import { db } from "@/db/schema";
import { Company } from "@/types/company.types";
import { formatDate } from "@/utils/formatters";
import { useAuthStore } from "@/store/authStore";
import { auditService } from "@/services/auditService";

export default function AdminCompaniesPage() {
  const { user } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { db.companies.toArray().then((c) => { setCompanies(c); setIsLoading(false); }); }, []);

  async function toggleCompany(company: Company) {
    if (!user) return;
    const newStatus = !company.isActive;
    await db.companies.update(company.id, { isActive: newStatus, updatedAt: Date.now() });
    await auditService.log({
      companyId: company.id,
      actorId: user.id,
      actorName: user.name,
      action: newStatus ? "company.activated" : "company.deactivated",
      target: "company",
      targetId: company.id,
    });
    setCompanies((prev) => prev.map((c) => c.id === company.id ? { ...c, isActive: newStatus } : c));
  }

  const PLAN_COLORS = { starter: "#9CA3AF", growth: "#6366F1", enterprise: "#F59E0B" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Company Management</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--primary)", color: "white" }}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Company", "Plan", "Created", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              : companies.map((company) => (
                  <tr key={company.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${company.primaryColor || "#6366F1"}20`, color: company.primaryColor || "#6366F1" }}>
                          <Building2 size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{company.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{company.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                        style={{
                          background: `${PLAN_COLORS[company.plan]}15`,
                          color: PLAN_COLORS[company.plan],
                        }}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(company.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: company.isActive ? "var(--accent-green-muted)" : "rgba(239,68,68,0.1)",
                          color: company.isActive ? "var(--accent-green)" : "var(--danger)",
                        }}>
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleCompany(company)}
                        style={{ color: company.isActive ? "var(--danger)" : "var(--accent-green)" }}>
                        {company.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}