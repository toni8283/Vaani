import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  name?: string;
  tint?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AvatarOrb({
  initials,
  name,
  tint,
  size = "md",
  className,
  style,
  ...props
}: AvatarOrbProps) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-small",
    lg: "size-14 text-h5",
    xl: "size-20 text-h4",
  };

  const displayInitials = initials || (name ? name.slice(0, 2) : undefined);

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 flex items-center justify-center font-display font-medium select-none shadow-sm",
        "bg-[radial-gradient(circle_at_35%_30%,#FFE3BD_0%,#F2A65A_40%,#C4622D_80%,#8F3F17_100%)]",
        "border border-white/60",
        sizeClasses[size],
        className
      )}
      style={{
        ...(tint
          ? {
              background: `radial-gradient(circle at 35% 30%, #FFE3BD 0%, ${tint} 45%, #C4622D 85%, #8F3F17 100%)`,
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      <div className="absolute inset-0 rounded-full bg-amber-glow/20 blur-sm pointer-events-none" />
      {displayInitials && (
        <span className="relative z-10 text-cream-50 font-bold tracking-tight drop-shadow-[0_1px_2px_rgba(43,33,28,0.5)]">
          {displayInitials.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
