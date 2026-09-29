"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, X, ArrowRight, UserPlus, Volume2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface GettingStartedProps {
  peopleCount: number;
  hasCustomVoice?: boolean;
  callsCount: number;
  onAddPerson: () => void;
}

export function GettingStartedCard({
  peopleCount,
  hasCustomVoice = false,
  callsCount,
  onAddPerson,
}: GettingStartedProps) {
  const [tipDismissed, setTipDismissed] = useState(false);

  const step1Done = peopleCount > 0;
  const step2Done = hasCustomVoice || peopleCount > 0;
  const step3Done = callsCount > 0;

  const completedCount = (step1Done ? 1 : 0) + (step2Done ? 1 : 0) + (step3Done ? 1 : 0);
  const progressPercent = Math.round((completedCount / 3) * 100);

  // Circular progress calculations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const steps = [
    {
      id: 1,
      title: "Add someone you love",
      description: "Start with a parent, partner, or grandparent.",
      done: step1Done,
      icon: UserPlus,
      action: onAddPerson,
      actionText: "Add person",
    },
    {
      id: 2,
      title: "Choose how Vaani sounds",
      description: "Pick Claire, Ivy, or Dawn and a warm tone.",
      done: step2Done,
      icon: Volume2,
      href: "/people",
      actionText: "View voices",
    },
    {
      id: 3,
      title: "Try your first call",
      description: "Send a loving check-in or test with yourself.",
      done: step3Done,
      icon: PhoneCall,
      href: "/calls/new",
      actionText: "Start a call",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Getting Started Main Card */}
      <Card className="rounded-[28px] p-6 md:p-8 bg-cream-50 border-cream-200/90 shadow-sm space-y-6">
        {/* Header with Progress Ring */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-h4 font-medium text-ink">
              Getting started
            </h3>
            <p className="text-small text-ink-soft">
              Three simple steps to your first meaningful conversation.
            </p>
          </div>

          {/* Animated Progress Ring */}
          <div className="relative size-16 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 54 54">
              <circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-cream-200"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-sage transition-all duration-700 ease-calm"
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute font-mono text-xs font-semibold text-ink">
              {completedCount}/3
            </div>
          </div>
        </div>

        {/* Dotted Stepper */}
        <div className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-5 before:w-0.5 before:border-l-2 before:border-dotted before:border-cream-300">
          {steps.map((s) => (
            <div key={s.id} className="relative flex items-start gap-4">
              {/* Step indicator dot */}
              <div
                className={`size-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-200 ${
                  s.done
                    ? "bg-sage text-white shadow-xs"
                    : "bg-cream-100 border-2 border-cream-200 text-ink-faint"
                }`}
              >
                {s.done ? (
                  <Check className="size-5 stroke-[2.5]" />
                ) : (
                  <span className="font-mono text-xs font-semibold">{s.id}</span>
                )}
              </div>

              {/* Step details */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <div
                    className={`text-body font-medium ${
                      s.done ? "text-ink line-through opacity-70" : "text-ink"
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="text-small text-ink-faint">
                    {s.description}
                  </div>
                </div>

                {!s.done && (
                  <div>
                    {s.action ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={s.action}
                        className="text-terracotta hover:text-terracotta-hover gap-1 h-8 px-3"
                      >
                        <span>{s.actionText}</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    ) : s.href ? (
                      <Link href={s.href}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-terracotta hover:text-terracotta-hover gap-1 h-8 px-3"
                        >
                          <span>{s.actionText}</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dismissible Tip Glass Card */}
      {!tipDismissed && (
        <div className="relative rounded-2xl bg-cream-50/80 backdrop-blur-md border border-cream-200/80 p-4.5 shadow-xs flex items-center justify-between gap-4 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-amber-glow/20 flex items-center justify-center text-amber-glow shrink-0">
              <Sparkles className="size-4 text-terracotta" />
            </div>
            <p className="text-small text-ink-soft">
              <strong className="font-semibold text-ink">Tip:</strong> write your notes like you&apos;d tell a friend.
            </p>
          </div>
          <button
            onClick={() => setTipDismissed(true)}
            className="p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-cream-100 transition-colors"
            title="Dismiss tip"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
