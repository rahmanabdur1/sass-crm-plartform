"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ChevronRight, ChevronLeft, Zap, Loader2, Rocket } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { db } from "@/db/schema";
import { generateId } from "@/utils/generateId";
import { hashPassword } from "@/utils/crypto";
import { ROLE_PERMISSIONS } from "@/types/auth.types";

const STEPS = [
  { id: 1, title: "Company Profile", description: "Set up your company details" },
  { id: 2, title: "First Branch", description: "Add your first office location" },
  { id: 3, title: "Invite Team", description: "Add your first team member" },
  { id: 4, title: "Demo Data", description: "Optionally load sample data" },
  { id: 5, title: "All Done!", description: "Your platform is ready" },
];

const step1Schema = z.object({
  companyName: z.string().min(2, "Required"),
  currency: z.enum(["BDT", "USD", "EUR"]),
  primaryColor: z.string(),
});

const step2Schema = z.object({
  branchName: z.string().min(2, "Required"),
  city: z.string().min(2, "Required"),
  address: z.string().min(4, "Required"),
});

const step3Schema = z.object({
  memberName: z.string().min(2, "Required"),
  memberEmail: z.string().email("Invalid email"),
  memberPassword: z.string().min(6, "Min 6 chars"),
  memberRole: z.enum(["manager", "staff"]),
}).optional();

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [skipTeam, setSkipTeam] = useState(false);
  const [loadDemoData, setLoadDemoData] = useState(true);
  const { user, updateUser } = useAuthStore();
  const { activeCompany, updateCompany } = useCompanyStore();
  const router = useRouter();

  const [step1Data, setStep1Data] = useState({ companyName: activeCompany?.name || "", currency: "BDT" as const, primaryColor: "#6366F1" });
  const [step2Data, setStep2Data] = useState({ branchName: "", city: "", address: "" });
  const [step3Data, setStep3Data] = useState({ memberName: "", memberEmail: "", memberPassword: "", memberRole: "staff" as const });

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    borderRadius: 8,
    padding: "10px 14px",
    width: "100%",
    fontSize: 14,
    outline: "none",
  };

  async function handleComplete() {
    if (!user || !activeCompany) return;
    setIsCompleting(true);

    try {
      // Step 1 — update company
      await db.companies.update(activeCompany.id, {
        name: step1Data.companyName,
        currency: step1Data.currency,
        primaryColor: step1Data.primaryColor,
        updatedAt: Date.now(),
      });
      updateCompany({ name: step1Data.companyName, currency: step1Data.currency, primaryColor: step1Data.primaryColor });

      // Step 2 — create branch
      if (step2Data.branchName) {
        await db.branches.add({
          id: generateId(),
          companyId: activeCompany.id,
          name: step2Data.branchName,
          code: `BRN-${step2Data.city.toUpperCase().slice(0, 3)}`,
          location: { lat: 23.8103, lng: 90.4125, city: step2Data.city, region: step2Data.city, address: step2Data.address },
          staffIds: [],
          status: "active",
          openedAt: Date.now(),
          metrics: { totalLeads: 0, convertedLeads: 0, revenue: 0, activeStaff: 0 },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Step 3 — invite member
      if (!skipTeam && step3Data.memberEmail) {
        const existing = await db.users.where("email").equals(step3Data.memberEmail).first();
        if (!existing) {
          await db.users.add({
            id: generateId(),
            companyId: activeCompany.id,
            name: step3Data.memberName,
            email: step3Data.memberEmail,
            passwordHash: await hashPassword(step3Data.memberPassword),
            role: step3Data.memberRole,
            permissions: ROLE_PERMISSIONS[step3Data.memberRole],
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onboarded: false,
          });
        }
      }

      // Mark user as onboarded
      await db.users.update(user.id, { onboarded: true, updatedAt: Date.now() });
      updateUser({ onboarded: true });

      localStorage.setItem("saas_onboarded", "true");
    } finally {
      setIsCompleting(false);
      router.push("/dashboard");
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--primary)" }}>
            <Zap size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Welcome to SaaS CRM Pro
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Let's get your workspace set up in 2 minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: s.id < step ? "var(--accent-green)" : s.id === step ? "var(--primary)" : "var(--bg-elevated)",
                    color: s.id <= step ? "white" : "var(--text-muted)",
                    border: `2px solid ${s.id < step ? "var(--accent-green)" : s.id === step ? "var(--primary)" : "var(--border-default)"}`,
                  }}
                >
                  {s.id < step ? <CheckCircle size={14} /> : s.id}
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full" style={{ background: "var(--border-subtle)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: "var(--primary)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="glass-card p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                {STEPS[step - 1].title}
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                {STEPS[step - 1].description}
              </p>

              {/* Step 1 — Company Profile */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Company Name *</label>
                    <input
                      value={step1Data.companyName}
                      onChange={(e) => setStep1Data((p) => ({ ...p, companyName: e.target.value }))}
                      style={inputStyle}
                      placeholder="Apex Solutions BD"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Currency</label>
                      <select
                        value={step1Data.currency}
                        onChange={(e) => setStep1Data((p) => ({ ...p, currency: e.target.value as "BDT" }))}
                        style={{ ...inputStyle }}
                      >
                        <option value="BDT">BDT — Bangladeshi Taka</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Brand Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={step1Data.primaryColor}
                          onChange={(e) => setStep1Data((p) => ({ ...p, primaryColor: e.target.value }))}
                          style={{ ...inputStyle, padding: 4, width: 48, height: 42 }}
                        />
                        <div className="flex gap-1">
                          {["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6"].map((c) => (
                            <button key={c} onClick={() => setStep1Data((p) => ({ ...p, primaryColor: c }))}
                              className="w-6 h-6 rounded-full transition-all hover:scale-110"
                              style={{ background: c, border: `2px solid ${step1Data.primaryColor === c ? "white" : "transparent"}` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — First Branch */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Branch Name *</label>
                    <input
                      value={step2Data.branchName}
                      onChange={(e) => setStep2Data((p) => ({ ...p, branchName: e.target.value }))}
                      style={inputStyle}
                      placeholder="Dhaka Main Office"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>City *</label>
                      <input
                        value={step2Data.city}
                        onChange={(e) => setStep2Data((p) => ({ ...p, city: e.target.value }))}
                        style={inputStyle}
                        placeholder="Dhaka"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Address</label>
                      <input
                        value={step2Data.address}
                        onChange={(e) => setStep2Data((p) => ({ ...p, address: e.target.value }))}
                        style={inputStyle}
                        placeholder="123 Gulshan Ave"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Invite Team Member */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Optional — you can always add members later
                    </p>
                    <button
                      onClick={() => setSkipTeam(!skipTeam)}
                      className="text-xs px-3 py-1 rounded-lg transition-all"
                      style={{
                        background: skipTeam ? "var(--bg-elevated)" : "var(--primary-muted)",
                        color: skipTeam ? "var(--text-muted)" : "var(--primary)",
                      }}
                    >
                      {skipTeam ? "Add member" : "Skip"}
                    </button>
                  </div>
                  {!skipTeam && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Name</label>
                          <input
                            value={step3Data.memberName}
                            onChange={(e) => setStep3Data((p) => ({ ...p, memberName: e.target.value }))}
                            style={inputStyle}
                            placeholder="Team Member"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Role</label>
                          <select
                            value={step3Data.memberRole}
                            onChange={(e) => setStep3Data((p) => ({ ...p, memberRole: e.target.value as "staff" }))}
                            style={{ ...inputStyle }}
                          >
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                        <input
                          value={step3Data.memberEmail}
                          onChange={(e) => setStep3Data((p) => ({ ...p, memberEmail: e.target.value }))}
                          style={inputStyle}
                          placeholder="member@company.com"
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                        <input
                          value={step3Data.memberPassword}
                          onChange={(e) => setStep3Data((p) => ({ ...p, memberPassword: e.target.value }))}
                          style={inputStyle}
                          type="password"
                          placeholder="Temporary password"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4 — Demo Data */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Load sample leads, analytics, and branch data so you can explore the platform immediately.
                    You can clear it anytime from Settings.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Load Demo Data", sub: "60 leads, 30-day analytics, 5 branches", value: true, color: "#6366F1" },
                      { label: "Start Fresh", sub: "Begin with empty workspace", value: false, color: "#9CA3AF" },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setLoadDemoData(opt.value)}
                        className="text-left p-4 rounded-xl transition-all"
                        style={{
                          background: loadDemoData === opt.value ? `${opt.color}15` : "var(--bg-elevated)",
                          border: `2px solid ${loadDemoData === opt.value ? opt.color : "var(--border-subtle)"}`,
                        }}
                      >
                        {loadDemoData === opt.value && (
                          <CheckCircle size={14} style={{ color: opt.color, marginBottom: 6 }} />
                        )}
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5 — All Done */}
              {step === 5 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "var(--accent-green-muted)" }}>
                    <Rocket size={28} style={{ color: "var(--accent-green)" }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    Your workspace is ready!
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Everything is configured. Click below to enter your dashboard and start managing your CRM.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Dashboard", desc: "KPIs & Overview" },
                      { label: "CRM", desc: "Kanban Pipeline" },
                      { label: "GIS Map", desc: "Location Tracking" },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-lg text-center"
                        style={{ background: "var(--bg-elevated)" }}>
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && step < 5 && (
              <button onClick={() => setStep((p) => p - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {step < 4 && (
              <button
                onClick={() => setStep((p) => p + 1)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--primary)", color: "white" }}
              >
                Continue <ChevronRight size={16} />
              </button>
            )}

            {step === 4 && (
              <button
                onClick={() => setStep(5)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "var(--primary)", color: "white" }}
              >
                Next <ChevronRight size={16} />
              </button>
            )}

            {step === 5 && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "var(--accent-green)", color: "white" }}
              >
                {isCompleting
                  ? <Loader2 size={16} className="animate-spin" />
                  : <><Rocket size={16} /> Launch Dashboard</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}