"use client";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KPIData } from "@/types/analytics.types";

interface StatCardProps extends Omit<KPIData, "icon"> {
  icon?: React.ReactNode;
  color?: string;
  delay?: number;
  formatValue?: (v: number | string) => string;
}

export function StatCard({ label, value, change, changeType, prefix, suffix, icon, color = "var(--primary)", delay = 0, formatValue }: StatCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const displayed = useTransform(spring, (v) => {
    const formatted = formatValue ? formatValue(v) : Math.round(v).toLocaleString();
    return `${prefix || ""}${formatted}${suffix || ""}`;
  });

  useEffect(() => {
    motionVal.set(numericValue);
  }, [numericValue, motionVal]);

  const TrendIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Minus;
  const trendColor = changeType === "positive" ? "var(--accent-green)" : changeType === "negative" ? "var(--danger)" : "var(--text-muted)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        {icon ? (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15`, color }}>
            {icon}
          </div>
        ) : <div />}
        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: trendColor }}>
          <TrendIcon size={12} />
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <motion.div className="font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {typeof value === "number" ? displayed : `${prefix || ""}${value}${suffix || ""}`}
      </motion.div>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
    </motion.div>
  );
}