"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus,  ToggleLeft, ToggleRight, X, Loader2 } from "lucide-react";
import { useCompanyStore } from "../../../../store/companyStore";
import { useAuthStore } from "../../../../store/authStore";
import { usePermission } from "../../../../hooks/usePermission";
import { db } from "../../../../db/schema";
import { User, UserRole, ROLE_PERMISSIONS } from "../../../../types/auth.types";
import { ROLE_LABELS } from "../../../../utils/constants";
import { generateId } from "../../../../utils/generateId";
import { hashPassword } from "../../../../utils/crypto";
import { auditService } from "../../../../services/auditService";
import { formatDate } from "../../../../utils/formatters";

const inviteSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
  role: z.enum(["manager", "staff"] as const),
});

type InviteForm = z.infer<typeof inviteSchema>;

const ROLE_COLORS: Record<UserRole, string> = {
  platform_admin: "#EF4444",
  owner: "#6366F1",
  manager: "#F59E0B",
  staff: "#22C55E",
};

export default function TeamSettingsPage() {
  const { user } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const { isOwner, isManager } = usePermission();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "staff" },
  });

  useEffect(() => {
    if (!activeCompany) return;
    loadTeam();
  }, [activeCompany]);

  async function loadTeam() {
    if (!activeCompany) return;
    const members = await db.users.where("companyId").equals(activeCompany.id).toArray();
    setTeamMembers(members);
    setIsLoading(false);
  }

  async function handleInvite(data: InviteForm) {
    if (!activeCompany || !user) return;
    const existing = await db.users.where("email").equals(data.email).first();
    if (existing) throw new Error("Email already exists");

    const newUser: User = {
      id: generateId(),
      companyId: activeCompany.id,
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: data.role,
      permissions: ROLE_PERMISSIONS[data.role],
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      onboarded: false,
    };

    await db.users.add(newUser);
    await auditService.log({
      companyId: activeCompany.id,
      actorId: user.id,
      actorName: user.name,
      action: "user.invited",
      target: "user",
      targetId: newUser.id,
      after: { name: newUser.name, email: newUser.email, role: newUser.role } as Record<string, unknown>,
    });

    setTeamMembers((prev) => [...prev, newUser]);
    setShowInviteModal(false);
    reset();
  }

  async function toggleUserStatus(targetUser: User) {
    if (!user || !activeCompany) return;
    const newStatus = !targetUser.isActive;
    await db.users.update(targetUser.id, { isActive: newStatus, updatedAt: Date.now() });
    await auditService.log({
      companyId: activeCompany.id,
      actorId: user.id,
      actorName: user.name,
      action: newStatus ? "user.activated" : "user.deactivated",
      target: "user",
      targetId: targetUser.id,
    });
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === targetUser.id ? { ...m, isActive: newStatus } : m))
    );
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Team Management</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {teamMembers.filter((m) => m.isActive).length} active members
          </p>
        </div>
        {(isOwner() || isManager()) && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--primary)", color: "white" }}
          >
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Member", "Role", "Permissions", "Joined", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              : teamMembers.map((member) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    className="hover:opacity-80"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: `${ROLE_COLORS[member.role]}15`, color: ROLE_COLORS[member.role] }}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{member.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{ background: `${ROLE_COLORS[member.role]}15`, color: ROLE_COLORS[member.role] }}>
                        {ROLE_LABELS[member.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {member.permissions.length} permissions
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: member.isActive ? "var(--accent-green-muted)" : "rgba(239,68,68,0.1)",
                          color: member.isActive ? "var(--accent-green)" : "var(--danger)",
                        }}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {member.id !== user?.id && isOwner() && (
                        <button
                          onClick={() => toggleUserStatus(member)}
                          style={{ color: member.isActive ? "var(--danger)" : "var(--accent-green)" }}
                          title={member.isActive ? "Deactivate" : "Activate"}
                        >
                          {member.isActive
                            ? <ToggleRight size={18} />
                            : <ToggleLeft size={18} />}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowInviteModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(handleInvite)} className="p-5 space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Name *</label>
                <input {...register("name")} style={inputStyle} placeholder="John Doe" />
                {errors.name && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Email *</label>
                <input {...register("email")} type="email" style={inputStyle} placeholder="member@company.com" />
                {errors.email && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Temporary Password *</label>
                <input {...register("password")} type="password" style={inputStyle} placeholder="••••••••" />
                {errors.password && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Role</label>
                <select {...register("role")} style={{ ...inputStyle }}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: "var(--primary)", color: "white" }}>
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><UserPlus size={14} /> Invite</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}