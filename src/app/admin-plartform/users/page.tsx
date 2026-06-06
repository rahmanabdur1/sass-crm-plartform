"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ToggleRight, ToggleLeft, Search } from "lucide-react";
import { db } from "@/db/schema";
import { User } from "@/types/auth.types";
import { Company } from "@/types/company.types";
import { ROLE_LABELS } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import { useAuthStore } from "@/store/authStore";
import { auditService } from "@/services/auditService";
import { Avatar } from "@/components/shared/Avatar";
import { Badge } from "@/components/shared/Badge";

const ROLE_COLORS: Record<string, string> = {
  platform_admin: "#EF4444",
  owner: "#6366F1",
  manager: "#F59E0B",
  staff: "#22C55E",
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([db.users.toArray(), db.companies.toArray()]).then(([u, c]) => {
      setUsers(u);
      setCompanies(c);
      setIsLoading(false);
    });
  }, []);

  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.name]));

  const filtered = users.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleUser(target: User) {
    if (!currentUser) return;
    const newStatus = !target.isActive;
    await db.users.update(target.id, { isActive: newStatus });
    await auditService.log({
      companyId: target.companyId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: newStatus ? "user.activated" : "user.deactivated",
      target: "user",
      targetId: target.id,
    });
    setUsers((prev) => prev.map((u) => u.id === target.id ? { ...u, isActive: newStatus } : u));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>All Users</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {users.filter((u) => u.isActive).length} active · {users.length} total across all tenants
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..." className="outline-none bg-transparent text-sm"
            style={{ color: "var(--text-primary)" }} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["User", "Company", "Role", "Joined", "Last Login", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              : filtered.map((u) => (
                  <motion.tr key={u.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" color={ROLE_COLORS[u.role]} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {companyMap[u.companyId] || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={ROLE_LABELS[u.role] || u.role} color={ROLE_COLORS[u.role]} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={u.isActive ? "Active" : "Inactive"}
                        color={u.isActive ? "var(--accent-green)" : "var(--danger)"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== currentUser?.id && (
                        <button onClick={() => toggleUser(u)}
                          style={{ color: u.isActive ? "var(--danger)" : "var(--accent-green)" }}>
                          {u.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}