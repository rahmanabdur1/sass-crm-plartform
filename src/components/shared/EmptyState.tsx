import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
          {icon}
        </div>
      )}
      <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--primary)", color: "white" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}