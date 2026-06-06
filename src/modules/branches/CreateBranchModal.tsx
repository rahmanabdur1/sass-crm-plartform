"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { X, Loader2, GitBranch } from "lucide-react";
import { useBranchesQuery } from "@/hooks/useBranchesQuery";
import { useCompanyStore } from "@/store/companyStore";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  name: z.string().min(2, "Branch name required"),
  code: z.string().min(2, "Code required"),
  city: z.string().min(2, "City required"),
  address: z.string().min(4, "Address required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

type FormData = z.infer<typeof schema>;

const BD_CITY_COORDS: Record<string, { lat: number; lng: number; region: string }> = {
  Dhaka: { lat: 23.8103, lng: 90.4125, region: "Dhaka Division" },
  Chittagong: { lat: 22.3569, lng: 91.7832, region: "Chattogram Division" },
  Sylhet: { lat: 24.8949, lng: 91.8687, region: "Sylhet Division" },
  Rajshahi: { lat: 24.3745, lng: 88.6042, region: "Rajshahi Division" },
  Khulna: { lat: 22.8456, lng: 89.5403, region: "Khulna Division" },
};

export function CreateBranchModal({ onClose }: { onClose: () => void }) {
  const { activeCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { createBranch } = useBranchesQuery();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { lat: 23.8103, lng: 90.4125 },
  });

  const watchedCity = watch("city");

  function handleCityChange(city: string) {
    setValue("city", city);
    const coords = BD_CITY_COORDS[city];
    if (coords) {
      setValue("lat", coords.lat);
      setValue("lng", coords.lng);
    }
  }

  async function onSubmit(data: FormData) {
    if (!activeCompany || !user) return;
    const cityCoords = BD_CITY_COORDS[data.city];
    await createBranch({
      companyId: activeCompany.id,
      name: data.name,
      code: data.code.toUpperCase(),
      location: {
        lat: data.lat,
        lng: data.lng,
        city: data.city,
        region: cityCoords?.region || data.city,
        address: data.address,
      },
      staffIds: [],
      status: "active",
      openedAt: Date.now(),
      metrics: { totalLeads: 0, convertedLeads: 0, revenue: 0, activeStaff: 0 },
    });
    onClose();
  }

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
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
              <GitBranch size={16} />
            </div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Create Branch</h3>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Branch Name *</label>
              <input {...register("name")} style={inputStyle} placeholder="Dhaka Main" />
              {errors.name && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Code *</label>
              <input {...register("code")} style={inputStyle} placeholder="DHK-001" />
              {errors.code && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.code.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>City *</label>
            <select
              value={watchedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              style={{ ...inputStyle }}>
              <option value="">Select city</option>
              {Object.keys(BD_CITY_COORDS).map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Address *</label>
            <input {...register("address")} style={inputStyle} placeholder="123 Main Street" />
            {errors.address && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Latitude</label>
              <input {...register("lat", { valueAsNumber: true })} type="number" step="0.0001" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>Longitude</label>
              <input {...register("lng", { valueAsNumber: true })} type="number" step="0.0001" style={inputStyle} />
            </div>
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
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Create Branch"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}