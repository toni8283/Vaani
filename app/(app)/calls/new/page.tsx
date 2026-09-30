"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { validatePhoneNumber } from "@/lib/phone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Toggle } from "@/components/ui/toggle";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import {
  User,
  Volume2,
  HelpCircle,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { VoicePicker } from "@/components/app/voice-picker";
import { DEFAULT_FEMALE_VOICE } from "@/lib/voices";
import {
  getPronouns,
  inferPronounsFromRelationship,
  getQuestionsPlaceholder,
  getPersonalMessagePlaceholder,
  getSuggestions,
  type PronounType,
} from "@/lib/pronouns";

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

export default function CreateCallWizardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-ink-soft">Loading call setup…</div>}>
      <CreateCallWizardContent />
    </React.Suspense>
  );
}

function CreateCallWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing user people list
  const [existingPeople, setExistingPeople] = useState<any[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null);
  const [isChoosingExisting, setIsChoosingExisting] = useState(false);

  // Step 1: Who
  const [personId, setPersonId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [relationship, setRelationship] = useState("Mom");
  const [pronouns, setPronouns] = useState<PronounType>(
    inferPronounsFromRelationship("Mom")
  );
  const [phone, setPhone] = useState("");

  // Step 2: Voice
  const [voice, setVoice] = useState(DEFAULT_FEMALE_VOICE.id);
  const [tone, setTone] = useState("Warm");
  const [language, setLanguage] = useState("en");

  // Step 3: Questions & Message
  const [questions, setQuestions] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  // Step 4: Schedule & Consent
  const [scheduleType, setScheduleType] = useState<"now" | "later" | "pick" | "weekly">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("18:30");
  const [weeklyDay, setWeeklyDay] = useState("Sunday");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [notificationPref, setNotificationPref] = useState<"sms" | "email" | "app">("sms");

  // Demo self-call state
  const [isDemo, setIsDemo] = useState(false);

  // Check URL params and pending demo phone from hero landing
  useEffect(() => {
    // 1. Check sessionStorage for pending demo call
    const pendingPhone = sessionStorage.getItem("vaani:pending-phone");
    if (pendingPhone) {
      setName("You");
      setNickname("you");
      setRelationship("Someone else");
      setPronouns("they");
      setPhone(pendingPhone);
      setIsDemo(true);
      sessionStorage.removeItem("vaani:pending-phone");
    }

    // 2. Load existing people for selection
    const loadExistingPeople = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("people")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setExistingPeople(data);

          // Check if personId query param was passed
          const queryPersonId = searchParams.get("personId");
          if (queryPersonId) {
            const matched = data.find((p) => p.id === queryPersonId);
            if (matched) {
              selectPerson(matched);
            }
          }
        }
      } catch {
        // ignore
      }
    };

    loadExistingPeople();

    // Check if ?now=true
    if (searchParams.get("now") === "true") {
      setScheduleType("now");
    }
  }, [searchParams]);

  const selectPerson = (p: any) => {
    setSelectedExistingId(p.id);
    setPersonId(p.id);
    setName(p.name);
    setNickname(p.nickname || p.name);
    const rel = p.relationship || "Mom";
    setRelationship(rel);
    setPronouns((p.pronouns as PronounType) || inferPronounsFromRelationship(rel));
    setPhone(p.phone_e164 || "");
    if (p.voice) setVoice(p.voice);
    if (p.tone) setTone(p.tone);
    if (p.language) setLanguage(p.language);
    setIsChoosingExisting(true);
  };

  const clearSelectedPerson = () => {
    setSelectedExistingId(null);
    setPersonId(null);
    setName("");
    setNickname("");
    setRelationship("Mom");
    setPronouns(inferPronounsFromRelationship("Mom"));
    setPhone("");
    setIsChoosingExisting(false);
  };

  // Add suggestion chip to questions textarea
  const handleAddSuggestion = (suggestion: string) => {
    setQuestions((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return suggestion;
      if (trimmed.endsWith(".")) return `${trimmed} ${suggestion}`;
      return `${trimmed}. ${suggestion}`;
    });
  };

  // Validation for Step 1
  const validateStep1 = () => {
    setError(null);
    if (!name.trim()) {
      setError("Please provide their name.");
      return false;
    }
    // Phone number is optional in wizard
    if (phone.trim()) {
      const phoneCheck = validatePhoneNumber(phone);
      if (!phoneCheck.isValid || !phoneCheck.e164) {
        setError(phoneCheck.error || "That number doesn't look quite right. Try including the country code, like +91.");
        return false;
      }
    }
    return true;
  };

  // Advance step
  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Generate dynamic review sentence
  const reviewSentence = useMemo(() => {
    const target = nickname.trim() || name.trim() || "your loved one";
    let whenText = "right now";
    if (scheduleType === "later") whenText = "later today";
    else if (scheduleType === "pick") whenText = scheduledDate ? `on ${scheduledDate} at ${scheduledTime}` : "at your scheduled time";
    else if (scheduleType === "weekly") whenText = `every ${weeklyDay} at ${scheduledTime}`;

    const toneText = tone.toLowerCase();
    const langText = language === "en" ? "English" : language;

    let topics = "";
    if (questions.trim()) {
      const firstFew = questions
        .trim()
        .replace(/\n+/g, " ")
        .slice(0, 75);
      topics = `, and ask about ${firstFew.toLowerCase()}${firstFew.length >= 75 ? "…" : ""}`;
    }

    return `Vaani will call ${target} ${whenText}. It will introduce itself as an AI calling for you, speak ${toneText} in ${langText}${topics}.`;
  }, [name, nickname, scheduleType, scheduledDate, scheduledTime, weeklyDay, tone, language, questions]);

  // Submit Handler
  const handleSubmit = async () => {
    setError(null);

    const hasPhone = Boolean(phone.trim());
    if (hasPhone && !consentConfirmed) {
      setError("Please confirm consent to proceed.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      let {
        data: { user },
      } = await supabase.auth.getUser();

      // Support guest creation seamlessly
      if (!user) {
        const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) {
          console.error("Guest sign-in error in wizard:", anonErr);
        }
        user = anonData?.user || null;
      }

      if (!user) {
        setError("You must be logged in to create a call.");
        return;
      }

      let phoneE164: string | null = null;
      if (hasPhone) {
        const phoneCheck = validatePhoneNumber(phone);
        if (!phoneCheck.isValid || !phoneCheck.e164) {
          setError(phoneCheck.error || "Invalid phone number.");
          return;
        }
        phoneE164 = phoneCheck.e164;
      }

      let targetPersonId = personId;

      // 1. Create or reuse person
      if (targetPersonId) {
        // Update voice, tone, pronouns, and phone if reused
        await supabase
          .from("people")
          .update({
            voice,
            tone,
            pronouns,
            relationship,
            consent_confirmed: hasPhone ? true : consentConfirmed,
            phone_e164: phoneE164,
          })
          .eq("id", targetPersonId);
      } else {
        // Check if person exists with same phone for this user (if phone provided)
        let existingPerson: { id: string } | null = null;
        if (phoneE164) {
          const { data } = await supabase
            .from("people")
            .select("id")
            .eq("user_id", user.id)
            .eq("phone_e164", phoneE164)
            .maybeSingle();
          existingPerson = data;
        }

        if (existingPerson) {
          targetPersonId = existingPerson.id;
          await supabase
            .from("people")
            .update({
              voice,
              tone,
              pronouns,
              relationship,
              consent_confirmed: true,
              phone_e164: phoneE164,
            })
            .eq("id", existingPerson.id);
        } else {
          // Insert new person (phone_e164 is nullable)
          const { data: newPerson, error: personErr } = await supabase
            .from("people")
            .insert({
              user_id: user.id,
              name: name.trim(),
              nickname: nickname.trim() || name.trim(),
              relationship,
              pronouns,
              phone_e164: phoneE164,
              voice,
              tone,
              language,
              memory_enabled: memoryEnabled,
              consent_confirmed: hasPhone ? true : consentConfirmed,
            })
            .select()
            .single();

          if (personErr) throw personErr;
          targetPersonId = newPerson.id;
        }
      }

      // 2. Determine scheduled_for
      let scheduledForIso: string | null = null;
      let recurrenceStr: string | null = null;

      if (scheduleType === "now") {
        scheduledForIso = new Date().toISOString();
      } else if (scheduleType === "later") {
        const later = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
        scheduledForIso = later.toISOString();
      } else if (scheduleType === "pick") {
        if (scheduledDate) {
          scheduledForIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
        } else {
          scheduledForIso = new Date().toISOString();
        }
      } else if (scheduleType === "weekly") {
        recurrenceStr = `weekly_${weeklyDay.toLowerCase()}_${scheduledTime.replace(":", "")}`;
        // Calculate next occurrence
        const d = new Date();
        scheduledForIso = d.toISOString();
      }

      // 3. Insert Call row
      const isPhoneCallsEnabled = process.env.NEXT_PUBLIC_PHONE_CALLS === "true";
      const status = scheduleType === "now"
        ? (isPhoneCallsEnabled ? "connecting" : "ringing")
        : "scheduled";
      const channel = isPhoneCallsEnabled ? "phone" : "browser";

      const { data: callRow, error: callErr } = await supabase
        .from("calls")
        .insert({
          user_id: user.id,
          person_id: targetPersonId,
          status,
          channel,
          notes: questions.trim() || null,
          personal_message: personalMessage.trim() || null,
          scheduled_for: scheduledForIso,
          recurrence: recurrenceStr,
          is_demo: isDemo,
        })
        .select()
        .single();

      if (callErr) throw callErr;

      // If status is connecting or ringing (Right now), navigate to live call screen
      if (status === "connecting" || status === "ringing") {
        if (isPhoneCallsEnabled) {
          try {
            await fetch("/api/calls/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ callId: callRow.id, force: true }),
            });
          } catch (fetchErr) {
            console.warn("Could not reach call server:", fetchErr);
          }
        }

        router.push(`/calls/${callRow.id}/live`);
      } else {
        router.push(`/calls/${callRow.id}`);
      }
    } catch (err: unknown) {
      console.error("Error creating call:", err);
      setError(err instanceof Error ? err.message : "Something went wrong creating the call.");
    } finally {
      setLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: "Who" },
    { num: 2, label: "Voice" },
    { num: 3, label: "Questions" },
    { num: 4, label: "Schedule" },
  ];

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Back to Home Link */}
      <button
        onClick={() => router.push("/home")}
        className="inline-flex items-center gap-1.5 text-small text-ink-soft hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to dashboard</span>
      </button>

      {/* Stepper Card */}
      <Card className="rounded-[28px] bg-cream-50 border border-cream-200/90 shadow-md p-6 md:p-10 space-y-8">
        {/* Stepper Header with 4 Connected Dots */}
        <div className="space-y-4">
          <div className="relative flex items-center justify-between">
            {/* Background connecting line */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-cream-200 -z-0" />

            {/* Filled terracotta progress line */}
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-terracotta transition-all duration-300 -z-0"
              style={{
                width: `${((currentStep - 1) / 3) * 100}%`,
              }}
            />

            {/* 4 Step Dots */}
            {stepsHeader.map((s) => {
              const isPassed = s.num < currentStep;
              const isCurrent = s.num === currentStep;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-200 ${
                      isPassed
                        ? "bg-terracotta text-white"
                        : isCurrent
                        ? "bg-terracotta text-white ring-4 ring-terracotta-subtle"
                        : "bg-cream-100 border-2 border-cream-200 text-ink-faint"
                    }`}
                  >
                    {isPassed ? <Check className="size-4 stroke-[2.5]" /> : s.num}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium hidden sm:inline ${
                      isCurrent ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-rust/10 border border-rust/20 text-rust text-small leading-relaxed animate-in fade-in-0 duration-200">
            {error}
          </div>
        )}

        {/* Dynamic Step Content with Slide+Fade Transition */}
        <AnimatePresence mode="wait">
          {/* STEP 1: WHO */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-h3 md:text-h2 text-ink font-medium">
                  Who should Vaani call?
                </h2>
                <p className="text-body text-ink-soft mt-1">
                  Someone who&apos;d love to hear from you.
                </p>
              </div>

              {/* Toggle to reuse an existing person */}
              {existingPeople.length > 0 && !isDemo && (
                <div className="space-y-3 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-small font-medium text-ink">
                      Choose someone you&apos;ve added
                    </span>
                    {isChoosingExisting && (
                      <button
                        onClick={clearSelectedPerson}
                        className="text-xs text-terracotta hover:underline font-medium"
                      >
                        + Add someone new instead
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {existingPeople.map((p) => {
                      const isSelected = selectedExistingId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => selectPerson(p)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-2xl cursor-pointer border transition duration-150 ${
                            isSelected
                              ? "bg-cream-100 border-terracotta text-ink font-medium shadow-xs"
                              : "bg-cream-100/50 border-cream-200 text-ink-soft hover:bg-cream-100"
                          }`}
                        >
                          <AvatarOrb name={p.nickname || p.name} tint={p.tint || "#F2A65A"} size="sm" />
                          <div className="min-w-0">
                            <div className="text-small truncate">{p.nickname || p.name}</div>
                            <div className="text-[11px] text-ink-faint truncate">{p.relationship}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Name Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-small font-medium text-ink">
                    Their name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Meena Sharma"
                    disabled={isChoosingExisting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-small font-medium text-ink">
                    What should Vaani call them?
                  </label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Maa, Aunty, Dadi…"
                    disabled={isChoosingExisting}
                  />
                </div>

                {/* Relationship Chips */}
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
                          if (!isChoosingExisting) {
                            setRelationship(rel);
                            setPronouns(inferPronounsFromRelationship(rel));
                          }
                        }}
                        className={isChoosingExisting ? "opacity-75 cursor-default" : "cursor-pointer"}
                      >
                        {rel}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Pronouns Chips */}
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
                        onClick={() => !isChoosingExisting && setPronouns(p.id as PronounType)}
                        className={isChoosingExisting ? "opacity-75 cursor-default" : "cursor-pointer"}
                      >
                        {p.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-small font-medium text-ink">
                    Phone number
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={isChoosingExisting}
                  />
                  <p className="text-xs text-ink-muted">
                    Optional. Phone calls are coming soon.
                  </p>
                  {process.env.NEXT_PUBLIC_PHONE_CALLS === "true" && (
                    <p className="text-[11px] text-warm-amber dark:text-amber-soft bg-warm-amber/10 dark:bg-amber-soft/10 p-2 rounded-xl mt-1">
                      📞 <strong>Twilio Trial:</strong> Real telephony only rings verified numbers in Twilio Console. For any other number, Vaani connects directly with interactive voice and live microphone in your browser!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: VOICE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-h3 md:text-h2 text-ink font-medium">
                  How should Vaani sound?
                </h2>
                <p className="text-body text-ink-soft mt-1">
                  You know them best. Pick what feels right.
                </p>
              </div>

              {/* Voice Cards */}
              <div className="space-y-3">
                <label className="text-small font-medium text-ink">
                  Voice
                </label>
                <VoicePicker
                  value={voice}
                  onChange={setVoice}
                  maxHeight="max-h-[380px]"
                />
              </div>

              {/* Tone Chips */}
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

              {/* Language Select */}
              <div className="space-y-2">
                <label className="text-small font-medium text-ink">
                  Language
                </label>
                <div className="flex items-center gap-3">
                  <Chip variant="terracotta" size="default" className="cursor-default">
                    English
                  </Chip>
                  <span className="text-xs text-ink-faint px-3 py-1.5 rounded-full bg-cream-100 border border-cream-200 cursor-not-allowed">
                    Hindi · Coming soon
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: QUESTIONS */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-h3 md:text-h2 text-ink font-medium">
                  What matters in this call?
                </h2>
                <p className="text-body text-ink-soft mt-1">
                  Write it the way you&apos;d tell a friend. No special format.
                </p>
              </div>

              {/* Questions Textarea */}
              <div className="space-y-2">
                <textarea
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder={getQuestionsPlaceholder(pronouns)}
                  rows={4}
                  className="w-full p-4 rounded-2xl bg-cream-100/60 border border-cream-200 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/40 text-body leading-relaxed resize-none"
                />

                {/* Tap-to-add suggestion chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-ink-faint">Tap to add:</span>
                  <div className="flex flex-wrap gap-2">
                    {getSuggestions(pronouns).map((s) => (
                      <Chip
                        key={s}
                        variant="neutral"
                        size="sm"
                        onClick={() => handleAddSuggestion(s)}
                        className="cursor-pointer hover:border-terracotta/40 hover:text-ink text-xs"
                      >
                        + {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second field: A message from you */}
              <div className="space-y-1.5 pt-2">
                <label className="text-small font-medium text-ink">
                  A message from you <span className="text-xs text-ink-faint font-normal">(optional)</span>
                </label>
                <Input
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder={getPersonalMessagePlaceholder(pronouns)}
                />
              </div>

              {/* Toggle: Let Vaani bring up memories */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-100/50 border border-cream-200/80">
                <div className="space-y-0.5">
                  <div className="text-small font-medium text-ink">
                    Let Vaani bring up things it remembers
                  </div>
                  <div className="text-xs text-ink-faint">
                    Brings continuity from previous calls naturally.
                  </div>
                </div>
                <Toggle
                  checked={memoryEnabled}
                  onCheckedChange={setMemoryEnabled}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: SCHEDULE & REVIEW */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-h3 md:text-h2 text-ink font-medium">
                  When should Vaani call?
                </h2>
                <p className="text-body text-ink-soft mt-1">
                  Choose the timing that works best for them.
                </p>
              </div>

              {/* Radio Schedule Cards */}
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: "now", title: "Right now", desc: "Vaani dials as soon as you confirm" },
                  { id: "later", title: "Later today", desc: "Calls in a couple of hours" },
                  { id: "pick", title: "Pick a time", desc: "Select specific date and time" },
                  { id: "weekly", title: "Every week", desc: "A recurring weekly check-in" },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setScheduleType(opt.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
                      scheduleType === opt.id
                        ? "bg-terracotta-subtle/50 border-terracotta shadow-xs"
                        : "bg-cream-100/50 border-cream-200 hover:bg-cream-100"
                    }`}
                  >
                    <div className="font-medium text-ink">{opt.title}</div>
                    <div className="text-xs text-ink-soft mt-0.5">{opt.desc}</div>
                  </div>
                ))}
              </div>

              {/* Pick Time Inputs */}
              {scheduleType === "pick" && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-cream-100/60 border border-cream-200">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink">Date</label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="bg-cream-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink">Time (IST)</label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-cream-50"
                    />
                  </div>
                </div>
              )}

              {/* Weekly Inputs */}
              {scheduleType === "weekly" && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-cream-100/60 border border-cream-200">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink">Day of week</label>
                    <select
                      value={weeklyDay}
                      onChange={(e) => setWeeklyDay(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-cream-50 border border-cream-200 text-small text-ink focus:outline-none"
                    >
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink">Time (IST)</label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-cream-50"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-ink-faint">
                Times are in India Standard Time.
              </p>

              {/* Notification Preferences */}
              <div className="space-y-2 pt-2">
                <label className="text-small font-medium text-ink">
                  How should we notify you after?
                </label>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    variant={notificationPref === "sms" ? "terracotta" : "neutral"}
                    size="sm"
                    onClick={() => setNotificationPref("sms")}
                    className="cursor-pointer"
                  >
                    Text me the summary
                  </Chip>
                  <Chip
                    variant={notificationPref === "email" ? "terracotta" : "neutral"}
                    size="sm"
                    onClick={() => setNotificationPref("email")}
                    className="cursor-pointer"
                  >
                    Email me
                  </Chip>
                  <Chip
                    variant={notificationPref === "app" ? "terracotta" : "neutral"}
                    size="sm"
                    onClick={() => setNotificationPref("app")}
                    className="cursor-pointer"
                  >
                    App only
                  </Chip>
                </div>
              </div>

              {/* Review Card */}
              <div className="rounded-2xl bg-cream-100/80 border border-cream-200 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-terracotta uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>Call review</span>
                </div>
                <p className="text-body text-ink font-display leading-relaxed">
                  &ldquo;{reviewSentence}&rdquo;
                </p>
              </div>

              {/* Consent Checkbox: required only when a number is given */}
              {Boolean(phone.trim()) && (
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-cream-100/50 border border-cream-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-1 size-4 rounded text-terracotta focus:ring-terracotta"
                    required
                  />
                  <span className="text-small text-ink leading-relaxed">
                    I&apos;m happy for Vaani to call {name.trim() || nickname.trim() || "them"}.
                  </span>
                </label>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-cream-200/80">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={loading}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                <span>Back</span>
              </Button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || (Boolean(phone.trim()) && !consentConfirmed)}
                className="gap-2 shadow-xs"
              >
                {loading ? (
                  <span>Setting up…</span>
                ) : scheduleType === "now" ? (
                  <>
                    <PhoneCall className="size-4" />
                    <span>Call now</span>
                  </>
                ) : (
                  <>
                    <Calendar className="size-4" />
                    <span>Schedule call</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
