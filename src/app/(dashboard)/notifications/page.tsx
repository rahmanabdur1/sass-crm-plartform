"use client";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, ArrowRight } from "lucide-react";
import { useNotifications } from "../../../hooks/useNotifications";
import { formatRelativeTime } from "../../../utils/formatters";
import Link from "next/link";

const TYPE_COLORS = {
  system: "#EF4444",
  crm: "#6366F1",
  branch: "#F59E0B",
  report: "#22C55E",
  reminder: "#3B82F6",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)" }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex items-start gap-4 cursor-pointer hover:opacity-80 transition-all"
              style={{
                borderLeft: `3px solid ${n.read ? "var(--border-subtle)" : TYPE_COLORS[n.type]}`,
              }}
              onClick={() => markRead(n.id)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: `${TYPE_COLORS[n.type]}15`,
                  color: TYPE_COLORS[n.type],
                }}
              >
                <Bell size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}>
                  {n.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {n.message}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: TYPE_COLORS[n.type] }} />
              )}
              {n.link && (
                <Link href={n.link} onClick={(e) => e.stopPropagation()}>
                  <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                </Link>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}