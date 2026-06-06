import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        default: "",
        outline: "bg-transparent border",
        dot: "pl-2",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  color?: string;
  showDot?: boolean;
  className?: string;
}

export function Badge({ label, color = "var(--primary)", showDot, variant, className }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      style={{
        background: variant === "outline" ? "transparent" : `${color}15`,
        color,
        borderColor: variant === "outline" ? `${color}40` : undefined,
      }}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}