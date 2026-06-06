"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, GitBranch, MapPin, Users, TrendingUp } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";
import { db } from "../../../db/schema";
import { Branch } from "../../../types/branch.types";
import { formatCurrency } from "../../../utils/formatters";

export default function BranchesPage() {
  const { activeCompany } = useCompanyStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeCompany) return;
    db.branches.where("companyId").equals(activeCompany.id).toArray().then((data) => {
      setBranches(data);
      setIsLoading(false);
    });
  }, [activeCompany]);

  const STATUS_COLORS = { active: "#22C55E", inactive: "#EF4444", pending: "#F59E0B", archived: "#9CA3AF" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Branches</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {branches.filter((b) => b.status === "active").length} active branches
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--primary)", color: "white" }}>
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card h-48 skeleton" />
            ))
          : branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{branch.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{branch.code}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{
                      background: `${STATUS_COLORS[branch.status]}15`,
                      color: STATUS_COLORS[branch.status],
                    }}
                  >
                    {branch.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {branch.location.city}, {branch.location.region}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <TrendingUp size={12} />, label: "Revenue", value: formatCurrency(branch.metrics.revenue, "BDT") },
                    { icon: <Users size={12} />, label: "Staff", value: String(branch.metrics.activeStaff) },
                    { icon: <GitBranch size={12} />, label: "Total Leads", value: String(branch.metrics.totalLeads) },
                    {
                      icon: <TrendingUp size={12} />,
                      label: "Converted",
                      value: `${((branch.metrics.convertedLeads / branch.metrics.totalLeads) * 100 || 0).toFixed(0)}%`,
                    },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                      <p className="text-sm font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
}















// // Replace state/loading with React Query and add modal:
// import { useBranchesQuery } from "@/hooks/useBranchesQuery";
// import { CreateBranchModal } from "@/modules/branches/CreateBranchModal";

// // Replace manual db load:
// const { branches, isLoading } = useBranchesQuery();
// const [showCreateModal, setShowCreateModal] = useState(false);

// // Replace "Add Branch" button onClick:
// onClick={() => setShowCreateModal(true)}

// // Add at bottom of JSX:
// {showCreateModal && <CreateBranchModal onClose={() => setShowCreateModal(false)} />}

// // Update branch cards to link to detail page:
// import Link from "next/link";
// // Wrap card in: <Link href={`/branches/${branch.id}`}>