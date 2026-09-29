import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AvatarOrb({
  initials,
  size = "md",
  className,
  ...props
}: AvatarOrbProps) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-small",
    lg: "size-14 text-h5",
    xl: "size-20 text-h4",
  };

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 flex items-center justify-center font-display font-medium select-none shadow-sm",
        "bg-[radial-gradient(circle_at_35%_30%,#FFE3BD_0%,#F2A65A_40%,#C4622D_80%,#8F3F17_100%)]",
        "border border-white/60",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-full bg-amber-glow/20 blur-sm pointer-events-none" />
      {initials && (
        <span className="relative z-10 text-cream-50 font-bold tracking-tight drop-shadow-[0_1px_2px_rgba(43,33,28,0.5)]">
          {initials.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
