"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { Chip } from "@/components/ui/chip";
import { PresenceDot } from "@/components/ui/presence-dot";
import { Illustration } from "@/components/ui/illustration";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { Sparkles, PhoneOff } from "lucide-react";

export function LiveCallPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [-30, 20]);

  return (
    <div ref={containerRef} className="w-full relative mt-12 md:mt-20">
      {/* Mobile-only Preview (< 768px): Compact Orb + Glass Chip */}
      <div className="flex flex-col items-center justify-center md:hidden py-6 gap-5">
        <div className="py-2">
          <VaaniOrb state="idle" className="!size-48" />
        </div>
        <Chip
          variant="glass"
          icon={<Sparkles className="size-3.5 text-amber-glow animate-pulse" />}
          className="shadow-md text-small px-4 py-1.5"
        >
          &ldquo;Hi Aunty, it&apos;s Vaani&rdquo;
        </Chip>
      </div>

      {/* Desktop Browser-Frame Preview (>= 768px) with Parallax & Floating Props */}
      <div className="hidden md:block relative max-w-4xl mx-auto px-4">
        {/* Floating Illustrated Props around preview */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -left-12 z-20 w-24 h-24"
        >
          <Illustration name="hero-phone" className="w-full h-full rounded-2xl shadow-md" />
        </motion.div>

        <motion.div
          animate={{ y: [6, -8, 6] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-16 -left-14 z-20 w-20 h-20"
        >
          <Illustration name="hero-chai" className="w-full h-full rounded-2xl shadow-md" />
        </motion.div>

        <motion.div
          animate={{ y: [-6, 8, -6] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -top-8 -right-12 z-20 w-20 h-20"
        >
          <Illustration name="hero-plant" className="w-full h-full rounded-2xl shadow-md" />
        </motion.div>

        <motion.div
          animate={{ y: [8, -6, 8] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-20 -right-14 z-20 w-24 h-24"
        >
          <Illustration name="hero-note" className="w-full h-full rounded-2xl shadow-md" />
        </motion.div>

        {/* Browser Frame */}
        <motion.div
          style={{ y: translateY }}
          className="relative rounded-t-[28px] border border-white/80 bg-cream-50/85 backdrop-blur-xl shadow-lg overflow-hidden"
        >
          {/* Browser Chrome Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-cream-200/70 bg-cream-100/50">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#FF8080] inline-block" />
              <span className="size-3 rounded-full bg-[#FFD166] inline-block" />
              <span className="size-3 rounded-full bg-[#06D6A0] inline-block" />
            </div>
            <div className="px-4 py-1 rounded-full bg-white/70 border border-cream-200 text-caption font-mono text-ink-soft select-none">
              vaani.app/calls/live
            </div>
            <div className="w-12" />
          </div>

          {/* Live Call Screen Stage */}
          <div className="p-8 md:p-10 relative bg-[radial-gradient(ellipse_at_50%_30%,#FBD9A8_0%,rgba(250,246,240,0)_65%)] flex flex-col items-center">
            {/* Top row in call: Person Chip & Status */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-cream-200">
                <AvatarOrb initials="MA" size="sm" />
                <span className="text-small font-medium text-ink">Maa (Mother)</span>
                <PresenceDot status="sage" pulse size="sm" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100/80 border border-cream-200 text-caption text-ink-soft font-mono">
                04:18
              </div>
            </div>

            {/* Orb Centered */}
            <div className="py-4">
              <VaaniOrb state="speaking" level={0.6} className="!size-48 md:!size-56" />
            </div>

            {/* Live Caption */}
            <div className="text-center mt-3 mb-6">
              <h3 className="font-display text-h4 text-ink">Talking with Maa</h3>
              <p className="text-small text-terracotta font-medium flex items-center justify-center gap-2 mt-1">
                <span className="size-2 rounded-full bg-terracotta animate-pulse" />
                Vaani is speaking
              </p>
            </div>

            {/* Glass Transcript Panel (3 lines) */}
            <div className="w-full max-w-xl rounded-2xl bg-cream-50/75 backdrop-blur-xl border border-white/70 shadow-md p-5 space-y-3.5 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-terracotta" />
                  <span className="text-caption font-semibold text-terracotta">Vaani</span>
                  <span className="text-caption text-ink-faint font-mono">0:06</span>
                </div>
                <p className="text-small text-ink pl-4 leading-relaxed">
                  Namaste Aunty, this is Vaani. I&apos;m an AI assistant calling on behalf of Aarav. He&apos;s stuck at work today and asked me to say hello. Is this an okay time?
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-sage" />
                  <span className="text-caption font-semibold text-ink">Maa</span>
                  <span className="text-caption text-ink-faint font-mono">0:14</span>
                </div>
                <p className="text-small text-ink-soft pl-4 leading-relaxed">
                  Oh, Aarav&apos;s assistant! Yes, yes, tell me.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-terracotta" />
                  <span className="text-caption font-semibold text-terracotta">Vaani</span>
                  <span className="text-caption text-ink-faint font-mono">0:19</span>
                </div>
                <p className="text-small text-ink pl-4 leading-relaxed">
                  He was wondering how you&apos;ve been. Last time you mentioned trouble sleeping. How have the nights been?
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
