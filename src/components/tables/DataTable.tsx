"use client";
import { useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  virtualize?: boolean;
  maxHeight?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  onRowClick,
  selectable,
  selectedIds,
  onSelectionChange,
  virtualize = false,
  maxHeight = 500,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const parentRef = useRef<HTMLDivElement>(null);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === bv) return 0;
      const res = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? res : -res;
    });
  }, [data, sortKey, sortDir]);

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    enabled: virtualize,
  });

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelectAll() {
    if (!onSelectionChange) return;
    if (selectedIds?.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((r) => String(r[rowKey]))));
    }
  }

  function toggleRow(id: string) {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  }

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={12} style={{ color: "var(--primary)" }} />
      : <ChevronDown size={12} style={{ color: "var(--primary)" }} />;
  };

  const renderRows = (rows: T[]) =>
    rows.map((row, i) => {
      const id = String(row[rowKey]);
      const isSelected = selectedIds?.has(id);
      return (
        <tr
          key={id}
          onClick={() => onRowClick?.(row)}
          className={onRowClick ? "cursor-pointer hover:opacity-80" : ""}
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: isSelected ? "var(--primary-muted)" : "transparent",
            transition: "background 0.15s",
          }}
        >
          {selectable && (
            <td className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={() => toggleRow(id)}
                onClick={(e) => e.stopPropagation()}
                style={{ accentColor: "var(--primary)", width: 14, height: 14 }}
              />
            </td>
          )}
          {columns.map((col) => (
            <td
              key={String(col.key)}
              className="px-4 py-3 text-sm"
              style={{ color: "var(--text-secondary)", width: col.width }}
            >
              {col.render
                ? col.render(row[col.key as keyof T], row)
                : String(row[col.key as keyof T] ?? "—")}
            </td>
          ))}
        </tr>
      );
    });

  return (
    <div className="glass-card overflow-hidden">
      <div
        ref={parentRef}
        style={{ maxHeight: virtualize ? maxHeight : undefined, overflowY: virtualize ? "auto" : undefined }}
      >
        <table className="w-full">
          <thead className="sticky top-0 z-10" style={{ background: "var(--bg-secondary)" }}>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds?.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: "var(--primary)", width: 14, height: 14 }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)", width: col.width }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      {col.label}
                      <SortIcon colKey={String(col.key)} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : virtualize ? (
              <>
                <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }} />
                {virtualizer.getVirtualItems().map((vRow) =>
                  renderRows([sortedData[vRow.index]])
                )}
                <tr style={{
                  height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0)
                }} />
              </>
            ) : (
              renderRows(sortedData)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}