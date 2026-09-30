"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { validatePhoneNumber } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";

import { VoicePicker } from "@/components/app/voice-picker";
import { DEFAULT_FEMALE_VOICE } from "@/lib/voices";

import { inferPronounsFromRelationship, type PronounType } from "@/lib/pronouns";

export interface PersonRecord {
  id: string;
  name: string;
  nickname?: string | null;
  relationship: string;
  phone_e164: string;
  voice?: string;
  tone?: string;
  language?: string;
  memory_enabled?: boolean;
  tint?: string;
  pronouns?: PronounType | string;
}

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: PersonRecord | null;
  onSuccess: (person: PersonRecord) => void;
}

const RELATIONSHIPS = [
  "Mom",
  "Dad",
  "Grandparent",
  "Sibling",
  "Partner",
  "Friend",
  "Someone else",
];

const TONES = ["Warm", "Cheerful", "Gentle", "Playful"];

const TINTS = ["#F2A65A", "#C4622D", "#5E8C61", "#D9A441", "#8F3F17"];

export function PersonDialog({
  open,
  onOpenChange,
  person,
  onSuccess,
}: PersonDialogProps) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [relationship, setRelationship] = useState("Mom");
  const [pronouns, setPronouns] = useState<PronounType>("she");
  const [phone, setPhone] = useState("");
  const [voice, setVoice] = useState(DEFAULT_FEMALE_VOICE.id);
  const [tone, setTone] = useState("Warm");
  const [language, setLanguage] = useState("en");
  const [tint, setTint] = useState("#F2A65A");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (person) {
      setName(person.name || "");
      setNickname(person.nickname || "");
      const rel = person.relationship || "Mom";
      setRelationship(rel);
      setPronouns(
        (person.pronouns as PronounType) || inferPronounsFromRelationship(rel)
      );
      setPhone(person.phone_e164 || "");
      setVoice(person.voice || DEFAULT_FEMALE_VOICE.id);
      setTone(person.tone || "Warm");
      setLanguage(person.language || "en");
      setTint(person.tint || "#F2A65A");
    } else {
      setName("");
      setNickname("");
      setRelationship("Mom");
      setPronouns(inferPronounsFromRelationship("Mom"));
      setPhone("");
      setVoice(DEFAULT_FEMALE_VOICE.id);
      setTone("Warm");
      setLanguage("en");
      setTint(TINTS[Math.floor(Math.random() * TINTS.length)]);
    }
    setError(null);
  }, [person, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a name.");
      return;
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid || !phoneValidation.e164) {
      setError(phoneValidation.error || "That number doesn't look quite right. Try including the country code, like +91.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be signed in to add someone.");
        return;
      }

      if (person?.id) {
        // Update existing
        const { data, error: updateError } = await supabase
          .from("people")
          .update({
            name: trimmedName,
            nickname: nickname.trim() || trimmedName,
            relationship,
            pronouns,
            phone_e164: phoneValidation.e164,
            voice,
            tone,
            language,
            tint,
          })
          .eq("id", person.id)
          .select()
          .single();

        if (updateError) throw updateError;
        onSuccess(data);
      } else {
        // Insert new
        const { data, error: insertError } = await supabase
          .from("people")
          .insert({
            user_id: user.id,
            name: trimmedName,
            nickname: nickname.trim() || trimmedName,
            relationship,
            pronouns,
            phone_e164: phoneValidation.e164,
            voice,
            tone,
            language,
            tint,
            consent_confirmed: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        onSuccess(data);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong saving this person.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {person ? `Edit ${person.name}` : "Add someone you love"}
          </DialogTitle>
          <DialogDescription>
            {person
              ? "Update their details, voice, and how Vaani speaks with them."
              : "Tell Vaani who they are so every call feels thoughtful and familiar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="p-3.5 rounded-xl bg-rust/10 border border-rust/20 text-rust text-small leading-relaxed">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-small font-medium text-ink">
              Their name <span className="text-rust">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meena Sharma"
              required
            />
          </div>

          {/* Nickname / What to call them */}
          <div className="space-y-1.5">
            <label className="text-small font-medium text-ink">
              What should Vaani call them?
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Maa, Aunty, Dadi…"
            />
            <p className="text-small text-ink-faint">
              The warm name Vaani will use when introducing itself.
            </p>
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <label className="text-small font-medium text-ink">
              Relationship
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((rel) => (
                <Chip
                  key={rel}
                  variant={relationship === rel ? "terracotta" : "neutral"}
                  size="sm"
                  onClick={() => {
                    setRelationship(rel);
                    setPronouns(inferPronounsFromRelationship(rel));
                  }}
                  className="cursor-pointer transition duration-150"
                >
                  {rel}
                </Chip>
              ))}
            </div>
          </div>

          {/* Pronouns */}
          <div className="space-y-2">
            <label className="text-small font-medium text-ink">
              How should Vaani refer to them?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "she", label: "She" },
                { id: "he", label: "He" },
                { id: "they", label: "They" },
              ].map((p) => (
                <Chip
                  key={p.id}
                  variant={pronouns === p.id ? "terracotta" : "neutral"}
                  size="sm"
                  onClick={() => setPronouns(p.id as PronounType)}
                  className="cursor-pointer transition duration-150"
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-small font-medium text-ink">
              Phone number <span className="text-rust">*</span>
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
            <p className="text-small text-ink-faint">
              Include the country code, like +91.
            </p>
          </div>

          {/* Voice */}
          <div className="space-y-2">
            <label className="text-small font-medium text-ink">
              Voice
            </label>
            <VoicePicker
              value={voice}
              onChange={setVoice}
              maxHeight="max-h-[260px]"
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label className="text-small font-medium text-ink">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <Chip
                  key={t}
                  variant={tone === t ? "terracotta" : "neutral"}
                  size="sm"
                  onClick={() => setTone(t)}
                  className="cursor-pointer"
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving…" : person ? "Save changes" : "Add person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
