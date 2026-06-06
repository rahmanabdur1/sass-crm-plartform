interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

const SIZES = { sm: "w-6 h-6 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };

export function Avatar({ name, src, size = "md", color = "var(--primary)" }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${SIZES[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: `${color}20`, color }}
    >
      {initials}
    </div>
  );
}