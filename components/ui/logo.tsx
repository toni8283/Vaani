import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  variant?: "dark" | "light" | "auto";
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  href?: string;
  priority?: boolean;
}

export function Logo({
  className,
  variant = "auto",
  size = "md",
  markOnly = false,
  href,
  priority = false,
}: LogoProps) {
  const markSizeStyles = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizeStyles = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const isAlwaysLight = variant === "light";

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 select-none bg-transparent group",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden",
          markSizeStyles[size]
        )}
      >
        {isAlwaysLight ? (
          <Image
            src="/brand/vaani_logo_light.svg"
            alt="Vaani mark"
            width={424}
            height={363}
            unoptimized
            priority={priority}
            className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <>
            {/* Visible in light mode */}
            <Image
              src="/brand/vaani_logo_dark.svg"
              alt="Vaani mark"
              width={424}
              height={363}
              unoptimized
              priority={priority}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-105 block dark:hidden"
            />
            {/* Visible in dark mode */}
            <Image
              src="/brand/vaani_logo_light.svg"
              alt="Vaani mark"
              width={424}
              height={363}
              unoptimized
              priority={priority}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-105 hidden dark:block"
            />
          </>
        )}
      </div>

      {!markOnly && (
        <span
          className={cn(
            "font-display font-medium tracking-tight leading-none transition-colors duration-200",
            textSizeStyles[size],
            isAlwaysLight
              ? "text-cream-50"
              : "text-ink dark:text-cream-50"
          )}
        >
          Vaani
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group focus:outline-none"
        aria-label="Vaani Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
