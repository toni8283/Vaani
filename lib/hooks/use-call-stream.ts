"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TurnEvent, CallSummary, CallStatus } from "@/lib/types/call";
import type { OrbState } from "@/components/call/vaani-orb";

interface UseCallStreamOptions {
  callId: string;
  initialCall?: any;
}

export function useCallStream({ callId, initialCall }: UseCallStreamOptions) {
  const [callData, setCallData] = useState<any>(initialCall || null);
  const [status, setStatus] = useState<CallStatus>(
    initialCall?.status || "connecting"
  );
  const [channel, setChannel] = useState<string>(initialCall?.channel || "phone");
  const [orbState, setOrbState] = useState<OrbState>("dialing");
  const [level, setLevel] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<"vaani" | "person" | null>(
    null
  );
  const [transcript, setTranscript] = useState<TurnEvent[]>([]);
  const [currentTurn, setCurrentTurn] = useState<TurnEvent | null>(null);
  const [memoryTriggered, setMemoryTriggered] = useState<string | null>(null);
  const [summary, setSummary] = useState<CallSummary | null>(
    initialCall?.summary || null
  );
  const [moodNote, setMoodNote] = useState<string | null>(
    initialCall?.mood_note || null
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(
    initialCall?.duration_seconds || 0
  );
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackToast, setFallbackToast] = useState<string | null>(null);
  const [isEndingOrWriting, setIsEndingOrWriting] = useState(false);
  const [needsSummary, setNeedsSummary] = useState<boolean>(
    Boolean(initialCall?.needs_summary)
  );

  const fallbackTriggeredRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationSecondsRef = useRef<number>(initialCall?.duration_seconds || 0);
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    durationSecondsRef.current = durationSeconds;
  }, [durationSeconds]);

  // Derive Orb State from status and audio level
  useEffect(() => {
    if (status === "connecting" || status === "ringing") {
      setOrbState("dialing");
    } else if (status === "ending") {
      setOrbState("ending");
    } else if (status === "completed") {
      setOrbState("idle");
    } else if (status === "live") {
      if (activeSpeaker === "vaani" && level > 0.12) {
        setOrbState("speaking");
      } else if (activeSpeaker === "person" && level > 0.12) {
        setOrbState("listening");
      } else {
        setOrbState("idle");
      }
    }
  }, [status, activeSpeaker, level]);

  // Duration counter during live call
  useEffect(() => {
    if (status === "live") {
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((d) => d + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status]);

  // Trigger browser fallback via POST /api/calls/[id]/use-browser
  const triggerBrowserFallback = useCallback(async () => {
    if (fallbackTriggeredRef.current) return;
    fallbackTriggeredRef.current = true;

    setFallbackToast(
      "We couldn't reach the phone. Taking the call here in your browser."
    );
    setPhoneOpen(true);
    setStatus("ringing");
    setChannel("browser");

    try {
      await fetch(`/api/calls/${callId}/use-browser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("Error requesting browser fallback:", err);
    }
  }, [callId]);

  // Realtime Supabase subscriptions
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Clean up any existing channels
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current = [];

    const fetchCallAndInit = async () => {
      try {
        let currentCall = initialCall;
        if (!currentCall && callId) {
          const { data, error } = await supabase
            .from("calls")
            .select("*, people(*)")
            .eq("id", callId)
            .single();

          if (error) throw error;
          currentCall = data;
          if (isMounted) setCallData(data);
        }

        if (currentCall) {
          setStatus(currentCall.status);
          if (currentCall.channel) setChannel(currentCall.channel);
          if (currentCall.summary) setSummary(currentCall.summary);
          if (currentCall.mood_note) setMoodNote(currentCall.mood_note);
          if (currentCall.duration_seconds) {
            setDurationSeconds(currentCall.duration_seconds);
          }

          // If fallback is already available on initial load
          if (
            currentCall.fallback_available ||
            currentCall.status === "ringing_failed" ||
            currentCall.status === "failed" ||
            currentCall.status === "no_answer" ||
            currentCall.status === "declined"
          ) {
            triggerBrowserFallback();
          }

          // 1. Fetch existing call events
          const { data: events } = await supabase
            .from("call_events")
            .select("*")
            .eq("call_id", callId)
            .order("created_at", { ascending: true });

          if (events && isMounted) {
            setTranscript(
              events.map((e) => ({
                id: e.id.toString(),
                speaker: e.speaker,
                text: e.text,
                at_ms: e.at_ms || 0,
                kind: e.kind || "turn",
              }))
            );
          }

          // 2. Realtime subscription to `calls` table
          const callChannel = supabase
            .channel(`call_status_${callId}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "calls",
                filter: `id=eq.${callId}`,
              },
              (payload) => {
                if (!isMounted) return;
                const updated = payload.new as any;
                if (updated.status) setStatus(updated.status);
                if (updated.channel) setChannel(updated.channel);
                if (updated.summary) setSummary(updated.summary);
                if (updated.mood_note) setMoodNote(updated.mood_note);
                if (updated.duration_seconds) {
                  setDurationSeconds(updated.duration_seconds);
                }

                // Check for fallback availability
                if (
                  updated.fallback_available ||
                  updated.status === "ringing_failed" ||
                  updated.status === "failed" ||
                  updated.status === "no_answer" ||
                  updated.status === "declined"
                ) {
                  triggerBrowserFallback();
                }

                if (updated.needs_summary !== undefined) {
                  setNeedsSummary(Boolean(updated.needs_summary));
                }
                setCallData((prev: any) => ({ ...prev, ...updated }));

                // Auto-close companion phone when real call ends
                if (
                  updated.status === "completed" ||
                  updated.status === "ending"
                ) {
                  setPhoneOpen(false);
                }
              }
            )
            .subscribe();

          // 3. Realtime subscription to `call_events` inserts
          const eventsChannel = supabase
            .channel(`call_events_${callId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "call_events",
                filter: `call_id=eq.${callId}`,
              },
              (payload) => {
                if (!isMounted) return;
                const newEvent = payload.new as any;
                const turn: TurnEvent = {
                  id: newEvent.id.toString(),
                  speaker: newEvent.speaker,
                  text: newEvent.text,
                  at_ms: newEvent.at_ms || 0,
                  kind: newEvent.kind || "turn",
                };

                setCurrentTurn(turn);
                if (turn.kind === "turn") {
                  setTranscript((prev) => [...prev, turn]);
                  setActiveSpeaker(
                    turn.speaker === "system" ? null : turn.speaker
                  );
                  if (thinkingTimeoutRef.current) {
                    clearTimeout(thinkingTimeoutRef.current);
                  }
                  thinkingTimeoutRef.current = setTimeout(() => {
                    setOrbState("thinking");
                  }, 600);
                } else if (turn.kind === "memory_used") {
                  setMemoryTriggered(turn.text);
                  setTimeout(() => setMemoryTriggered(null), 6000);
                }
              }
            )
            .subscribe();

          // 4. Supabase Broadcast for ~10Hz speaker & amplitude level
          const broadcastChannel = supabase
            .channel(`call:${callId}`)
            .on("broadcast", { event: "amplitude" }, (payload: any) => {
              if (!isMounted) return;
              const { speaker, level: lvl } = payload.payload || {};
              if (typeof lvl === "number") setLevel(lvl);
              if (speaker) setActiveSpeaker(speaker);
            })
            .subscribe();

          channelsRef.current = [callChannel, eventsChannel, broadcastChannel];
        }
      } catch (err: unknown) {
        console.error("Call stream error:", err);
      }
    };

    fetchCallAndInit();

    return () => {
      isMounted = false;
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, triggerBrowserFallback]);

  // 3-second backup polling on calls table when ending, live, or completed without summary
  useEffect(() => {
    if (!callId) return;
    const shouldPoll =
      isEndingOrWriting ||
      status === "ending" ||
      status === "live" ||
      (status === "completed" && !summary);

    if (!shouldPoll) return;

    const supabase = createClient();
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("calls")
          .select("*, people(*)")
          .eq("id", callId)
          .single();

        if (data && !error) {
          setCallData(data);
          if (data.status) setStatus(data.status);
          if (data.channel) setChannel(data.channel);
          if (data.summary) setSummary(data.summary);
          if (data.mood_note) setMoodNote(data.mood_note);
          if (data.needs_summary !== undefined) {
            setNeedsSummary(Boolean(data.needs_summary));
          }
          if (data.duration_seconds) {
            setDurationSeconds(data.duration_seconds);
          }
          if (data.status === "completed") {
            setPhoneOpen(false);
          }
        }
      } catch (err) {
        console.warn("Call backup poll error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [callId, isEndingOrWriting, status, summary]);

  const refetchCall = useCallback(async () => {
    if (!callId) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("calls")
        .select("*, people(*)")
        .eq("id", callId)
        .single();

      if (data && !error) {
        setCallData(data);
        if (data.status) setStatus(data.status);
        if (data.channel) setChannel(data.channel);
        if (data.summary) setSummary(data.summary);
        if (data.mood_note) setMoodNote(data.mood_note);
        if (data.needs_summary !== undefined) {
          setNeedsSummary(Boolean(data.needs_summary));
        }
        if (data.duration_seconds) {
          setDurationSeconds(data.duration_seconds);
        }
      }
    } catch (err) {
      console.warn("Manual refetch call error:", err);
    }
  }, [callId]);

  const answerCall = useCallback(() => {
    setStatus("live");
  }, []);

  const endCall = useCallback(async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setStatus("ending");
    setIsEndingOrWriting(true);
    setPhoneOpen(false);

    try {
      const supabase = createClient();
      await supabase
        .from("calls")
        .update({
          status: "ending",
          ended_at: new Date().toISOString(),
          duration_seconds: durationSecondsRef.current || 1,
        })
        .eq("id", callId);
    } catch (err) {
      console.error("Error ending call:", err);
    }
  }, [callId]);

  const appendUserTurn = useCallback((text: string) => {
    if (!text.trim()) return;
    const newTurn: TurnEvent = {
      id: `user-${Date.now()}`,
      speaker: "person",
      text: text.trim(),
      at_ms: (durationSecondsRef.current || 1) * 1000,
      kind: "turn",
    };
    setCurrentTurn(newTurn);
    setTranscript((prev) => [...prev, newTurn]);
    setActiveSpeaker("person");
  }, []);

  return {
    callData,
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
    setIsEndingOrWriting,
    needsSummary,
    setNeedsSummary,
    refetchCall,
    answerCall,
    endCall,
    appendUserTurn,
  };
}
