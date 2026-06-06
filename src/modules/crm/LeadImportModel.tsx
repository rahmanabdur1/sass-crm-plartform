"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { Upload, X, AlertTriangle, CheckCircle, Loader2, Download } from "lucide-react";
import { useCRMStore } from "@/store/crmStore";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { crmService } from "@/services/crmService";
import { Lead } from "@/types/crm.types";

interface ParsedRow {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  value?: string;
  notes?: string;
}

interface ImportResult {
  imported: number;
  duplicates: number;
  errors: string[];
}

function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 0;
  if (lead.email) score += 15;
  if (lead.phone) score += 10;
  if (lead.value && lead.value > 100000) score += 20;
  if (lead.value && lead.value > 500000) score += 10;
  if (lead.source === "referral") score += 25;
  if (lead.source === "web") score += 15;
  if (lead.source === "event") score += 20;
  if (lead.notes && lead.notes.length > 20) score += 10;
  score += Math.floor(Math.random() * 10);
  return Math.min(100, score);
}

export function LeadImportModal({ onClose, onImported }: { onClose: () => void; onImported: (leads: Lead[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { leads: existingLeads, addLead } = useCRMStore();
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();

  function parseFile(file: File) {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setParsedData(results.data),
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) parseFile(file);
  }

  function detectDuplicate(email: string): boolean {
    return existingLeads.some((l) => l.email.toLowerCase() === email.toLowerCase());
  }

  async function handleImport() {
    if (!user || !activeCompany || parsedData.length === 0) return;
    setIsImporting(true);

    const errors: string[] = [];
    let imported = 0;
    let duplicates = 0;
    const newLeads: Lead[] = [];

    for (const row of parsedData) {
      if (!row.name || !row.email) {
        errors.push(`Row skipped — missing name or email`);
        continue;
      }

      if (detectDuplicate(row.email)) {
        duplicates++;
        continue;
      }

      const leadData = {
        companyId: activeCompany.id,
        name: row.name,
        email: row.email,
        phone: row.phone || "",
        source: (["web", "referral", "cold_call", "social", "event"].includes(row.source || "") ? row.source : "other") as Lead["source"],
        status: "new" as const,
        assignedTo: user.id,
        tags: [],
        value: parseFloat(row.value || "0") || 0,
        notes: row.notes,
      };

      const lead = await crmService.createLead(
        { ...leadData, score: calculateLeadScore(leadData) },
        user.id,
        user.name
      );

      newLeads.push(lead);
      addLead(lead);
      imported++;
    }

    setResult({ imported, duplicates, errors });
    setIsImporting(false);
    if (newLeads.length > 0) onImported(newLeads);
  }

  function downloadTemplate() {
    const template = "name,email,phone,source,value,notes\nJohn Doe,john@example.com,+8801700000000,referral,150000,Interested in enterprise plan";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead_import_template.csv";
    a.click();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Import Leads from CSV</h3>
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
              <Download size={12} /> Template
            </button>
            <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Drop Zone */}
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{
              borderColor: isDragging ? "var(--primary)" : "var(--border-default)",
              background: isDragging ? "var(--primary-muted)" : "var(--bg-elevated)",
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
            />
            <Upload size={28} style={{ color: "var(--primary)", margin: "0 auto 12px" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Drop CSV file here or click to browse
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Required columns: name, email — Optional: phone, source, value, notes
            </p>
          </div>

          {/* Parsed Preview */}
          {parsedData.length > 0 && !result && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Preview — {parsedData.length} rows found
              </p>
              <div className="rounded-lg overflow-hidden max-h-40 overflow-y-auto"
                style={{ border: "1px solid var(--border-subtle)" }}>
                {parsedData.slice(0, 5).map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-xs"
                    style={{
                      background: i % 2 === 0 ? "var(--bg-elevated)" : "var(--bg-card)",
                      color: detectDuplicate(row.email || "")
                        ? "var(--warning)"
                        : "var(--text-secondary)",
                    }}>
                    <span>{row.name} — {row.email}</span>
                    {detectDuplicate(row.email || "") && (
                      <span style={{ color: "var(--warning)" }}>duplicate</span>
                    )}
                  </div>
                ))}
                {parsedData.length > 5 && (
                  <div className="px-3 py-2 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    +{parsedData.length - 5} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg"
                style={{ background: "var(--accent-green-muted)" }}>
                <CheckCircle size={16} style={{ color: "var(--accent-green)" }} />
                <span className="text-sm" style={{ color: "var(--accent-green)" }}>
                  {result.imported} leads imported successfully
                </span>
              </div>
              {result.duplicates > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ background: "rgba(245,158,11,0.1)" }}>
                  <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                  <span className="text-sm" style={{ color: "var(--warning)" }}>
                    {result.duplicates} duplicate emails skipped
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
              {result ? "Close" : "Cancel"}
            </button>
            {parsedData.length > 0 && !result && (
              <button onClick={handleImport} disabled={isImporting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: "var(--primary)", color: "white" }}>
                {isImporting
                  ? <Loader2 size={16} className="animate-spin" />
                  : `Import ${parsedData.length} Leads`}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}