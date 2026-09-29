"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DemoCallSimulator,
  DEMO_SUMMARY,
  type TurnEvent,
  type CallSummary,
} from "@/lib/demo/simulator";
import type { OrbState } from "@/components/call/vaani-orb";

interface UseCallStreamOptions {
  callId: string;
  initialCall?: any;
  forceDemo?: boolean;
}

export function useCallStream({
  callId,
  initialCall,
  forceDemo = false,
}: UseCallStreamOptions) {
  const [callData, setCallData] = useState<any>(initialCall || null);
  const [status, setStatus] = useState<
    "connecting" | "ringing" | "live" | "ending" | "completed" | "failed" | "no_answer"
  >(initialCall?.status || "connecting");
  const [orbState, setOrbState] = useState<OrbState>("dialing");
  const [level, setLevel] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<"vaani" | "person" | null>(null);
  const [transcript, setTranscript] = useState<TurnEvent[]>([]);
  const [currentTurn, setCurrentTurn] = useState<TurnEvent | null>(null);
  const [memoryTriggered, setMemoryTriggered] = useState<string | null>(null);
  const [summary, setSummary] = useState<CallSummary | null>(initialCall?.summary || null);
  const [moodNote, setMoodNote] = useState<string | null>(initialCall?.mood_note || null);
  const [durationSeconds, setDurationSeconds] = useState<number>(initialCall?.duration_seconds || 0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const simulatorRef = useRef<DemoCallSimulator | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive Orb State from status and level
  useEffect(() => {
    if (status === "connecting" || status === "ringing") {
      setOrbState("dialing");
    } else if (status === "ending") {
      setOrbState("ending");
    } else if (status === "completed") {
      setOrbState("idle");
    } else if (status === "live") {
      if (activeSpeaker === "vaani" && level > 0.15) {
        setOrbState("speaking");
      } else if (activeSpeaker === "person" && level > 0.15) {
        setOrbState("listening");
      } else {
        // Between turns
        setOrbState("idle");
      }
    }
  }, [status, activeSpeaker, level]);

  // Duration counter when live
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

  // Sync completed summary to Supabase
  const persistSummaryToDb = useCallback(
    async (completedSummary: CallSummary) => {
      if (!callId) return;
      try {
        const supabase = createClient();
        await supabase
          .from("calls")
          .update({
            status: "completed",
            summary: completedSummary,
            mood_note: completedSummary.mood_note,
            ended_at: new Date().toISOString(),
            duration_seconds: durationSeconds || 68,
          })
          .eq("id", callId);
      } catch (err) {
        console.error("Failed to persist summary:", err);
      }
    },
    [callId, durationSeconds]
  );

  // Start Demo Simulation
  const startDemoSimulation = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.destroy();
    }
    setIsSimulated(true);
    setTranscript([]);
    setCurrentTurn(null);
    setMemoryTriggered(null);
    setDurationSeconds(0);
    setErrorMessage(null);

    const sim = new DemoCallSimulator({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        if (newStatus === "ringing") {
          // Auto-prompt the phone simulator so judge can interact
          setPhoneOpen(true);
        }
      },
      onTurn: (turn) => {
        setCurrentTurn(turn);
        if (turn.kind === "turn") {
          setTranscript((prev) => [...prev, turn]);
          setActiveSpeaker(turn.speaker === "system" ? null : turn.speaker);
          // Set thinking between turns
          if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
          thinkingTimeoutRef.current = setTimeout(() => {
            setOrbState("thinking");
          }, 700);
        }
      },
      onLevel: (lvl, spk) => {
        setLevel(lvl);
        if (spk) setActiveSpeaker(spk);
      },
      onMemoryTrigger: (note) => {
        setMemoryTriggered(note);
        setTimeout(() => {
          setMemoryTriggered(null);
        }, 6500);
      },
      onSummaryReady: (sum) => {
        setSummary(sum);
        setMoodNote(sum.mood_note);
        persistSummaryToDb(sum);
      },
    });

    simulatorRef.current = sim;
    sim.start();
  }, [persistSummaryToDb]);

  // Initialize call stream
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

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

        const isDemoCall =
          forceDemo ||
          currentCall?.is_demo ||
          process.env.NEXT_PUBLIC_DEMO_MODE === "true";

        if (isDemoCall) {
          startDemoSimulation();
          return;
        }

        // Real Call Realtime Subscriptions
        if (currentCall) {
          setStatus(currentCall.status);
          if (currentCall.summary) setSummary(currentCall.summary);

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

          // 2. Realtime subscription to `calls` table changes
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
                if (updated.summary) setSummary(updated.summary);
                if (updated.mood_note) setMoodNote(updated.mood_note);
                if (updated.duration_seconds) setDurationSeconds(updated.duration_seconds);

                if (updated.status === "failed") {
                  setErrorMessage(
                    "Twilio call didn't go through (requires verified caller ID on trial). You can experience the full call right now in the Browser Phone Simulator!"
                  );
                  setPhoneOpen(true);
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
                  setActiveSpeaker(turn.speaker === "system" ? null : turn.speaker);
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

          return () => {
            supabase.removeChannel(callChannel);
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(broadcastChannel);
          };
        }
      } catch (err: unknown) {
        console.error("Call stream error:", err);
        // Fallback to simulation if network/auth fails
        if (isMounted) {
          startDemoSimulation();
        }
      }
    };

    fetchCallAndInit();

    return () => {
      isMounted = false;
      if (simulatorRef.current) {
        simulatorRef.current.destroy();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    };
  }, [callId, forceDemo, initialCall, startDemoSimulation]);

  const answerCall = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.answerNow();
    } else {
      setStatus("live");
    }
  }, []);

  const endCall = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.endNow();
    } else {
      setStatus("ending");
      // Update Supabase
      const supabase = createClient();
      supabase
        .from("calls")
        .update({ status: "ending", ended_at: new Date().toISOString() })
        .eq("id", callId)
        .then(() => {});
    }
  }, [callId]);

  return {
    callData,
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
    restartDemo: startDemoSimulation,
  };
}
