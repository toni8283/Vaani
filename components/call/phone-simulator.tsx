"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
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
  Volume1,
  FileText,
  RotateCcw,
} from "lucide-react";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import {
  playRingtone,
  playDtmfTone,
  playPickupSound,
  playHangupSound,
  speakSpeech,
  stopSpeech,
} from "@/lib/audio";
import type { TurnEvent } from "@/lib/demo/simulator";

interface PhoneSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  callerNickname?: string;
  callerPhone?: string;
  callerTint?: string;
  status:
    | "connecting"
    | "ringing"
    | "live"
    | "ending"
    | "completed"
    | "failed"
    | "no_answer"
    | "declined";
  level?: number;
  durationSeconds?: number;
  currentTurn?: TurnEvent | null;
  onAnswerCall?: () => void;
  onEndCall?: () => void;
  notes?: string | null;
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

export function PhoneSimulator({
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
}: PhoneSimulatorProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [enteredDigits, setEnteredDigits] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("9:41");

  const stopRingtoneRef = useRef<(() => void) | null>(null);

  // Time in status bar
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

  // Ringtone handling when ringing
  useEffect(() => {
    if (isOpen && status === "ringing") {
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
  }, [isOpen, status]);

  // Voice speech synthesis when a new turn occurs and voiceSpeechEnabled is true
  useEffect(() => {
    if (status === "live" && voiceSpeechEnabled && currentTurn?.text) {
      if (currentTurn.speaker === "vaani" || currentTurn.speaker === "person") {
        speakSpeech(currentTurn.text);
      }
    } else if (status !== "live") {
      stopSpeech();
    }
  }, [currentTurn, status, voiceSpeechEnabled]);

  const handleAccept = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
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
    stopSpeech();
    onEndCall?.();
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

  const isCallActive = status === "live";
  const isIncoming = status === "ringing" || status === "connecting";
  const isEnded = status === "ending" || status === "completed";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-ink/50 backdrop-blur-md transition-all">
      {/* Container with pop-in animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        {/* Floating Top Controls (Close Simulator, Audio speech badge) */}
        <div className="absolute -top-12 inset-x-0 flex items-center justify-between px-2 text-white/90">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-1.5 shadow-sm">
              <Sparkles className="size-3 text-warm-amber" />
              Browser Phone Companion
            </span>
          </div>

          <button
            onClick={onClose}
            title="Minimize phone"
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 
          ROSE-GOLD & WHITE IPHONE HARDWARE CHASSIS 
          Dimensions: 300px x 620px
          Chamfered metallic rim, ceramic faceplate, Home button
        */}
        <div
          className="relative w-[306px] sm:w-[320px] h-[610px] sm:h-[630px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#F7D8D0] via-[#E8B4A8] to-[#D5988C] shadow-[0_25px_65px_-12px_rgba(90,45,20,0.5),0_0_0_1px_rgba(255,255,255,0.6)_inset]"
          style={{
            boxShadow:
              "0 25px 65px -12px rgba(43, 33, 28, 0.55), 0 0 0 2px rgba(255,255,255,0.7) inset, 0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          {/* Subtle volume buttons on left edge */}
          <div className="absolute -left-[3px] top-[108px] w-[3px] h-[26px] bg-[#D5988C] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[148px] w-[3px] h-[36px] bg-[#D5988C] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[194px] w-[3px] h-[36px] bg-[#D5988C] rounded-l-sm" />
          {/* Power button on right edge */}
          <div className="absolute -right-[3px] top-[128px] w-[3px] h-[44px] bg-[#D5988C] rounded-r-sm" />

          {/* White Ceramic Front Faceplate */}
          <div className="relative w-full h-full rounded-[44px] bg-[#FAF8F5] flex flex-col items-center justify-between p-3.5 shadow-inner">
            {/* Top Bezel: FaceTime Camera, Speaker Grill, Ambient Sensor */}
            <div className="w-full flex items-center justify-center pt-2 pb-1 relative">
              {/* Sensor */}
              <div className="absolute left-[88px] size-2 rounded-full bg-[#1A1412]/30" />
              {/* Camera */}
              <div className="size-3 rounded-full bg-[#201815] border border-white/60 shadow-inner flex items-center justify-center">
                <div className="size-1 rounded-full bg-[#415C76]/70" />
              </div>
              {/* Speaker Grill */}
              <div className="ml-3 w-12 h-1 rounded-full bg-[#4A3D36]/40 border border-white/50" />
            </div>

            {/* SCREEN DISPLAY AREA */}
            <div className="relative w-full flex-1 rounded-[28px] overflow-hidden bg-gradient-to-b from-[#1C1614] via-[#2A1F1B] to-[#171210] text-white flex flex-col justify-between p-4 shadow-inner border border-black/20 select-none">
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
                  {/* Caller Header */}
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
                  {/* Top Caller Info & Duration */}
                  <div className="text-center space-y-0.5 pt-1">
                    <h2 className="text-xl font-semibold tracking-tight text-white">
                      {callerNickname || callerName}
                    </h2>
                    <p className="text-xs font-mono tabular-nums text-white/80">
                      {formatTimer(durationSeconds)}
                    </p>
                    {currentTurn && (
                      <p className="text-[11px] text-amber-soft max-w-[220px] truncate mx-auto pt-0.5">
                        {currentTurn.speaker === "vaani" ? "Vaani: " : "Maa: "}
                        &quot;{currentTurn.text}&quot;
                      </p>
                    )}
                  </div>

                  {/* Center: Live Waveform Orb or Keypad */}
                  <div className="my-auto w-full flex flex-col items-center justify-center">
                    {showKeypad ? (
                      /* Interactive Keypad */
                      <div className="w-full space-y-2 py-1">
                        <div className="h-6 text-center text-sm font-mono tracking-widest text-amber-soft">
                          {enteredDigits || "Enter digits"}
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-3">
                          {DIALPAD_KEYS.map((k) => (
                            <button
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
                          onClick={() => setShowKeypad(false)}
                          className="w-full text-center text-[10px] text-white/70 hover:text-white pt-1"
                        >
                          Hide keypad
                        </button>
                      </div>
                    ) : showNotes ? (
                      /* Quick Notes Preview */
                      <div className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1.5 max-h-48 overflow-y-auto">
                        <div className="font-semibold text-amber-soft flex items-center justify-between">
                          <span>Call Topics</span>
                          <button
                            onClick={() => setShowNotes(false)}
                            className="text-[10px] text-white/60"
                          >
                            Close
                          </button>
                        </div>
                        <p className="text-white/80 text-[11px] leading-relaxed">
                          {notes ||
                            "Her knee stiffness, Meena's wedding attendance on the 14th, and sleep check-in."}
                        </p>
                      </div>
                    ) : (
                      /* Active Call Orb reacting to Level */
                      <div className="relative flex items-center justify-center py-4">
                        <motion.div
                          animate={{
                            scale: 1 + level * 0.25,
                            opacity: 0.8 + level * 0.2,
                          }}
                          transition={{ duration: 0.1 }}
                          className="relative flex items-center justify-center"
                        >
                          <span
                            className="absolute -inset-4 rounded-full bg-amber-glow/30 blur-xl pointer-events-none"
                            style={{ opacity: 0.4 + level * 0.6 }}
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

                  {/* 6 In-Call Control Buttons */}
                  <div className="w-full grid grid-cols-3 gap-y-3 px-3 py-1">
                    {/* 1. Mute */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
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

                    {/* 4. Spoken Voice Audio TTS */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => {
                          if (voiceSpeechEnabled) stopSpeech();
                          setVoiceSpeechEnabled(!voiceSpeechEnabled);
                        }}
                        title={
                          voiceSpeechEnabled
                            ? "Disable browser voice speech"
                            : "Enable browser voice speech"
                        }
                        className={`size-11 rounded-full flex items-center justify-center transition-colors ${
                          voiceSpeechEnabled
                            ? "bg-amber-soft text-ink"
                            : "bg-white/15 hover:bg-white/25 text-white"
                        }`}
                      >
                        <Volume1 className="size-5" />
                      </button>
                      <span className="text-[10px] text-white/80">Voice</span>
                    </div>

                    {/* 5. Notes */}
                    <div className="flex flex-col items-center gap-1">
                      <button
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

                    {/* 6. Info / Vaani Badge */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="size-11 rounded-full bg-white/10 flex items-center justify-center text-amber-soft">
                        <Sparkles className="size-5" />
                      </div>
                      <span className="text-[10px] text-white/80">Vaani</span>
                    </div>
                  </div>

                  {/* End Call Button */}
                  <div className="pt-2 pb-1 flex justify-center">
                    <button
                      onClick={handleDecline}
                      className="size-14 rounded-full bg-rust hover:bg-rust/90 flex items-center justify-center text-white shadow-lg shadow-rust/50 active:scale-95 transition-transform"
                    >
                      <PhoneOff className="size-6" />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN CONTENT: CALL ENDED / COMPLETED */}
              {isEnded && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <div className="size-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sage">
                    <PhoneOff className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      Call Completed
                    </h3>
                    <p className="text-xs text-white/70 font-mono mt-1">
                      Duration: {formatTimer(durationSeconds)}
                    </p>
                  </div>
                  <p className="text-xs text-amber-soft max-w-[200px] leading-relaxed">
                    Preparing conversation summary and memory notes…
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Bezel: Classic Circular TouchID / Home Button */}
            <div className="w-full flex items-center justify-center pt-2 pb-0.5">
              <button
                onClick={onClose}
                title="Home button (Minimize)"
                className="size-11 rounded-full bg-gradient-to-b from-[#F5F2EB] to-[#ECE7DD] border-2 border-[#E8B4A8] shadow-inner active:scale-95 transition-transform flex items-center justify-center"
              >
                <div className="size-4 rounded-md border border-[#E8B4A8]/40" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
