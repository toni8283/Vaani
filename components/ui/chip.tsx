import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-small font-medium transition duration-200 ease-calm select-none",
  {
    variants: {
      variant: {
        default:
          "bg-terracotta-subtle text-terracotta-deep border border-terracotta/20",
        glass:
          "bg-cream-50/70 backdrop-blur-xl border border-white/60 text-ink shadow-sm",
        sage: "bg-sage/15 text-sage border border-sage/25",
        honey: "bg-honey/15 text-[#966b16] border border-honey/25",
        rust: "bg-rust/15 text-rust border border-rust/25",
        neutral: "bg-cream-100 text-ink-soft border border-cream-200",
        terracotta: "bg-terracotta text-cream-50 shadow-sm",
      },
      size: {
        default: "text-small px-3.5 py-1",
        sm: "text-caption px-2.5 py-0.5",
        lg: "text-body px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  icon?: React.ReactNode;
}

export function Chip({ className, variant, size, icon, children, ...props }: ChipProps) {
  return (
    <div className={cn(chipVariants({ variant, size, className }))} {...props}>
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
