"use client";
import { useState } from "react";
import { useCompanyStore } from "@/store/companyStore";
import { db } from "@/db/schema";
import { CheckCircle } from "lucide-react";

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "UTC",
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", example: "25/06/2024" },
  { value: "MM/DD/YYYY", example: "06/25/2024" },
  { value: "YYYY-MM-DD", example: "2024-06-25" },
];

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "bn", label: "বাংলা (Bengali)", flag: "🇧🇩" },
] as const;

export default function LocalizationPage() {
  const { activeCompany, updateCompany } = useCompanyStore();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState(activeCompany?.language || "en");
  const [timezone, setTimezone] = useState(activeCompany?.timezone || "Asia/Dhaka");
  const [dateFormat, setDateFormat] = useState(activeCompany?.dateFormat || "DD/MM/YYYY");
  const [currency, setCurrency] = useState(activeCompany?.currency || "BDT");

  const selectStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    borderRadius: 8,
    padding: "10px 14px",
    width: "100%",
    fontSize: 14,
    outline: "none",
  };

  async function handleSave() {
    if (!activeCompany) return;
    const updates = { language: lang as "en" | "bn", timezone, dateFormat, currency: currency as "BDT" | "USD" | "EUR", updatedAt: Date.now() };
    await db.companies.update(activeCompany.id, updates);
    updateCompany(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Localization</h2>

      {/* Language */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Language</h3>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((l) => (
            <button key={l.value} onClick={() => setLang(l.value)}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
              style={{
                background: lang === l.value ? "var(--primary-muted)" : "var(--bg-elevated)",
                border: `2px solid ${lang === l.value ? "var(--primary)" : "var(--border-subtle)"}`,
              }}>
              <span className="text-2xl">{l.flag}</span>
              <span className="font-medium text-sm" style={{ color: lang === l.value ? "var(--primary)" : "var(--text-primary)" }}>
                {l.label}
              </span>
              {lang === l.value && <CheckCircle size={14} style={{ color: "var(--primary)", marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
        {lang === "bn" && (
          <p className="text-xs mt-3 p-2 rounded" style={{ background: "var(--warning)10", color: "var(--warning)" }}>
            ℹ️ Bengali i18n is a skeleton implementation — full translation strings can be added in /public/locales/bn.json
          </p>
        )}
      </div>

      {/* Timezone + Currency + Date Format */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Regional Settings</h3>
        <div>
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Timezone</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={selectStyle}>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>Date Format</label>
          <div className="grid grid-cols-3 gap-2">
            {DATE_FORMATS.map((df) => (
              <button key={df.value} onClick={() => setDateFormat(df.value)}
                className="p-2.5 rounded-lg text-center transition-all"
                style={{
                  background: dateFormat === df.value ? "var(--primary-muted)" : "var(--bg-elevated)",
                  border: `1px solid ${dateFormat === df.value ? "var(--primary)40" : "var(--border-subtle)"}`,
                }}>
                <p className="text-xs font-mono font-bold"
                  style={{ color: dateFormat === df.value ? "var(--primary)" : "var(--text-primary)" }}>
                  {df.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{df.example}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as "BDT" | "USD" | "EUR")} style={selectStyle}>
            <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
          </select>
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{ background: saved ? "var(--accent-green)" : "var(--primary)", color: "white" }}>
        {saved ? <><CheckCircle size={16} /> Saved!</> : "Save Localization Settings"}
      </button>
    </div>
  );
}