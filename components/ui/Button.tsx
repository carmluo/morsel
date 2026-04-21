"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 rounded-xl select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-accent text-white hover:bg-accent-hover active:scale-[0.97] shadow-sm":
              variant === "primary",
            "bg-transparent text-text hover:bg-border active:bg-border/70":
              variant === "ghost",
            "border border-border text-text bg-surface hover:border-muted active:scale-[0.97]":
              variant === "outline",
            "bg-red-100 text-red-700 hover:bg-red-200 active:scale-[0.97]":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm min-h-[36px]": size === "sm",
            "px-4 py-2.5 text-sm min-h-[44px]": size === "md",
            "px-6 py-3 text-base min-h-[52px]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
