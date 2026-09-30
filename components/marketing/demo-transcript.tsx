"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { Chip } from "@/components/ui/chip";
import { BlurReveal } from "@/components/motion/blur-reveal";

interface Turn {
  speaker: "Vaani" | "Maa";
  text: React.ReactNode;
  time: string;
}

const transcriptTurns: Turn[] = [
  {
    speaker: "Vaani",
    text: "Namaste Aunty, this is Vaani. I'm an AI assistant calling on behalf of Aarav. He's stuck at work today and asked me to say hello. Is this an okay time?",
    time: "0:04",
  },
  {
    speaker: "Maa",
    text: "Oh, Aarav's assistant! Yes, yes, tell me.",
    time: "0:12",
  },
  {
    speaker: "Vaani",
    text: "He was wondering how you've been. Last time you mentioned trouble sleeping. How have the nights been?",
    time: "0:21",
  },
  {
    speaker: "Maa",
    text: "Much better, actually. The new pillow helped. But my knee is acting up again.",
    time: "0:35",
  },
  {
    speaker: "Vaani",
    text: "I'm sorry to hear that. Is it stopping you from your evening walks?",
    time: "0:48",
  },
  {
    speaker: "Maa",
    text: "A little. Meena's wedding is on the 14th, I hope I can dance!",
    time: "0:59",
  },
  {
    speaker: "Vaani",
    text: (
      <span>
        Aarav also wanted you to hear this:{" "}
        <span className="italic font-display text-terracotta-deep font-semibold">
          he&apos;s proud of you, and he&apos;ll call this weekend.
        </span>
      </span>
    ),
    time: "1:15",
  },
  {
    speaker: "Maa",
    text: "Tell him I said eat properly. (laughs)",
    time: "1:24",
  },
];

const summaryBlocks = [
  {
    label: "What happened",
    content: "A warm ten-minute chat. Maa sounded cheerful and in good spirits.",
  },
  {
    label: "Important updates",
    content: "Sleep has improved. Her knee is bothering her again.",
  },
  {
    label: "Things worth remembering",
    content: "Meena's wedding is on the 14th. Loves her evening walks. Worries you don't eat properly.",
  },
  {
    label: "For your next call",
    content: "Ask how the knee is. Ask how the wedding went.",
  },
];

export function DemoTranscript() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Live Transcript Card */}
      <div className="relative rounded-card bg-cream-50 border border-cream-200 shadow-sm p-6 md:p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-cream-200 relative z-10">
          <AvatarOrb initials="MA" size="md" />
          <div>
            <h4 className="font-display text-h5 text-ink">An example conversation</h4>
            <p className="text-caption text-ink-soft">Recorded transcript &middot; 8 min</p>
          </div>
        </div>

        {/* Sequential Transcript Lines */}
        <div className="space-y-4 pt-6">
          {transcriptTurns.map((turn, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3"
            >
              <div className="pt-1 shrink-0">
                {turn.speaker === "Vaani" ? (
                  <span className="size-2 rounded-full bg-terracotta inline-block shadow-sm ring-2 ring-terracotta/20" />
                ) : (
                  <span className="size-2 rounded-full bg-cream-300 inline-block" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-caption font-semibold ${
                      turn.speaker === "Vaani" ? "text-terracotta" : "text-ink"
                    }`}
                  >
                    {turn.speaker}
                  </span>
                  <span className="text-caption font-mono text-ink-faint">{turn.time}</span>
                </div>
                <div className="text-body text-ink leading-relaxed font-sans">{turn.text}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Column: Four-Block Summary Card (sized to content, items-start) */}
      <BlurReveal delay={0.2}>
        <div className="rounded-card bg-cream-50 border border-cream-200 shadow-md p-6 md:p-8 overflow-hidden">
          {/* Mini Mesh Gradient Header */}
          <div className="relative -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-6 h-18 overflow-hidden border-b border-cream-200 p-6 flex items-center justify-between">
            <MeshGradient />
            <div className="relative z-10 flex items-center gap-3">
              <div className="size-8 rounded-full flex items-center justify-center overflow-hidden">
                <VaaniOrb state="idle" className="!size-8" />
              </div>
              <span className="font-display text-h5 text-ink">Call Summary</span>
            </div>
          </div>

          {/* Note to you */}
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 mb-6">
            <p className="text-caption font-semibold text-terracotta uppercase tracking-wide mb-1">
              Vaani&apos;s note to you
            </p>
            <p className="text-small text-ink font-display italic">
              &ldquo;She sounded cheerful, and she laughed twice. She&apos;d love a real call this weekend.&rdquo;
            </p>
          </div>

          {/* Four Summary Blocks with exact labels */}
          <div className="space-y-4">
            {summaryBlocks.map((block, idx) => (
              <BlurReveal key={block.label} delay={0.25 + idx * 0.08} y={8} blur={6}>
                <div className="space-y-1 pb-3.5 border-b border-cream-200 last:border-b-0 last:pb-0">
                  <p className="text-caption font-bold tracking-wide uppercase text-ink-soft">
                    {block.label}
                  </p>
                  <p className="text-body text-ink leading-relaxed">{block.content}</p>
                </div>
              </BlurReveal>
            ))}
          </div>

          {/* Footer: Sent to your phone + Summary ready chip */}
          <div className="pt-6 mt-6 border-t border-cream-200 flex items-center justify-between">
            <span className="text-caption text-ink-faint">Sent to your phone</span>
            <Chip variant="sage">Summary ready</Chip>
          </div>
        </div>
      </BlurReveal>
    </div>
  );
}
