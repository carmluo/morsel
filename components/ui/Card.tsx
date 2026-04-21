import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-2xl shadow-card",
        hover && "transition-shadow duration-200 hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
