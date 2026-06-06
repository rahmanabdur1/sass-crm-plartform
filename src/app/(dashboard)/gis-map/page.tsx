"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Minimize2, Download, GitBranch, MapPin, Thermometer, Route } from "lucide-react";
import { useCompanyStore } from "@/store/companyStore";
import { db } from "@/db/schema";
import { Lead } from "@/types/crm.types";
import { Branch } from "@/types/branch.types";
import { useGIS } from "@/hooks/useGis";
import { DrawToolbar } from "@/modules/gis/DrawToolbar";


const MapComponent = dynamic(() => import("@/modules/gis/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full" style={{ background: "var(--bg-card)" }}>
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading map...</p>
      </div>
    </div>
  ),
}) as any;

const MAP_CONTAINER_ID = "gis-map-container";

const LAYER_BUTTONS = [
  { key: "branches" as const, icon: <GitBranch size={14} />, label: "Branches" },
  { key: "leads" as const, icon: <MapPin size={14} />, label: "Leads" },
  { key: "heatmap" as const, icon: <Thermometer size={14} />, label: "Heatmap" },
  { key: "routes" as const, icon: <Route size={14} />, label: "Routes" },
];

export default function GISMapPage() {
  const { activeCompany } = useCompanyStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const {
    layers, toggleLayer,
    selectedMarker, setSelectedMarker,
    drawMode, setDrawMode,
    leadsInPolygon,
    applyPolygonFilter,
    clearPolygonFilter,
    exportMapAsPNG,
    isFullscreen, toggleFullscreen,
  } = useGIS(leads, branches);

  useEffect(() => {
    if (!activeCompany) return;
    Promise.all([
      db.leads.where("companyId").equals(activeCompany.id).toArray(),
      db.branches.where("companyId").equals(activeCompany.id).toArray(),
    ]).then(([l, b]) => {
      setLeads(l);
      setBranches(b);
    });
  }, [activeCompany]);

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 p-4 bg-[var(--bg-primary)]" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>GIS Map</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {branches.length} branches · {leads.length} leads
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Layer Toggles */}
          {LAYER_BUTTONS.map(({ key, icon, label }) => (
            <button key={key} onClick={() => toggleLayer(key)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: layers[key] ? "var(--primary-muted)" : "var(--bg-card)",
                color: layers[key] ? "var(--primary)" : "var(--text-secondary)",
                border: `1px solid ${layers[key] ? "var(--primary)40" : "var(--border-subtle)"}`,
              }}>
              {icon} {label}
            </button>
          ))}

          {/* Export */}
          <button onClick={() => exportMapAsPNG(MAP_CONTAINER_ID)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            <Download size={14} /> Export PNG
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div id={MAP_CONTAINER_ID}
        className="glass-card overflow-hidden relative"
        style={{ height: isFullscreen ? "calc(100vh - 140px)" : "calc(100vh - 220px)" }}>
        <MapComponent leads={leads} branches={branches} layers={layers} />
        <DrawToolbar
          drawMode={drawMode}
          onDrawModeChange={setDrawMode}
          onClearDrawings={clearPolygonFilter}
          drawnAreaLeadsCount={leadsInPolygon.length}
        />
      </div>

      {/* Region Comparison Panel */}
      {leadsInPolygon.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Leads in Selected Area ({leadsInPolygon.length})
            </h3>
            <button onClick={clearPolygonFilter}
              className="text-xs px-2 py-1 rounded"
              style={{ color: "var(--danger)", background: "rgba(239,68,68,0.1)" }}>
              Clear Selection
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Value", value: `৳${leadsInPolygon.reduce((s, l) => s + l.value, 0).toLocaleString()}` },
              { label: "Avg Score", value: `${(leadsInPolygon.reduce((s, l) => s + (l.score || 0), 0) / leadsInPolygon.length).toFixed(0)}/100` },
              { label: "Converted", value: leadsInPolygon.filter((l) => l.status === "converted").length },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-lg"
                style={{ background: "var(--bg-elevated)" }}>
                <p className="font-mono font-bold" style={{ color: "var(--primary)" }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}