"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid3X3,
  MessageSquare,
  Clock,
  Sparkles,
  X,
  Wifi,
  Battery,
  Signal,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import {
  getAudioContext,
  playRingtone,
  playDtmfTone,
  playPickupSound,
  playHangupSound,
} from "@/lib/audio";
import type { TurnEvent, CallStatus } from "@/lib/types/call";

interface PhoneMockupProps {
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  callerNickname?: string;
  callerPhone?: string;
  callerTint?: string;
  status: CallStatus;
  level?: number;
  durationSeconds?: number;
  currentTurn?: TurnEvent | null;
  onAnswerCall?: () => void;
  onEndCall?: () => void;
  notes?: string | null;
  browserCall?: {
    connected: boolean;
    muted: boolean;
    setMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
    level: number;
    agentLevel: number;
    micDenied: boolean;
    errorMessage: string | null;
    retryMic: () => Promise<boolean>;
  };
}

const DIALPAD_KEYS = [
  { num: "1", sub: "" },
  { num: "2", sub: "A B C" },
  { num: "3", sub: "D E F" },
  { num: "4", sub: "G H I" },
  { num: "5", sub: "J K L" },
  { num: "6", sub: "M N O" },
  { num: "7", sub: "P Q R S" },
  { num: "8", sub: "T U V" },
  { num: "9", sub: "W X Y Z" },
  { num: "*", sub: "" },
  { num: "0", sub: "+" },
  { num: "#", sub: "" },
];

