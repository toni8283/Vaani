"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { PhoneMockup } from "@/components/call/phone-mockup";
import { useCallStream } from "@/lib/hooks/use-call-stream";
import { useBrowserCall } from "@/lib/hooks/use-browser-call";
import { createClient } from "@/lib/supabase/client";
import { getAudioContext } from "@/lib/audio";

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
  const router = useRouter();
  const callId = params?.id as string;

  const [callData, setCallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
    channel,
    orbState,
    level,
    activeSpeaker,
    transcript,
    currentTurn,
    memoryTriggered,
    summary,
    moodNote,
    durationSeconds,
    phoneOpen,
    setPhoneOpen,
    errorMessage,
    fallbackToast,
    setFallbackToast,
    triggerBrowserFallback,
    isEndingOrWriting,
    needsSummary,
    setNeedsSummary,
    refetchCall,
    answerCall,
    endCall,
  } = useCallStream({
    callId,
    initialCall: callData,
  });

  const [endPressedAt, setEndPressedAt] = useState<number | null>(null);
  const [waitingSince, setWaitingSince] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());
  const [isRetryingSummarize, setIsRetryingSummarize] = useState(false);

  const browserCallRef = useRef<any>(null);

  const handleEndCall = React.useCallback(() => {
    browserCallRef.current?.end();
    endCall();
    setPhoneOpen(false);
    setEndPressedAt((prev) => prev ?? Date.now());
  }, [endCall, setPhoneOpen]);

  const browserCall = useBrowserCall(callId, {
    onCallEnded: handleEndCall,
  });

  useEffect(() => {
    browserCallRef.current = browserCall;
  }, [browserCall]);

  // Keep current time updated every second while call is active or waiting for summary
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track start of post-call waiting period (either user pressed End or call ended remotely)
  useEffect(() => {
    if (endPressedAt) {
      if (!waitingSince) setWaitingSince(endPressedAt);
      return;
    }
    if (status === "ending" || status === "completed" || isEndingOrWriting) {
      if (!waitingSince) {
        const endedAtMs = callData?.ended_at
          ? new Date(callData.ended_at).getTime()
          : Date.now();
        setWaitingSince(endedAtMs);
      }
    }
  }, [endPressedAt, status, isEndingOrWriting, callData?.ended_at, waitingSince]);

  const effectiveEndAt = endPressedAt || waitingSince;
  const elapsedSec = effectiveEndAt
    ? Math.max(0, (currentTime - effectiveEndAt) / 1000)
    : 0;

  const hasSummary = Boolean(summary);
  const isCompletedWithSummary = status === "completed" && hasSummary;

  // Recovery message condition:
  // 1. If call row is still 'live' or 'ending' 20 seconds after End press
  const isStuckLiveOrEnding =
    endPressedAt !== null &&
    (status === "live" || status === "ending") &&
    currentTime - endPressedAt >= 20000;

  // 2. If status === 'completed' and needs_summary === true
  const isCompletedNeedsSummary =
    status === "completed" &&
    (Boolean(needsSummary) || Boolean(callData?.needs_summary));

  // 3. Or after 45 seconds without a summary
  const isTimedOutWaitingForSummary =
    (isEndingOrWriting || status === "ending" || status === "completed") &&
    !hasSummary &&
    elapsedSec >= 45;

  const showRecovery =
    !isCompletedWithSummary &&
    (isStuckLiveOrEnding || isCompletedNeedsSummary || isTimedOutWaitingForSummary);

  const showWritingUp =
    !isCompletedWithSummary &&
    !showRecovery &&
    (isEndingOrWriting || status === "ending" || status === "completed");

  const handleRetrySummarize = async () => {
    setIsRetryingSummarize(true);
    try {
      const res = await fetch(`/api/calls/${callId}/summarize`, {
        method: "POST",
      });
      if (res.ok) {
        setNeedsSummary(false);
        const now = Date.now();
        setEndPressedAt(now);
        setWaitingSince(now);
        await refetchCall();
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn("Retry summarize response not OK:", errJson);
      }
    } catch (err) {
      console.error("Retry summarize fetch error:", err);
    } finally {
      setIsRetryingSummarize(false);
    }
  };

  // Auto-scroll transcript to bottom
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Toast for summary completion
  useEffect(() => {
    if (status === "completed" && summary) {
      setToastMessage("Summary sent to your phone.");
      const t = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(t);
    }
  }, [status, summary]);

  // Clear fallback toast after 6s
  useEffect(() => {
    if (fallbackToast) {
      const t = setTimeout(() => setFallbackToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [fallbackToast, setFallbackToast]);

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
    return ["Check in warmly", "Listen carefully", "Family updates"];
  }, [callData]);

  const nickname = person.nickname || person.name || "Maa";
  const effectiveLevel = Math.max(level, browserCall.level, browserCall.agentLevel);

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

        {/* Right Actions: End Call or Call Details */}
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <button
              type="button"
              onClick={() => setPhoneOpen(true)}
              title="Open Phone Mockup"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-50/90 hover:bg-cream-100 border border-terracotta/30 text-small font-medium text-terracotta shadow-xs transition"
            >
              <Smartphone className="size-4" />
              <span className="hidden sm:inline">Phone Mockup</span>
            </button>
          )}

          {status !== "completed" && !isEndingOrWriting && status !== "ending" && !showRecovery && (
            <Button
              variant="quiet"
              size="sm"
              onClick={handleEndCall}
              className="text-rust hover:bg-rust/10 hover:text-rust font-medium"
            >
              <PhoneOff className="size-4 mr-1.5" />
              <span>End call</span>
            </Button>
          )}

          {(isCompletedWithSummary || showRecovery) && (
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
        2. ERROR BANNER (if any)
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
        </motion.div>
      )}

      {/* 
        3. MAIN HERO AREA: ORB & HEADLINES 
      */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl my-auto py-6">
        {/* Animated Orb */}
        {/* Animated Orb */}
        <AnimatePresence mode="wait">
          {!showWritingUp && !showRecovery && !isCompletedWithSummary ? (
            <motion.div
              key="active-orb"
              layoutId="vaani-live-orb"
              className="relative flex items-center justify-center my-2"
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <VaaniOrb state={orbState} level={effectiveLevel} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Status Headline & Subtitle */}
        {!showWritingUp && !showRecovery && (
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

                {/* Quiet link to take the call in browser */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={triggerBrowserFallback}
                    className="text-xs text-ink-soft hover:text-terracotta underline font-medium transition-colors cursor-pointer"
                  >
                    Take this call in my browser
                  </button>
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
                  {orbState === "idle" && <span>Listening…</span>}
                </p>
              </motion.div>
            )}

            {isCompletedWithSummary && (
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
        )}

        {/* 
          4. BOTTOM HALF: MEMORY CHIP & LIVE TRANSCRIPT PANEL (when active)
        */}
        {!showWritingUp && !showRecovery && !isCompletedWithSummary && (
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

              {/* Thinking indicator */}
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
          5. POST-CALL LOADING: "Writing up how it went..." until summary exists or recovery triggers
        */}
        {showWritingUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md py-12 flex flex-col items-center justify-center text-center space-y-3.5"
          >
            <div className="size-9 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
            <h2 className="font-display text-2xl text-ink font-medium tracking-tight">
              Writing up how it went…
            </h2>
            <p className="text-small text-ink-soft max-w-xs leading-relaxed">
              Summarizing the conversation highlights, key updates, and memories.
            </p>
          </motion.div>
        )}

        {/* 
          5.5. RECOVERY STATE: Calm message when summary fails or is delayed >45s or call stuck >20s
        */}
        {showRecovery && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="size-12 rounded-full bg-cream-100 border border-cream-300 text-terracotta flex items-center justify-center shadow-xs">
              <BookHeart className="size-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl text-ink font-medium tracking-tight">
                We couldn&apos;t write the summary just now.
              </h2>
              <p className="text-body text-ink-soft">
                Your conversation is saved.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleRetrySummarize}
                disabled={isRetryingSummarize}
                className="gap-2"
              >
                {isRetryingSummarize ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Trying again…</span>
                  </>
                ) : (
                  <span>Try again</span>
                )}
              </Button>
              <Link href={`/calls/${callId}`}>
                <Button variant="ghost" className="text-ink-soft hover:text-ink">
                  See the transcript
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* 
          6. SUMMARY REVEAL CARD (when status === "completed" and summary exists)
        */}
        {isCompletedWithSummary && summary && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl rounded-card bg-cream-50 border border-cream-200 shadow-lg p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-cream-200/80">
              <div className="flex items-center gap-3">
                <AvatarOrb name={nickname} tint={person.tint || "#F2A65A"} size="md" />
                <div>
                  <h2 className="font-display text-h4 text-ink font-medium">
                    Call with {nickname}
                  </h2>
                  <p className="text-small text-ink-soft">
                    {formatTimer(durationSeconds || 60)} duration · Completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Chip variant="sage" size="sm" className="font-semibold">
                  ✓ Finished
                </Chip>
              </div>
            </div>

            {moodNote && (
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
                  &ldquo;{moodNote}&rdquo;
                </p>
              </motion.div>
            )}

            <div className="space-y-4">
              {summary.what_happened && (
                <div className="space-y-1">
                  <h3 className="text-small font-semibold uppercase tracking-wider text-ink-faint">
                    What happened
                  </h3>
                  <p className="text-body text-ink leading-relaxed">
                    {summary.what_happened}
                  </p>
                </div>
              )}

              {summary.important_updates && summary.important_updates.length > 0 && (
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

              {summary.worth_remembering && summary.worth_remembering.length > 0 && (
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

              {summary.next_call && summary.next_call.length > 0 && (
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

            <div className="pt-4 border-t border-cream-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link href={`/calls/${callId}`}>
                <Button variant="primary" className="w-full sm:w-auto gap-2">
                  <span>View full conversation & details</span>
                  <ExternalLink className="size-4" />
                </Button>
              </Link>

              <Link href="/home">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Done
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* 
        7. TOAST NOTIFICATIONS (Summary sent / Fallback activated)
      */}
      <AnimatePresence>
        {fallbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 z-50 px-5 py-3 rounded-2xl bg-cream-50/95 backdrop-blur-xl border border-warm-amber/50 shadow-xl text-small text-ink flex items-center gap-2.5 font-medium"
          >
            <Sparkles className="size-4 text-warm-amber shrink-0" />
            <span>{fallbackToast}</span>
          </motion.div>
        )}

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
        8. ROSE-GOLD IPHONE MOCKUP (Slides up from bottom-left for real browser call)
      */}
      <PhoneMockup
        isOpen={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        callerName={person.name}
        callerNickname={nickname}
        callerPhone={person.phone_e164}
        callerTint={person.tint}
        status={status}
        level={effectiveLevel}
        durationSeconds={durationSeconds}
        currentTurn={currentTurn}
        onAnswerCall={async () => {
          const ctx = getAudioContext();
          if (ctx && ctx.state === "suspended") {
            await ctx.resume().catch(() => {});
          }
          answerCall();
          await browserCall.start();
        }}
        onEndCall={handleEndCall}
        notes={callData?.notes}
        browserCall={browserCall}
      />
    </div>
  );
}

