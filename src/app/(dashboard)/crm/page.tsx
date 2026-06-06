"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import { Plus,Search} from "lucide-react";
import { useCRMStore } from "../../../store/crmStore";
import { useAuthStore } from "../../../store/authStore";
import { useCompanyStore } from "../../../store/companyStore";
import { crmService } from "../../../services/crmService";
import { Lead, LeadStatus } from "../../../types/crm.types";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS } from "../../../utils/constants";
import { formatCurrency, formatRelativeTime } from "../../../utils/formatters";
import { LeadDetailPanel } from "../../../modules/crm/LeadDetailPanel";
import { CreateLeadModal } from "../../../modules/crm/CreateLeadModal";

const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "qualified", "negotiation", "converted", "lost"];

function LeadCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  const { setSelectedLead } = useCRMStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="glass-card p-3 cursor-grab active:cursor-grabbing mb-2"
      onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lead.name}</h4>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: `${LEAD_STATUS_COLORS[lead.status]}15`,
            color: LEAD_STATUS_COLORS[lead.status],
          }}
        >
          {LEAD_SOURCE_LABELS[lead.source]}
        </span>
      </div>
      <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{lead.email}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold" style={{ color: "var(--accent-green)" }}>
          ৳{formatCurrency(lead.value, "BDT").replace("BDT", "").trim()}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatRelativeTime(lead.createdAt)}
        </span>
      </div>
      {lead.score !== undefined && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${lead.score}%`,
              background: lead.score > 70 ? "var(--accent-green)" : lead.score > 40 ? "var(--warning)" : "var(--danger)",
            }}
          />
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const color = LEAD_STATUS_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col"
      style={{
        minWidth: 240,
        maxWidth: 280,
        background: isOver ? `${color}08` : "transparent",
        borderRadius: 12,
        transition: "background 0.2s",
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {LEAD_STATUS_LABELS[status]}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: `${color}15`, color }}
          >
            {leads.length}
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          ৳{leads.reduce((s, l) => s + l.value, 0).toLocaleString()}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 min-h-32 p-2 rounded-xl"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
        <AnimatePresence>
          {leads.map((lead) => (
            <motion.div key={lead.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LeadCard lead={lead} />
            </motion.div>
          ))}
        </AnimatePresence>
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs" style={{ color: "var(--text-muted)" }}>
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

export default function CRMPage() {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const { leads, setLeads, updateLead, getLeadsByStatus, isLoading, setLoading, selectedLead, setSelectedLead } = useCRMStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!activeCompany) return;
    loadLeads();
  }, [activeCompany]);

  async function loadLeads() {
    if (!activeCompany) return;
    setLoading(true);
    const data = await crmService.getLeads(activeCompany.id);
    setLeads(data);
    setLoading(false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !user) return;

    const leadId = String(active.id);
    const newStatus = over.id as LeadStatus;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    updateLead(leadId, { status: newStatus });
    await crmService.updateLeadStatus(leadId, newStatus, user.id, user.name, user.companyId);
  }

  const leadsByStatus = getLeadsByStatus();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>CRM Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {leads.length} leads · Drag to move between stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="outline-none bg-transparent text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "white" }}
            onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                leads={leadsByStatus[status].filter(
                  (l) => !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase())
                )}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      {/* Create Lead Modal */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(lead) => {
            useCRMStore.getState().addLead(lead);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}





















// // Add import at top
// import { LeadImportModal } from "@/modules/crm/LeadImportModal";

// // Add state
// const [showImportModal, setShowImportModal] = useState(false);

// // Add button next to "Add Lead"
// <button
//   onClick={() => setShowImportModal(true)}
//   className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
//   style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
// >
//   <Upload size={16} /> Import CSV
// </button>

// // Add modal render at bottom
// {showImportModal && (
//   <LeadImportModal
//     onClose={() => setShowImportModal(false)}
//     onImported={() => setShowImportModal(false)}
//   />
// )}





// Add to existing CRM page — view toggle and list/kanban switch
// Insert these additions at the top of the file:

// import { List, Columns, SlidersHorizontal, Upload } from "lucide-react";
// import { LeadListView } from "@/modules/crm/LeadListView";
// import { LeadFiltersPanel } from "@/modules/crm/LeadFiltersPanel";
// import { LeadImportModal } from "@/modules/crm/LeadImportModal";

// // Add these states inside CRMPage():
// const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
// const [showFilters, setShowFilters] = useState(false);
// const [showImport, setShowImport] = useState(false);
// const filteredLeads = useCRMStore((s) => s.getFilteredLeads());
// const activeFilterCount = Object.values(useCRMStore.getState().filter).filter(Boolean).length;

// Replace the header actions div with:
/*
<div className="flex items-center gap-2">
  // View toggle
  <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
    {[
      { mode: "kanban", icon: <Columns size={14} /> },
      { mode: "list", icon: <List size={14} /> },
    ].map(({ mode, icon }) => (
      <button key={mode} onClick={() => setViewMode(mode as "kanban" | "list")}
        className="flex items-center gap-1 px-3 py-2 text-sm transition-all"
        style={{
          background: viewMode === mode ? "var(--primary)" : "var(--bg-card)",
          color: viewMode === mode ? "white" : "var(--text-secondary)",
        }}>
        {icon}
      </button>
    ))}
  </div>

  // Filters
  <button onClick={() => setShowFilters(true)}
    className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
    style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
    <SlidersHorizontal size={14} /> Filters
    {activeFilterCount > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
        style={{ background: "var(--primary)", color: "white", fontSize: 10 }}>
        {activeFilterCount}
      </span>
    )}
  </button>

  // Import
  <button onClick={() => setShowImport(true)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
    style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
    <Upload size={14} /> Import
  </button>

  // Add Lead
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
    style={{ background: "var(--primary)", color: "white" }}
    onClick={() => setShowCreateModal(true)}>
    <Plus size={16} /> Add Lead
  </button>
</div>
*/

// Render list view instead of kanban when viewMode === "list":
/*
{viewMode === "list" ? (
  <LeadListView leads={filteredLeads} />
) : (
  // existing Kanban DndContext...
)}
*/

// Add panels and modals:
/*
<LeadFiltersPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
{showImport && <LeadImportModal onClose={() => setShowImport(false)} onImported={() => setShowImport(false)} />}
*/