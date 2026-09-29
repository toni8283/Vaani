"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

export type OrbState = "idle" | "dialing" | "speaking" | "listening" | "thinking" | "ending";

export function VaaniOrb({
  state,
  level = 0,
  className = "",
}: {
  state: OrbState;
  level?: number;
  className?: string;
}) {
  // level: 0..1 amplitude of whoever is speaking (from Supabase Broadcast at ~10Hz)
  const scale = useSpring(1, { stiffness: 180, damping: 18 });

  useEffect(() => {
    scale.set(
      state === "speaking"
        ? 1 + level * 0.1
        : state === "listening"
        ? 0.94 + level * 0.03
        : state === "ending"
        ? 0.7
        : 1
    );
  }, [state, level, scale]);

  return (
    <div className={`relative size-56 md:size-72 ${className}`}>
      {state === "dialing" &&
        [0, 0.8].map((d) => (
          <span
            key={d}
            style={{ animationDelay: `${d}s` }}
            className="absolute inset-0 rounded-full border border-terracotta/30 animate-ripple"
          />
        ))}
      <motion.div
        style={{ scale }}
        animate={{ opacity: state === "ending" ? 0.55 : 1 }}
        transition={{ duration: 1.2 }}
        className={`absolute inset-0 ${state === "idle" ? "animate-breathe" : ""}`}
      >
        <div className="absolute -inset-12 rounded-full bg-amber-glow/40 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 rounded-full shadow-orb bg-[radial-gradient(circle_at_35%_30%,#FFE3BD_0%,#F2A65A_38%,#C4622D_75%,#8F3F17_100%)]" />
        <div
          className={`absolute inset-3 rounded-full opacity-20 blur-xl bg-[conic-gradient(from_0deg,#FFE3BD,#C4622D,#FFE3BD)] ${
            state === "thinking"
              ? "animate-drift [animation-duration:6s]"
              : "animate-drift [animation-duration:30s]"
          }`}
        />
        <div className="absolute inset-0 rounded-full opacity-[0.08] mix-blend-overlay pointer-events-none overflow-hidden">
          <svg className="w-full h-full rounded-full">
            <filter id="orb-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="2"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#orb-grain)" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
