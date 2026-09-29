import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  href?: string;
  priority?: boolean;
}

export function Logo({
  className,
  variant = "dark",
  size = "md",
  markOnly = false,
  href,
  priority = false,
}: LogoProps) {
  const logoSrc =
    variant === "light"
      ? "/brand/vaani_logo_light.svg"
      : "/brand/vaani_logo_dark.svg";

  const sizeStyles = {
    sm: markOnly ? "w-7 h-7" : "w-24 h-8",
    md: markOnly ? "w-9 h-9" : "w-32 h-10",
    lg: markOnly ? "w-12 h-12" : "w-44 h-14",
  };

  const content = (
    <div
      className={cn(
        "relative flex items-center justify-center select-none bg-transparent overflow-hidden",
        sizeStyles[size],
        className
      )}
    >
      <Image
        src={logoSrc}
        alt="Vaani"
        width={424}
        height={363}
        unoptimized
        priority={priority}
        className={cn(
          "w-full h-full object-contain pointer-events-none transition-transform duration-200",
          markOnly && "scale-125"
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
