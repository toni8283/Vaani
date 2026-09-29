import * as React from "react";
import { cn } from "@/lib/utils";

export interface PresenceDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: "sage" | "honey" | "terracotta" | "rust" | "amber";
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PresenceDot({
  status = "sage",
  pulse = false,
  size = "md",
  className,
  ...props
}: PresenceDotProps) {
  const statusColors = {
    sage: "bg-sage",
    honey: "bg-honey",
    terracotta: "bg-terracotta",
    rust: "bg-rust",
    amber: "bg-amber-glow",
  };

  const sizeClasses = {
    sm: "size-1.5",
    md: "size-2.5",
    lg: "size-3.5",
  };

  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} {...props}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            statusColors[status]
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full shadow-sm",
          sizeClasses[size],
          statusColors[status]
        )}
      />
    </span>
  );
}
