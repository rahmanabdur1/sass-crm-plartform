import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
  lines?: number;
}

const ROUNDED = { sm: "rounded", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" };

export function Skeleton({ className, width, height, rounded = "md", lines }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn("skeleton", ROUNDED[rounded], className)}
            style={{ width: i === lines - 1 ? "60%" : "100%", height: height || 14 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("skeleton", ROUNDED[rounded], className)}
      style={{ width, height: height || 16 }}
    />
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <Skeleton width={40} height={40} rounded="lg" />
          <Skeleton height={28} width="60%" />
          <Skeleton height={14} width="80%" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={12} width={80} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height={14} width={j === 0 ? 140 : 80} />
          ))}
        </div>
      ))}
    </div>
  );
}