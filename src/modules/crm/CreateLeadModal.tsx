"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Lead } from "../../types/crm.types";
import { crmService } from "../../services/crmService";
import { useAuthStore } from "../../store/authStore";
import { useCompanyStore } from "../../store/companyStore";

const createLeadSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  source: z.enum(["web", "referral", "cold_call", "social", "event", "other"]),
  value: z.number().min(0),
  notes: z.string().optional(),
});

type CreateLeadForm = z.infer<typeof createLeadSchema>;

export function CreateLeadModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}) {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateLeadForm>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: { source: "web", value: 0 },
  });

  const onSubmit = async (data: CreateLeadForm) => {
    if (!user || !activeCompany) return;

    const lead = await crmService.createLead(
      {
        ...data,
        companyId: activeCompany.id,
        status: "new",
        assignedTo: user.id,
        tags: [],
        score: Math.floor(Math.random() * 60) + 20,
        value: data.value,
      },
      user.id,
      user.name
    );
    onCreated(lead);
  };

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Add New Lead</h2>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Full Name *</label>
              <input {...register("name")} style={inputStyle} placeholder="John Doe" />
              {errors.name && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Phone *</label>
              <input {...register("phone")} style={inputStyle} placeholder="+8801..." />
              {errors.phone && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Email *</label>
            <input {...register("email")} style={inputStyle} placeholder="lead@email.com" />
            {errors.email && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Source</label>
              <select {...register("source")} style={{ ...inputStyle }}>
                {["web", "referral", "cold_call", "social", "event", "other"].map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Deal Value (BDT)</label>
              <input {...register("value", { valueAsNumber: true })} type="number" style={inputStyle} placeholder="50000" />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Notes</label>
            <textarea {...register("notes")} style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Initial notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: "var(--primary)", color: "white" }}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Create Lead"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}