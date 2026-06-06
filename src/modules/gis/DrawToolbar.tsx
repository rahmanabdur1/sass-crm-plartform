"use client";

import { Pencil, Trash2, Filter } from "lucide-react";

interface Props {
  onDrawModeChange: (mode: "none" | "polygon") => void;
  onClearDrawings: () => void;
  drawMode: "none" | "polygon";
  drawnAreaLeadsCount?: number;
}

export function DrawToolbar({ onDrawModeChange, onClearDrawings, drawMode, drawnAreaLeadsCount }: Props) {
  return (
    <div
      className="absolute top-4 right-4 z-10 flex flex-col gap-2"
      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}
    >
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
        <button
          onClick={() => onDrawModeChange(drawMode === "polygon" ? "none" : "polygon")}
          className="flex items-center gap-2 px-3 py-2.5 text-sm w-full transition-all hover:opacity-80"
          style={{
            color: drawMode === "polygon" ? "var(--primary)" : "var(--text-secondary)",
            background: drawMode === "polygon" ? "var(--primary-muted)" : "transparent",
          }}
        >
          <Pencil size={14} />
          {drawMode === "polygon" ? "Drawing..." : "Draw Area"}
        </button>

        {drawMode !== "none" && (
          <button
            onClick={onClearDrawings}
            className="flex items-center gap-2 px-3 py-2.5 text-sm w-full transition-all hover:opacity-80"
            style={{ color: "var(--danger)", borderTop: "1px solid var(--border-subtle)" }}
          >
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {drawnAreaLeadsCount !== undefined && drawnAreaLeadsCount > 0 && (
        <div className="px-3 py-2 rounded-xl text-xs text-center"
          style={{ background: "var(--primary-muted)", color: "var(--primary)", border: "1px solid var(--primary)30" }}>
          <Filter size={12} className="inline mr-1" />
          {drawnAreaLeadsCount} leads in area
        </div>
      )}
    </div>
  );
}