export function PhoneMockup({
  isOpen,
  onClose,
  callerName = "Maa",
  callerNickname = "Maa",
  callerPhone = "+91 98765 43210",
  callerTint = "#F2A65A",
  status,
  level = 0,
  durationSeconds = 0,
  currentTurn = null,
  onAnswerCall,
  onEndCall,
  notes,
  browserCall,
}: PhoneMockupProps) {
  const [showKeypad, setShowKeypad] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [enteredDigits, setEnteredDigits] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("9:41");
  const [hasAnswered, setHasAnswered] = useState(false);

  const stopRingtoneRef = useRef<(() => void) | null>(null);

  // Sync answer state with call status
  useEffect(() => {
    if (status === "live" || browserCall?.connected) {
      setHasAnswered(true);
    } else if (
      status === "completed" ||
      status === "failed" ||
      status === "no_answer" ||
      status === "declined" ||
      !isOpen
    ) {
      setHasAnswered(false);
    }
  }, [status, isOpen, browserCall?.connected]);

  // Current time in iOS status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTimeStr(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Ringtone playback while ringing
  useEffect(() => {
    if (isOpen && (status === "ringing" || status === "connecting") && !hasAnswered) {
      stopRingtoneRef.current = playRingtone();
    } else {
      if (stopRingtoneRef.current) {
        stopRingtoneRef.current();
        stopRingtoneRef.current = null;
      }
    }

    return () => {
      if (stopRingtoneRef.current) {
        stopRingtoneRef.current();
        stopRingtoneRef.current = null;
      }
    };
  }, [isOpen, status, hasAnswered]);

  const handleAccept = () => {
    setHasAnswered(true);
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
    // User gesture: Ensure AudioContext is created and resumed synchronously
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    playPickupSound();
    onAnswerCall?.();
  };

  const handleDecline = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
    playHangupSound();
    setHasAnswered(false);
    onEndCall?.();
    onClose();
  };

  const handleHangup = () => {
    playHangupSound();
    setHasAnswered(false);
    onEndCall?.();
    onClose();
  };

  const handleKeyPress = (num: string) => {
    playDtmfTone(num);
    setEnteredDigits((prev) => (prev + num).slice(-12));
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const isCallActive = status === "live" || hasAnswered || Boolean(browserCall?.connected);
  const isIncoming = (status === "ringing" || status === "connecting") && !hasAnswered;
  const isEnded = status === "ending" || status === "completed";

  // Effective audio level: max of agent voice, user mic, or prop level
  const effectiveLevel = Math.max(
    level,
    browserCall?.level || 0,
    browserCall?.agentLevel || 0
  );

  const isMuted = browserCall ? browserCall.muted : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 pointer-events-auto flex flex-col items-start">
          {/* Container with slide-up from bottom-left animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, x: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40, x: -15 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-start origin-bottom-left"
          >
            {/* Top Companion Header Bar */}
            <div className="w-full flex items-center justify-between pb-2 px-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-50/95 dark:bg-ink-raised/95 border border-ink/10 dark:border-cream/10 shadow-md backdrop-blur-md text-[11px] font-semibold text-ink dark:text-cream">
                <Sparkles className="size-3 text-warm-amber" />
                <span>Browser Call</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                title="Minimize phone mockup"
                className="p-1 rounded-full bg-cream-50/95 dark:bg-ink-raised/95 hover:bg-cream-100 dark:hover:bg-ink-hover border border-ink/10 dark:border-cream/10 shadow-md text-ink-muted hover:text-ink dark:hover:text-cream transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* 
              ROSE-GOLD & WHITE IPHONE HARDWARE CHASSIS 
              Dimensions: 285px x 560px
              Chamfered metallic rim, ceramic faceplate, Home button
            */}
            <div className="relative w-[285px] sm:w-[305px] h-[550px] sm:h-[580px] rounded-[48px] p-[8px] bg-gradient-to-b from-[#F7D8D0] via-[#E8B4A8] to-[#D5988C] shadow-[0_20px_50px_-10px_rgba(43,33,28,0.45),0_0_0_2px_rgba(255,255,255,0.7)_inset]">
              {/* Volume buttons on left edge */}
              <div className="absolute -left-[3px] top-[108px] w-[3px] h-[26px] bg-[#D5988C] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[148px] w-[3px] h-[36px] bg-[#D5988C] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[194px] w-[3px] h-[36px] bg-[#D5988C] rounded-l-sm" />
              {/* Power button on right edge */}
              <div className="absolute -right-[3px] top-[128px] w-[3px] h-[44px] bg-[#D5988C] rounded-r-sm" />

              {/* White Ceramic Front Faceplate */}
              <div className="relative w-full h-full rounded-[40px] bg-[#FAF8F5] flex flex-col items-center justify-between p-2.5 shadow-inner">
                {/* Top Bezel: FaceTime Camera, Speaker Grill, Ambient Sensor */}
                <div className="w-full flex items-center justify-center pt-1.5 pb-1 relative">
                  <div className="absolute left-[78px] size-1.5 rounded-full bg-[#1A1412]/30" />
                  <div className="size-2.5 rounded-full bg-[#201815] border border-white/60 shadow-inner flex items-center justify-center">
                    <div className="size-1 rounded-full bg-[#415C76]/70" />
                  </div>
                  <div className="ml-2.5 w-10 h-1 rounded-full bg-[#4A3D36]/40 border border-white/50" />
                </div>

                {/* SCREEN DISPLAY AREA */}
                <div className="relative w-full flex-1 rounded-[22px] overflow-hidden bg-gradient-to-b from-[#1C1614] via-[#2A1F1B] to-[#171210] text-white flex flex-col justify-between p-3.5 shadow-inner border border-black/20 select-none">
                  {/* iOS Status Bar */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/80 px-2 pt-0.5 shrink-0">
                    <span>{currentTimeStr}</span>
                    <div className="flex items-center gap-1.5">
                      <Signal className="size-3" />
                      <Wifi className="size-3" />
                      <div className="flex items-center gap-0.5">
                        <span className="text-[9px]">98%</span>
                        <Battery className="size-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* SCREEN CONTENT: INCOMING CALL */}
                  {isIncoming && (
                    <div className="flex-1 flex flex-col items-center justify-between py-6">
                      <div className="text-center space-y-1">
                        <p className="text-xs uppercase tracking-widest text-amber-soft font-semibold animate-pulse">
                          {status === "connecting"
                            ? "Connecting…"
                            : "Vaani Voice Call"}
                        </p>
                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                          {callerNickname || callerName}
                        </h2>
                        <p className="text-xs text-white/70 font-mono">
                          {callerPhone}
                        </p>
                      </div>

                      {/* Pulsing Avatar */}
                      <div className="relative my-auto flex items-center justify-center">
                        <span className="absolute size-32 rounded-full border border-terracotta/40 animate-ping" />
                        <span className="absolute size-28 rounded-full border border-warm-amber/50 animate-pulse" />
                        <AvatarOrb
                          name={callerNickname || callerName}
                          tint={callerTint}
                          size="lg"
                          className="!size-20 shadow-orb"
                        />
                      </div>

                      {/* Quick Helper Actions */}
                      <div className="w-full flex items-center justify-around px-4 mb-4 text-white/70 text-[10px]">
                        <div className="flex flex-col items-center gap-1">
                          <Clock className="size-4" />
                          <span>Remind me</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <MessageSquare className="size-4" />
                          <span>Message</span>
                        </div>
                      </div>

                      {/* Accept / Decline Action Buttons */}
                      <div className="w-full flex items-center justify-around px-4">
                        {/* Decline */}
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleDecline}
                            className="size-14 rounded-full bg-rust hover:bg-rust/90 flex items-center justify-center text-white shadow-lg shadow-rust/40 active:scale-95 transition-transform"
                          >
                            <PhoneOff className="size-6" />
                          </button>
                          <span className="text-[11px] font-medium text-white/80">
                            Decline
                          </span>
                        </div>

                        {/* Accept */}
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleAccept}
                            className="size-14 rounded-full bg-[#34C759] hover:bg-[#30B752] flex items-center justify-center text-white shadow-lg shadow-[#34C759]/40 animate-bounce active:scale-95 transition-transform"
                          >
                            <PhoneCall className="size-6" />
                          </button>
                          <span className="text-[11px] font-medium text-white/80">
                            Accept
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN CONTENT: ACTIVE CALL */}
                  {isCallActive && (
                    <div className="flex-1 flex flex-col items-center justify-between py-2">
                      <div className="text-center space-y-0.5 pt-1">
                        <h2 className="text-xl font-semibold tracking-tight text-white">
                          {callerNickname || callerName}
                        </h2>
                        <p className="text-xs font-mono tabular-nums text-white/80">
                          {formatTimer(durationSeconds)}
                        </p>
                        {currentTurn?.text && (
                          <p className="text-[11px] text-amber-soft max-w-[220px] truncate mx-auto pt-0.5">
                            {currentTurn.speaker === "vaani" ? "Vaani: " : "You: "}
                            &quot;{currentTurn.text}&quot;
                          </p>
                        )}
                      </div>

                      {/* Microphone Permission Warning / Retry */}
                      {browserCall?.micDenied && (
                        <div className="mx-2 p-2.5 rounded-xl bg-rust/20 border border-rust/40 text-center space-y-1.5">
                          <div className="flex items-center justify-center gap-1 text-rust text-xs font-medium">
                            <AlertCircle className="size-3.5" />
                            <span>Microphone Permission</span>
                          </div>
                          <p className="text-[11px] text-white/90 leading-tight">
                            Vaani needs your microphone to talk. Allow it in your browser&apos;s address bar and try again.
                          </p>
                          <button
                            type="button"
                            onClick={() => browserCall.retryMic()}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rust hover:bg-rust/90 text-white text-xs font-semibold shadow-xs"
                          >
                            <RefreshCw className="size-3" />
                            <span>Try again</span>
                          </button>
                        </div>
                      )}

                      {/* Center: Live Waveform Orb or Keypad */}
                      <div className="my-auto w-full flex flex-col items-center justify-center">
                        {showKeypad ? (
                          <div className="w-full space-y-2 py-1">
                            <div className="h-6 text-center text-sm font-mono tracking-widest text-amber-soft">
                              {enteredDigits || "Enter digits"}
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-3">
                              {DIALPAD_KEYS.map((k) => (
                                <button
                                  type="button"
                                  key={k.num}
                                  onClick={() => handleKeyPress(k.num)}
                                  className="h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex flex-col items-center justify-center text-white transition-colors"
                                >
                                  <span className="text-sm font-semibold leading-none">
                                    {k.num}
                                  </span>
                                  {k.sub && (
                                    <span className="text-[7px] text-white/60 tracking-wider">
                                      {k.sub}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowKeypad(false)}
                              className="w-full text-center text-[10px] text-white/70 hover:text-white pt-1"
                            >
                              Hide keypad
                            </button>
                          </div>
                        ) : showNotes ? (
                          <div className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1.5 max-h-48 overflow-y-auto">
                            <div className="font-semibold text-amber-soft flex items-center justify-between">
                              <span>Call Topics</span>
                              <button
                                type="button"
                                onClick={() => setShowNotes(false)}
                                className="text-[10px] text-white/60"
                              >
                                Close
                              </button>
                            </div>
                            <p className="text-white/80 text-[11px] leading-relaxed">
                              {notes || "Check in gently, listen warmly, and note how they are doing."}
                            </p>
                          </div>
                        ) : (
                          <div className="relative flex items-center justify-center py-4">
                            <motion.div
                              animate={{
                                scale: 1 + effectiveLevel * 0.25,
                                opacity: 0.8 + effectiveLevel * 0.2,
                              }}
                              transition={{ duration: 0.1 }}
                              className="relative flex items-center justify-center"
                            >
                              <span
                                className="absolute -inset-4 rounded-full bg-amber-glow/30 blur-xl pointer-events-none"
                                style={{ opacity: 0.4 + effectiveLevel * 0.6 }}
                              />
                              <AvatarOrb
                                name={callerNickname || callerName}
                                tint={callerTint}
                                size="lg"
                                className="!size-20 shadow-orb"
                              />
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* In-Call Controls */}
                      <div className="w-full grid grid-cols-3 gap-y-3 px-3 py-1">
                        {/* 1. Mute */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (browserCall) {
                                browserCall.setMuted(!isMuted);
                              }
                            }}
                            className={`size-11 rounded-full flex items-center justify-center transition-colors ${
                              isMuted
                                ? "bg-white text-ink"
                                : "bg-white/15 hover:bg-white/25 text-white"
                            }`}
                          >
                            {isMuted ? (
                              <MicOff className="size-5" />
                            ) : (
                              <Mic className="size-5" />
                            )}
                          </button>
                          <span className="text-[10px] text-white/80">
                            {isMuted ? "Unmute" : "Mute"}
                          </span>
                        </div>

                        {/* 2. Keypad */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowKeypad(!showKeypad);
                              setShowNotes(false);
                            }}
                            className={`size-11 rounded-full flex items-center justify-center transition-colors ${
                              showKeypad
                                ? "bg-white text-ink"
                                : "bg-white/15 hover:bg-white/25 text-white"
                            }`}
                          >
                            <Grid3X3 className="size-5" />
                          </button>
                          <span className="text-[10px] text-white/80">Keypad</span>
                        </div>

                        {/* 3. Speaker */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIsSpeaker(!isSpeaker)}
                            className={`size-11 rounded-full flex items-center justify-center transition-colors ${
                              isSpeaker
                                ? "bg-white text-ink"
                                : "bg-white/15 hover:bg-white/25 text-white"
                            }`}
                          >
                            {isSpeaker ? (
                              <Volume2 className="size-5" />
                            ) : (
                              <VolumeX className="size-5" />
                            )}
                          </button>
                          <span className="text-[10px] text-white/80">Speaker</span>
                        </div>

                        {/* 4. Notes */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotes(!showNotes);
                              setShowKeypad(false);
                            }}
                            className={`size-11 rounded-full flex items-center justify-center transition-colors ${
                              showNotes
                                ? "bg-white text-ink"
                                : "bg-white/15 hover:bg-white/25 text-white"
                            }`}
                          >
                            <FileText className="size-5" />
                          </button>
                          <span className="text-[10px] text-white/80">Notes</span>
                        </div>

                        {/* 5. Live Audio Badge */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="size-11 rounded-full bg-white/10 flex items-center justify-center text-amber-soft">
                            <Sparkles className="size-5" />
                          </div>
                          <span className="text-[10px] text-white/80">Vaani</span>
                        </div>

                        {/* 6. End Call */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={handleHangup}
                            className="size-11 rounded-full bg-rust hover:bg-rust/90 flex items-center justify-center text-white shadow-lg shadow-rust/50 active:scale-95 transition-transform cursor-pointer"
                          >
                            <PhoneOff className="size-5" />
                          </button>
                          <span className="text-[10px] text-white/80">End</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN CONTENT: CALL ENDED / COMPLETED */}
                  {isEnded && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-10">
                      <div className="size-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sage">
                        <PhoneOff className="size-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white">
                          Call Completed
                        </h3>
                        <p className="text-xs text-white/70 font-mono mt-0.5">
                          Duration: {formatTimer(durationSeconds)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Bezel: Classic Circular TouchID / Home Button */}
                <div className="w-full flex items-center justify-center pt-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={onClose}
                    title="Home button (Minimize)"
                    className="size-10 rounded-full bg-gradient-to-b from-[#F5F2EB] to-[#ECE7DD] border-2 border-[#E8B4A8] shadow-inner active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                  >
                    <div className="size-3.5 rounded-md border border-[#E8B4A8]/40" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
