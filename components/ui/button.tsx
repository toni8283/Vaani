import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-small font-medium transition duration-200 ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-terracotta text-cream-50 shadow-sm hover:bg-terracotta-hover hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:bg-terracotta-deep",
        ghost:
          "bg-transparent text-ink-soft hover:text-ink hover:bg-cream-100/70 hover:-translate-y-0.5 active:translate-y-0",
        quiet:
          "bg-transparent text-ink-soft hover:text-ink hover:bg-cream-200/40 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-cream-100 text-ink border border-cream-200 shadow-sm hover:bg-cream-200/60 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        destructive:
          "bg-rust text-cream-50 shadow-sm hover:bg-rust/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        outline:
          "border border-cream-200 bg-cream-50 text-ink shadow-sm hover:bg-cream-100 hover:border-cream-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-base font-semibold",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
