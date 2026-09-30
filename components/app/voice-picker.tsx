"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Chip } from "@/components/ui/chip";
import {
  VOICES as STATIC_VOICES,
  DEFAULT_FEMALE_VOICE,
  type VoiceOption,
} from "@/lib/voices";

interface VoicePickerProps {
  value: string;
  onChange: (voiceId: string) => void;
  className?: string;
  maxHeight?: string;
}

export function VoicePicker({
  value,
  onChange,
  className = "",
  maxHeight = "max-h-[350px]",
}: VoicePickerProps) {
  const [voices, setVoices] = useState<VoiceOption[]>(STATIC_VOICES);
  const [filter, setFilter] = useState<"all" | "female" | "male">("all");

  useEffect(() => {
    let isMounted = true;
    async function fetchVoices() {
      try {
        const res = await fetch("/api/voices");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setVoices(data);
          }
        }
      } catch {
        // Fallback to static list
      }
    }
    fetchVoices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure default selection is the first female voice if unset
  useEffect(() => {
    if (!value && voices.length > 0) {
      const firstFemale = voices.find((v) => v.gender === "female") || voices[0];
      onChange(firstFemale.id);
    }
  }, [value, voices, onChange]);

  const filteredVoices = useMemo(() => {
    if (filter === "all") return voices;
    return voices.filter((v) => v.gender === filter);
  }, [voices, filter]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Filter Chips: All / Female / Male */}
      <div className="flex items-center gap-2">
        <Chip
          variant={filter === "all" ? "terracotta" : "neutral"}
          size="sm"
          onClick={() => setFilter("all")}
          className="cursor-pointer"
        >
          All
        </Chip>
        <Chip
          variant={filter === "female" ? "terracotta" : "neutral"}
          size="sm"
          onClick={() => setFilter("female")}
          className="cursor-pointer"
        >
          Female
        </Chip>
        <Chip
          variant={filter === "male" ? "terracotta" : "neutral"}
          size="sm"
          onClick={() => setFilter("male")}
          className="cursor-pointer"
        >
          Male
        </Chip>
      </div>

      {/* Voice Cards */}
      <div className={`grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 ${maxHeight} overflow-y-auto pr-1`}>
        {filteredVoices.map((v) => {
          const isSelected =
            (value || DEFAULT_FEMALE_VOICE.id).toLowerCase() ===
            v.id.toLowerCase();

          return (
            <div
              key={v.id}
              onClick={() => onChange(v.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col justify-between text-left ${
                isSelected
                  ? "bg-terracotta-subtle/50 border-terracotta shadow-xs text-ink"
                  : "bg-cream-100/50 border-cream-200 hover:bg-cream-100 text-ink-soft"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold text-ink">
                    {v.displayName}
                  </span>
                  <Chip
                    variant={v.gender === "female" ? "default" : "honey"}
                    size="sm"
                    className="text-[11px] px-2 py-0.5 capitalize pointer-events-none"
                  >
                    {v.gender === "female" ? "Female" : "Male"}
                  </Chip>
                </div>
                <div className="text-xs font-medium text-terracotta">
                  {v.accent}
                </div>
                <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
                  {v.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
