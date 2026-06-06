"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, FileText, GitBranch, BarChart2, ArrowRight } from "lucide-react";
import { CreateLeadModal } from "@/modules/crm/CreateLeadModal";
import { useCRMStore } from "@/store/crmStore";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export function QuickActionsPanel() {
  const router = useRouter();
  const { addLead } = useCRMStore();
  const [showCreateLead, setShowCreateLead] = useState(false);

  const ACTIONS: QuickAction[] = [
    {
      label: "Add New Lead",
      description: "Create a CRM lead",
      icon: <UserPlus size={18} />,
      color: "#6366F1",
      action: () => setShowCreateLead(true),
    },
    {
      label: "Generate Report",
      description: "Create a performance report",
      icon: <FileText size={18} />,
      color: "#22C55E",
      action: () => router.push("/reports"),
    },
    {
      label: "Add Branch",
      description: "Register a new branch",
      icon: <GitBranch size={18} />,
      color: "#F59E0B",
      action: () => router.push("/branches"),
    },
    {
      label: "View Analytics",
      description: "Check performance metrics",
      icon: <BarChart2 size={18} />,
      color: "#3B82F6",
      action: () => router.push("/analytics"),
    },
  ];

  return (
    <>
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
        <div className="space-y-2">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={action.action}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left group transition-all hover:opacity-80"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${action.color}15`, color: action.color }}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{action.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{action.description}</p>
              </div>
              <ArrowRight size={14} style={{ color: "var(--text-muted)" }}
                className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>

      {showCreateLead && (
        <CreateLeadModal
          onClose={() => setShowCreateLead(false)}
          onCreated={(lead) => {
            addLead(lead);
            setShowCreateLead(false);
          }}
        />
      )}
    </>
  );
}