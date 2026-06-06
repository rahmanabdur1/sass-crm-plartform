"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "full";
}

const MAX_WIDTHS = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  full: "w-full",
};

export function PageWrapper({ title, subtitle, actions, children, maxWidth = "full" }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`space-y-6 ${MAX_WIDTHS[maxWidth]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
}