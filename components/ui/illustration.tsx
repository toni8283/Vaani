import React from "react";
import Image from "next/image";
import {
  PhoneCall,
  Coffee,
  Sprout,
  StickyNote,
  Laptop,
  Contact,
  PenLine,
  Mail,
  Armchair,
  HeartHandshake,
  Users,
  type LucideIcon,
} from "lucide-react";
import { illustrations, type IllustrationName } from "@/lib/assets";
import { cn } from "@/lib/utils";

const fallbackIcons: Record<IllustrationName, LucideIcon> = {
  "hero-phone": PhoneCall,
  "hero-chai": Coffee,
  "hero-plant": Sprout,
  "hero-note": StickyNote,
  "problem-desk": Laptop,
  "step-1-contact": Contact,
  "step-2-note": PenLine,
  "step-3-envelope": Mail,
  "demo-sofa": Armchair,
  "cta-phones": HeartHandshake,
  "empty-people": Users,
};

const sceneLabels: Record<IllustrationName, string> = {
  "hero-phone": "Phone with message illustration",
  "hero-chai": "Steaming chai cup illustration",
  "hero-plant": "Small potted plant illustration",
  "hero-note": "Paper note with checkmark illustration",
  "problem-desk": "Desk with laptop and warm lamp illustration",
  "step-1-contact": "Contact card with phone number illustration",
  "step-2-note": "Note with reminders and pencil illustration",
  "step-3-envelope": "Opening envelope with warmth illustration",
  "demo-sofa": "Comfortable chat on a sofa illustration",
  "cta-phones": "Connected phones with heartline illustration",
  "empty-people": "Caring for loved ones illustration",
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
  const label = alt || sceneLabels[name] || name;

  if (isAvailable) {
    return (
      <div
        className={cn("relative overflow-hidden flex items-center justify-center", className)}
        role="img"
        aria-label={label}
      >
        <Image
          src={`/illustrations/${name}.svg`}
          alt={label}
          width={width}
          height={height}
          priority={false}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const FallbackIcon = fallbackIcons[name] || PhoneCall;

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-[28px]",
        "bg-gradient-to-br from-[#FFC99A] via-[#FBD9A8] to-[#F7A5A0]",
        "shadow-sm border border-white/60 p-6 text-center select-none",
        className
      )}
    >
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(43,33,28,0.15)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <div className="size-16 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm flex items-center justify-center text-terracotta-deep transition-transform duration-300 hover:scale-105">
          <FallbackIcon className="size-8 stroke-[1.75]" />
        </div>
        <span className="text-caption font-medium tracking-wide text-ink-soft uppercase opacity-80">
          {name.replace(/-/g, " ")}
        </span>
      </div>
    </div>
  );
}
