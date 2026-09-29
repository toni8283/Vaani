"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
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

      {/* Center: Bouncy, Color-Shifting Animated Vaani Orb */}
      <div className="relative z-10 flex items-center justify-center py-6">
        <div className="relative size-64 md:size-72 flex items-center justify-center">
          {/* Animated Expanding Ripple Rings */}
          {[0, 1.5, 3].map((delay) => (
            <motion.div
              key={delay}
              initial={{ scale: 0.9, opacity: 0.55 }}
              animate={{
                scale: [0.95, 1.35, 1.65],
                opacity: [0.5, 0.25, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                delay,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border border-terracotta/35 pointer-events-none"
            />
          ))}

          {/* Color-Shifting Shimmering Glow Halo */}
          <motion.div
            animate={{
              scale: [1, 1.15, 0.95, 1.08, 1],
              opacity: [0.45, 0.75, 0.5, 0.7, 0.45],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-14 rounded-full bg-[radial-gradient(circle_at_50%_50%,#F2A65A_0%,#C4622D_40%,#D9A441_70%,transparent_100%)] blur-3xl pointer-events-none"
          />

          {/* Main Bouncy Floating Orb Sphere */}
          <motion.div
            animate={{
              y: [-12, 10, -12],
              scale: [1, 1.05, 0.97, 1.03, 1],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative size-56 md:size-64 rounded-full shadow-orb overflow-hidden"
          >
            {/* Core Gradient Sphere with Rich Palette */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,#FFE3BD_0%,#F2A65A_35%,#C4622D_70%,#8F3F17_100%)]" />

            {/* Rotating Color-Shifting Conic Highlight Sheen */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full opacity-35 blur-xl bg-[conic-gradient(from_0deg,#FFE3BD,#F2A65A,#F7A5A0,#D9A441,#FFE3BD)]"
            />

            {/* Secondary Bouncing Internal Light Reflection */}
            <motion.div
              animate={{
                x: [-15, 15, -15],
                y: [-10, 10, -10],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-8 size-24 rounded-full bg-white/40 blur-lg pointer-events-none"
            />

            {/* Subtle Grain Overlay for Organic Warmth */}
            <div className="absolute inset-0 rounded-full opacity-[0.08] mix-blend-overlay pointer-events-none overflow-hidden">
              <svg className="w-full h-full rounded-full">
                <filter id="auth-orb-grain">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.8"
                    numOctaves="2"
                    stitchTiles="stitch"
                  />
                </filter>
                <rect width="100%" height="100%" filter="url(#auth-orb-grain)" />
              </svg>
            </div>
          </motion.div>

          {/* Floating Light Sparkle / Particle 1 */}
          <motion.div
            animate={{
              y: [-16, 12, -16],
              x: [-10, 10, -10],
              opacity: [0.4, 0.9, 0.4],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute -top-3 right-8 size-4 rounded-full bg-amber-glow/60 blur-xs shadow-sm pointer-events-none"
          />

          {/* Floating Light Sparkle / Particle 2 */}
          <motion.div
            animate={{
              y: [12, -14, 12],
              x: [8, -8, 8],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-4 left-6 size-3.5 rounded-full bg-terracotta/40 blur-xs shadow-sm pointer-events-none"
          />
        </div>
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
