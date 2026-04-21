import { cn } from "@/lib/utils";

interface AvatarProps {
  username: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  username,
  color = "#FF8FA3",
  size = "md",
  className,
}: AvatarProps) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white select-none shrink-0",
        {
          "w-7 h-7 text-xs": size === "sm",
          "w-9 h-9 text-sm": size === "md",
          "w-12 h-12 text-base": size === "lg",
        },
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={username}
    >
      {initial}
    </span>
  );
}
