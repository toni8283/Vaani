"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { Chip } from "@/components/ui/chip";

const carouselCards = [
  {
    quote: "Vaani: How have you been sleeping this week?",
    chip: "Sleep improved",
    variant: "sage" as const,
  },
  {
    quote: "Maa: Tell him to eat properly.",
    chip: "Message delivered",
    variant: "terracotta" as const,
  },
  {
    quote: "Summary sent to your phone.",
    chip: "Just now",
    variant: "glass" as const,
  },
];

export function AuthVisual() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselCards.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const active = carouselCards[currentIndex];

  return (
    <div className="hidden lg:flex relative m-3 overflow-hidden rounded-[32px] border border-cream-200/80 bg-cream-50 flex-col justify-between p-10 select-none">
      {/* MeshGradient Background */}
      <MeshGradient />

      {/* Top Headline */}
      <div className="relative z-10 max-w-sm">
        <h2 className="font-display text-4xl text-ink leading-tight font-medium">
          Presence, even on your busiest days.
        </h2>
      </div>

      {/* Center Large Vaani Orb */}
      <div className="relative z-10 flex items-center justify-center py-6">
        <VaaniOrb state="idle" className="!size-64 md:!size-72" />
      </div>

      {/* Bottom Rotating Glass Card Carousel */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="h-28 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-2xl bg-white/55 backdrop-blur-xl border border-white/70 p-5 shadow-sm space-y-2.5"
            >
              <p className="text-small text-ink font-medium leading-relaxed font-sans">
                &ldquo;{active.quote}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <Chip variant={active.variant} size="sm">
                  {active.chip}
                </Chip>
                <span className="text-caption font-mono text-ink-faint">
                  0{currentIndex + 1} / 0{carouselCards.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex items-center gap-2">
          {carouselCards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-terracotta" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
