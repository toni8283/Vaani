"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

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
  const { resolvedTheme, isDashboard } = useTheme();

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

  // Determine if logo should be white:
  // 1. If explicitly variant="light"
  // 2. OR if in dashboard and dark mode is active
  const isDarkMode = isDashboard && resolvedTheme === "dark";
  const shouldBeWhite = variant === "light" || isDarkMode;

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
        <Image
          src={
            shouldBeWhite
              ? "/brand/vaani_logo_light.svg"
              : "/brand/vaani_logo_dark.svg"
          }
          alt="Vaani mark"
          width={424}
          height={363}
          unoptimized
          priority={priority}
          className={cn(
            "w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-105 vaani-logo-mark",
            shouldBeWhite ? "brightness-0 invert" : ""
          )}
        />
      </div>

      {!markOnly && (
        <span
          className={cn(
            "font-display font-medium tracking-tight leading-none transition-colors duration-200 vaani-logo-text",
            textSizeStyles[size],
            shouldBeWhite ? "text-white" : "text-ink"
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

