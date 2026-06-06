"use client";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Lead } from "@/types/crm.types";
import { DataTable, Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Avatar } from "@/components/shared/Avatar";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, LEAD_SOURCE_COLORS } from "@/utils/constants";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useCRMStore } from "@/store/crmStore";
import { BulkActionsBar } from "./BulkActionsBar";
import { crmService } from "@/services/crmService";
import { useAuthStore } from "@/store/authStore";

interface Props {
  leads: Lead[];
}

export function LeadListView({ leads }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { setSelectedLead, deleteLead } = useCRMStore();
  const { user } = useAuthStore();

  const columns: Column<Lead>[] = [
    {
      key: "name",
      label: "Lead",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" color="var(--primary)" />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (v) => (
        <Badge
          label={LEAD_STATUS_LABELS[String(v)]}
          color={LEAD_STATUS_COLORS[String(v)]}
        />
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (v) => (
        <Badge
          label={LEAD_SOURCE_LABELS[String(v)]}
          color={LEAD_SOURCE_COLORS[String(v)]}
          variant="outline"
        />
      ),
    },
    {
      key: "value",
      label: "Value",
      sortable: true,
      render: (v) => (
        <span className="text-sm font-mono font-semibold" style={{ color: "var(--accent-green)" }}>
          {formatCurrency(Number(v), "BDT")}
        </span>
      ),
    },
    {
      key: "score",
      label: "Score",
      sortable: true,
      render: (v) => {
        const score = Number(v) || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full" style={{ background: "var(--border-subtle)" }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${score}%`,
                  background: score > 70 ? "var(--accent-green)" : score > 40 ? "var(--warning)" : "var(--danger)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{score}</span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (v) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(Number(v))}</span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setSelectedLead(row); }}
            className="p-1 rounded hover:opacity-80" style={{ color: "var(--primary)" }}>
            <Eye size={14} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) return;
              deleteLead(row.id);
              await crmService.deleteLead(row.id, user.id, user.name, user.companyId);
            }}
            className="p-1 rounded hover:opacity-80" style={{ color: "var(--danger)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  async function handleBulkDelete() {
    if (!user) return;
    for (const id of selectedIds) {
      deleteLead(id);
      await crmService.deleteLead(id, user.id, user.name, user.companyId);
    }
    setSelectedIds(new Set());
  }

  return (
    <>
      <DataTable
        data={leads as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        rowKey="id"
        onRowClick={(row) => setSelectedLead(row as unknown as Lead)}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        virtualize={leads.length > 50}
        maxHeight={520}
        emptyMessage="No leads found — adjust filters or add new leads"
      />
      <BulkActionsBar
        selectedIds={selectedIds}
        leads={leads}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkAssign={() => {}}
      />
    </>
  );
}