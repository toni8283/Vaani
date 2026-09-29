"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  PhoneOff,
  Sparkles,
  ArrowLeft,
  BookHeart,
  Calendar,
  Clock,
  Heart,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronRight,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PhoneSimulator } from "@/components/call/phone-simulator";
import { useCallStream } from "@/hooks/use-call-stream";
import { createClient } from "@/lib/supabase/client";

export default function LiveCallPage() {
  return (
    <React.Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream text-ink">
          <p className="text-body animate-pulse">Connecting to live call…</p>
        </div>
      }
    >
      <LiveCallContent />
    </React.Suspense>
  );
}

function LiveCallContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const callId = params?.id as string;
  const isDemoQuery = searchParams.get("demo") === "true";

  const [callData, setCallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Triple 'D' keypress detector for quick judge demo
  const dPressCountRef = useRef(0);
  const dPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restartDemoRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey) {
        dPressCountRef.current += 1;
        if (dPressTimerRef.current) clearTimeout(dPressTimerRef.current);
        dPressTimerRef.current = setTimeout(() => {
          dPressCountRef.current = 0;
        }, 1000);

        if (dPressCountRef.current >= 3) {
          dPressCountRef.current = 0;
          restartDemoRef.current?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch initial call record
  useEffect(() => {
    if (!callId) return;

    const fetchCall = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("calls")
          .select("*, people(*)")
          .eq("id", callId)
          .single();

        if (error) {
          console.warn("Could not fetch call record from Supabase:", error.message);
        } else {
          setCallData(data);
        }
      } catch (err) {
        console.error("Error fetching call:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCall();
  }, [callId]);

  const person = callData?.people || {
    name: "Maa",
    nickname: "Maa",
    relationship: "Mother",
    phone_e164: "+91 98765 43210",
    tint: "#F2A65A",
  };

  const {
    status,
    orbState,
    level,
    activeSpeaker,
    transcript,
    currentTurn,
    memoryTriggered,
    summary,
    moodNote,
    durationSeconds,
    isSimulated,
    phoneOpen,
    setPhoneOpen,
    errorMessage,
    answerCall,
    endCall,
    restartDemo,
  } = useCallStream({
    callId,
    initialCall: callData,
    forceDemo: Boolean(isDemoQuery && !callData?.twilio_call_sid),
  });

  restartDemoRef.current = restartDemo;

  // Transcript auto-scroll
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Toast for summary completion
  useEffect(() => {
    if (status === "completed") {
      setToastMessage("Summary sent to your phone.");
      const t = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Extract note topics for connecting screen
  const noteTopics = React.useMemo(() => {
    if (callData?.notes) {
      return callData.notes
        .split(".")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
    return ["Her knee", "Meena's wedding", "Your message"];
  }, [callData]);

  const nickname = person.nickname || person.name || "Maa";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-cream bg-[radial-gradient(ellipse_at_50%_30%,#FBD9A8_0%,rgba(250,246,240,0)_65%)] overflow-y-auto px-4 py-4 md:py-6 selection:bg-terracotta-subtle">
      {/* 
        1. TOP BAR 
      */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Caller Chip */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cream-50/80 backdrop-blur-xl border border-cream-200/80 shadow-xs">
          <AvatarOrb name={nickname} tint={person.tint || "#F2A65A"} size="sm" />
          <div className="min-w-0 pr-1">
            <div className="text-small font-semibold text-ink leading-tight truncate">
              {nickname}
            </div>
            <div className="text-[11px] text-ink-faint leading-tight truncate">
              {person.relationship || "Loved one"}
            </div>
          </div>
        </div>

        {/* Center: Live / Status Pill */}
        <div className="flex items-center gap-2">
          {status === "live" && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/15 border border-sage/30 text-sage text-small font-medium shadow-xs">
              <span className="size-2 rounded-full bg-sage animate-pulse" />
              <span>LIVE</span>
              <span className="font-mono tabular-nums text-xs ml-1 border-l border-sage/30 pl-2">
                {formatTimer(durationSeconds)}
              </span>
            </div>
          )}
          {status === "ringing" && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-honey/15 border border-honey/30 text-honey text-small font-medium shadow-xs">
              <span className="size-2 rounded-full bg-honey animate-ping" />
              <span>RINGING</span>
              <span className="font-mono tabular-nums text-xs ml-1">
                0:0{Math.min(9, durationSeconds + 4)}
              </span>
            </div>
          )}
          {status === "connecting" && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-small font-medium">
              <span className="size-2 rounded-full bg-terracotta animate-pulse" />
              <span>CONNECTING</span>
            </div>
          )}
        </div>

        {/* Right Actions: Phone Simulator Trigger, Demo Trigger & End Call */}
        <div className="flex items-center gap-2">
          {/* Phone Simulator Launch Button */}
          <button
            type="button"
            onClick={() => setPhoneOpen(true)}
            title="Open Rose-Gold iPhone Simulator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-50/90 hover:bg-cream-100 border border-terracotta/30 text-small font-medium text-terracotta shadow-xs transition hover:scale-105 active:scale-95"
          >
            <Smartphone className="size-4" />
            <span className="hidden sm:inline">Phone Simulator</span>
          </button>

          {/* Quick Demo Restart */}
          <button
            type="button"
            onClick={restartDemo}
            title="Replay simulated call"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-cream-100/70 hover:bg-cream-100 border border-cream-200 text-xs text-ink-soft hover:text-ink transition"
          >
            <RotateCcw className="size-3.5" />
            <span>Replay</span>
          </button>

          {/* End Call Button */}
          {status !== "completed" && (
            <Button
              variant="quiet"
              size="sm"
              onClick={endCall}
              className="text-rust hover:bg-rust/10 hover:text-rust font-medium"
            >
              <PhoneOff className="size-4 mr-1.5" />
              <span>End call</span>
            </Button>
          )}

          {status === "completed" && (
            <Link href={`/calls/${callId}`}>
              <Button variant="quiet" size="sm" className="gap-1.5">
                <span>Call Details</span>
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* 
        2. ERROR / TWILIO FALLBACK BANNER (If call failed or remote judge notice)
      */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl mt-4 p-3.5 rounded-2xl bg-warm-amber/10 border border-warm-amber/30 text-ink text-small flex items-start gap-2.5 shadow-sm"
        >
          <AlertTriangle className="size-5 text-terracotta shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-ink">{errorMessage}</p>
          </div>
          <button
            onClick={() => setPhoneOpen(true)}
            className="underline font-semibold text-terracotta text-xs shrink-0"
          >
            Open Phone
          </button>
        </motion.div>
      )}

      {/* 
        3. MAIN HERO AREA: ORB & HEADLINES 
      */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl my-auto py-6">
        {/* Animated Orb */}
        <AnimatePresence mode="wait">
          {status !== "completed" ? (
            <motion.div
              key="active-orb"
              layoutId="vaani-live-orb"
              className="relative flex items-center justify-center my-2"
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <VaaniOrb state={orbState} level={level} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* 
          Status Headline & Subtitle per State
        */}
        <div className="mt-8 text-center space-y-2 max-w-xl px-4">
          {status === "connecting" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              <h1 className="font-display text-3xl md:text-[32px] text-ink font-medium tracking-tight">
                Getting ready to call {nickname}…
              </h1>
              <p className="text-body text-ink-soft leading-relaxed">
                Vaani has your notes: {noteTopics.join(", ")}, and your personal message.
              </p>

              {/* Three note chips sliding up */}
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {noteTopics.map((topic: string, i: number) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                  >
                    <Chip variant="terracotta" size="sm">
                      {topic}
                    </Chip>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {status === "ringing" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <h1 className="font-display text-3xl md:text-[32px] text-ink font-medium tracking-tight">
                Ringing {nickname}…
              </h1>
              <p className="text-body text-ink-soft leading-relaxed">
                Vaani will say hello and explain who it is.
              </p>
              <div className="flex items-center justify-center gap-2 text-small text-ink-faint pt-1">
                <span className="size-2 rounded-full bg-honey animate-ping" />
                <span className="font-mono tabular-nums">
                  0:0{Math.min(9, durationSeconds + 4)}
                </span>
              </div>
            </motion.div>
          )}

          {status === "live" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <h1 className="font-display text-3xl md:text-[32px] text-ink font-medium tracking-tight">
                Talking with {nickname}
              </h1>
              <p className="text-body text-ink-soft flex items-center justify-center gap-2">
                {orbState === "speaking" && (
                  <span className="text-terracotta font-medium animate-pulse">
                    ● Vaani is speaking
                  </span>
                )}
                {orbState === "listening" && (
                  <span className="text-sage font-medium animate-pulse">
                    ● {nickname} is speaking
                  </span>
                )}
                {orbState === "thinking" && (
                  <span className="text-amber-glow font-medium">
                    Vaani is thinking…
                  </span>
                )}
                {orbState === "idle" && (
                  <span>Listening…</span>
                )}
              </p>
            </motion.div>
          )}

          {status === "ending" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <h1 className="font-display text-3xl md:text-[32px] text-ink font-medium tracking-tight">
                Saying goodbye…
              </h1>
              <p className="text-body text-ink-soft italic">
                &ldquo;{currentTurn?.text || `Take care, ${nickname}.`}&rdquo;
              </p>
            </motion.div>
          )}

          {status === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-1 mb-4"
            >
              <h1 className="font-display text-3xl md:text-[36px] text-ink font-medium tracking-tight">
                Here&apos;s how it went.
              </h1>
              <p className="text-body text-ink-soft">
                A few things you&apos;ll want to know.
              </p>
            </motion.div>
          )}
        </div>

        {/* 
          4. BOTTOM HALF: MEMORY CHIP & GLASS TRANSCRIPT PANEL (when active)
        */}
        {status !== "completed" && (
          <div className="w-full max-w-xl mt-6 space-y-3">
            {/* Memory Chip Popup */}
            <AnimatePresence>
              {memoryTriggered && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50/90 backdrop-blur-xl border border-warm-amber/50 shadow-md text-small text-ink font-medium"
                >
                  <BookHeart className="size-4 text-terracotta shrink-0" />
                  <span>{memoryTriggered}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glass Transcript Panel */}
            <div className="w-full max-h-[32vh] overflow-y-auto rounded-card bg-cream-50/70 backdrop-blur-xl border border-white/60 shadow-md p-5 space-y-3.5 text-small">
              {transcript.length === 0 ? (
                <div className="py-6 text-center text-ink-faint">
                  <p className="italic">
                    {status === "connecting"
                      ? "Getting audio stream ready…"
                      : status === "ringing"
                      ? "Waiting for answer…"
                      : "The conversation will appear here live."}
                  </p>
                </div>
              ) : (
                transcript.map((turn) => {
                  const isVaani = turn.speaker === "vaani";
                  return (
                    <motion.div
                      key={turn.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`flex items-start gap-3 ${
                        isVaani ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {/* Avatar indicator */}
                      <div className="shrink-0 mt-0.5">
                        {isVaani ? (
                          <div className="size-5 rounded-full bg-gradient-to-tr from-terracotta to-warm-amber shadow-xs flex items-center justify-center">
                            <span className="size-1.5 rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="size-5 rounded-full bg-cream-200 border border-cream-300 flex items-center justify-center text-[10px] font-semibold text-ink">
                            {nickname[0]}
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 space-y-0.5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                          {isVaani ? "Vaani" : nickname}
                        </div>
                        <p className="text-small leading-relaxed text-ink">
                          {turn.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Three-dot thinking indicator */}
              {orbState === "thinking" && (
                <div className="flex items-center gap-1.5 py-1 px-8 text-ink-faint">
                  <span className="size-1.5 rounded-full bg-terracotta animate-bounce" />
                  <span className="size-1.5 rounded-full bg-terracotta animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-terracotta animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-ink-faint ml-2">Vaani is thinking…</span>
                </div>
              )}

              <div ref={transcriptBottomRef} />
            </div>
          </div>
        )}

        {/* 
          5. SUMMARY REVEAL CARD (when status === "completed")
        */}
        {status === "completed" && summary && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl rounded-card bg-cream-50 border border-cream-200 shadow-lg p-6 md:p-8 space-y-6"
          >
            {/* Header: Mini Orb Avatar + Info */}
            <div className="flex items-center justify-between pb-4 border-b border-cream-200/80">
              <div className="flex items-center gap-3">
                <AvatarOrb name={nickname} tint={person.tint || "#F2A65A"} size="md" />
                <div>
                  <h2 className="font-display text-h4 text-ink font-medium">
                    Call with {nickname}
                  </h2>
                  <p className="text-small text-ink-soft">
                    {formatTimer(durationSeconds || 68)} duration · Completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Chip variant="sage" size="sm" className="font-semibold">
                  ✓ Finished
                </Chip>
              </div>
            </div>

            {/* Vaani's Note to You (Handwritten feel) */}
            {summary.mood_note && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-2xl bg-amber-soft/20 border border-amber-soft/40 space-y-1"
              >
                <div className="text-caption font-semibold uppercase tracking-wider text-terracotta-deep flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  <span>Vaani&apos;s note to you</span>
                </div>
                <p className="text-body font-display italic text-ink leading-relaxed">
                  &ldquo;{summary.mood_note}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Four Summary Blocks */}
            <div className="space-y-4">
              {/* Block 1: What happened */}
              <div className="space-y-1">
                <h3 className="text-small font-semibold uppercase tracking-wider text-ink-faint">
                  What happened
                </h3>
                <p className="text-body text-ink leading-relaxed">
                  {summary.what_happened}
                </p>
              </div>

              {/* Block 2: Important updates */}
              {summary.important_updates?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-small font-semibold uppercase tracking-wider text-ink-faint">
                      Important updates
                    </h3>
                    {summary.needs_attention && (
                      <Chip variant="terracotta" size="sm">
                        Worth a look
                      </Chip>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {summary.important_updates.map((update, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-small text-ink"
                      >
                        <span className="size-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                        <span>{update}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Block 3: Things worth remembering */}
              {summary.worth_remembering?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-small font-semibold uppercase tracking-wider text-ink-faint">
                    Things worth remembering
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {summary.worth_remembering.map((mem, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-cream-100 border border-cream-200/80 text-small text-ink flex items-start gap-2"
                      >
                        <Heart className="size-3.5 text-terracotta shrink-0 mt-0.5" />
                        <span>{mem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Block 4: For your next call */}
              {summary.next_call?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-small font-semibold uppercase tracking-wider text-ink-faint">
                    For your next call
                  </h3>
                  <ul className="space-y-1.5">
                    {summary.next_call.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-small text-ink-soft"
                      >
                        <span className="size-1.5 rounded-full bg-honey mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-cream-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link href={`/calls/${callId}`}>
                <Button variant="primary" className="w-full sm:w-auto gap-2">
                  <span>View full conversation & details</span>
                  <ExternalLink className="size-4" />
                </Button>
              </Link>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="ghost"
                  onClick={restartDemo}
                  className="w-full sm:w-auto text-small text-ink-soft hover:text-ink"
                >
                  <RotateCcw className="size-4 mr-1.5" />
                  <span>Replay</span>
                </Button>

                <Link href="/home">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Done
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 
        6. SUCCESS TOAST NOTIFICATION 
      */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 z-50 px-5 py-3 rounded-2xl bg-cream-50/90 backdrop-blur-xl border border-white/60 shadow-lg text-small text-ink flex items-center gap-2.5 font-medium"
          >
            <Check className="size-4 text-sage shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        7. BROWSER PHONE SIMULATOR COMPANION (White & Rose-Gold iPhone)
      */}
      <PhoneSimulator
        isOpen={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        callerName={person.name}
        callerNickname={nickname}
        callerPhone={person.phone_e164}
        callerTint={person.tint}
        status={status}
        level={level}
        durationSeconds={durationSeconds}
        currentTurn={currentTurn}
        onAnswerCall={answerCall}
        onEndCall={endCall}
        notes={callData?.notes}
      />

      {/* Floating button to restore companion phone when closed */}
      <AnimatePresence>
        {!phoneOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            onClick={() => setPhoneOpen(true)}
            title="Open Phone Simulator"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink text-cream shadow-xl border border-cream/20 hover:bg-ink/90 active:scale-95 transition-all text-xs font-medium cursor-pointer"
          >
            <Smartphone className="size-4 text-warm-amber" />
            <span>Interactive Phone</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
