import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
}

export function IconTile({
  icon: Icon,
  size = "md",
  className,
  children,
  ...props
}: IconTileProps) {
  const sizeClasses = {
    sm: "size-10 rounded-xl",
    md: "size-14 rounded-2xl",
    lg: "size-16 rounded-[20px]",
  };

  const iconSizes = {
    sm: "size-4 stroke-[1.5]",
    md: "size-6 stroke-[1.5]",
    lg: "size-7 stroke-[1.5]",
  };

  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br from-terracotta-subtle to-amber-soft border border-white/70 shadow-sm text-terracotta-deep transition-transform duration-200 ease-calm hover:scale-105 select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className={iconSizes[size]} /> : children}
    </div>
  );
}
