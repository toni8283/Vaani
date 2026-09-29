import React from "react";
import Image from "next/image";
import {
  Contact,
  PenLine,
  Mail,
  Users,
  Laptop,
  type LucideIcon,
} from "lucide-react";
import { illustrations, type IllustrationName } from "@/lib/assets";
import { cn } from "@/lib/utils";

const fallbackIcons: Partial<Record<IllustrationName, LucideIcon>> = {
  "step-1-contact": Contact,
  "step-2-note": PenLine,
  "step-3-envelope": Mail,
  "empty-people": Users,
  "problem-desk": Laptop,
};

export interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function Illustration({
  name,
  className = "",
  width = 320,
  height = 240,
  alt,
}: IllustrationProps) {
  const isAvailable = illustrations[name];

  if (isAvailable) {
    return (
      <div
        className={cn("relative overflow-hidden flex items-center justify-center", className)}
        role="img"
        aria-label={alt || name}
      >
        <Image
          src={`/illustrations/${name}.svg`}
          alt={alt || name}
          width={width}
          height={height}
          priority={false}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 1. Invisible props: when missing, render nothing
  if (
    name === "hero-phone" ||
    name === "hero-chai" ||
    name === "hero-plant" ||
    name === "hero-note" ||
    name === "demo-sofa"
  ) {
    return null;
  }

  // 2. cta-phones: overlapping rounded phones joined by a dotted heart line (~220px wide)
  if (name === "cta-phones") {
    return (
      <div
        role="img"
        aria-label="Connected phones"
        className={cn(
          "relative flex items-center justify-center w-[220px] h-[120px] mx-auto select-none",
          className
        )}
      >
        {/* Left Phone */}
        <div className="absolute left-3 w-16 h-28 rounded-2xl bg-cream-50 border-2 border-cream-200 shadow-sm p-1.5 flex flex-col justify-between">
          <div className="w-4 h-1 bg-cream-300 rounded-full mx-auto" />
          <div className="w-full flex-1 my-1 rounded-xl bg-gradient-to-b from-[#FFE3BD]/60 to-[#FBD9A8]/40" />
          <div className="w-2.5 h-2.5 rounded-full border border-cream-200 mx-auto" />
        </div>

        {/* Right Phone */}
        <div className="absolute right-3 w-16 h-28 rounded-2xl bg-cream-50 border-2 border-cream-200 shadow-sm p-1.5 flex flex-col justify-between z-10">
          <div className="w-4 h-1 bg-cream-300 rounded-full mx-auto" />
          <div className="w-full flex-1 my-1 rounded-xl bg-gradient-to-b from-[#F7A5A0]/40 to-[#FFC99A]/60" />
          <div className="w-2.5 h-2.5 rounded-full border border-cream-200 mx-auto" />
        </div>

        {/* Connecting SVG Dotted Heart Line */}
        <svg
          viewBox="0 0 220 100"
          fill="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        >
          {/* Dotted arc */}
          <path
            d="M 55 50 C 85 20, 135 20, 165 50"
            stroke="#C4622D"
            strokeWidth="2"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          {/* Center Heart Badge */}
          <g transform="translate(110, 32)">
            <circle cx="0" cy="0" r="13" fill="#FAF6F0" stroke="#E8DFD3" strokeWidth="1" />
            <path
              d="M 0 4 C -6 -2, -9 -6, -9 -9 A 4.5 4.5 0 0 1 0 -9.5 A 4.5 4.5 0 0 1 9 -9 C 9 -6, 6 -2, 0 4 Z"
              fill="#C4622D"
              transform="scale(0.8) translate(0, 4)"
            />
          </g>
        </svg>
      </div>
    );
  }

  // 3. Step cards & empty states: Soft gradient panel with centered Lucide icon and NO text
  const FallbackIcon = fallbackIcons[name] || Laptop;

  return (
    <div
      role="img"
      aria-label={alt || name}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl w-full h-full",
        "bg-gradient-to-br from-[#FFC99A] via-[#FBD9A8] to-[#F7A5A0]",
        "border border-white/60 shadow-sm select-none p-6",
        className
      )}
    >
      <div className="size-14 rounded-full bg-white/75 backdrop-blur-sm border border-white/80 shadow-sm flex items-center justify-center text-terracotta-deep transition-transform duration-200 hover:scale-105">
        <FallbackIcon className="size-7 stroke-[1.75]" />
      </div>
    </div>
  );
}
