"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAudioContext,
  resampleTo24kPcm16,
  pcm16ToBase64,
  base64Pcm16ToFloat32,
} from "@/lib/audio";

export interface UseBrowserCallReturn {
  connected: boolean;
  muted: boolean;
  isConnecting: boolean;
  micDenied: boolean;
  errorMessage: string | null;
  level: number;
  agentLevel: number;
  start: () => Promise<boolean>;
  end: () => void;
  setMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
  retryMic: () => Promise<boolean>;
}

export interface UseBrowserCallOptions {
  onCallEnded?: () => void;
}

export function useBrowserCall(
  callId: string,
  options?: UseBrowserCallOptions
): UseBrowserCallReturn {
  const [connected, setConnected] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [agentLevel, setAgentLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const onCallEndedRef = useRef(options?.onCallEnded);
  useEffect(() => {
    onCallEndedRef.current = options?.onCallEnded;
  }, [options?.onCallEnded]);

  const setMuted = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setMutedState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      mutedRef.current = next;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  const stopActiveAudioPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    activeSourcesRef.current = [];
    const ctx = getAudioContext();
    if (ctx) {
      nextPlayTimeRef.current = ctx.currentTime;
    }
    setAgentLevel(0);
  }, []);

  const end = useCallback(() => {
    // 1. Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "User ended call");
      } catch {}
      wsRef.current = null;
    }

    // 2. Stop audio processor and mic tracks
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // 3. Stop speaker playback
    stopActiveAudioPlayback();

    setConnected(false);
    setIsConnecting(false);
    setLevel(0);
    setAgentLevel(0);
  }, [stopActiveAudioPlayback]);

  const start = useCallback(async (): Promise<boolean> => {
    if (!callId) return false;
    if (connected || isConnecting) return true;

    setIsConnecting(true);
    setErrorMessage(null);
    setMicDenied(false);

    // 1. Get Supabase session token
    let token = "";
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token || "";
    } catch (err) {
      console.warn("Could not get supabase session for browser call:", err);
    }

    // 2. Acquire microphone with echo cancellation and noise suppression
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
    } catch (err: unknown) {
      console.warn("Microphone access denied or unavailable:", err);
      setIsConnecting(false);
      setMicDenied(true);
      setErrorMessage(
        "Vaani needs your microphone to talk. Allow it in your browser's address bar and try again."
      );
      return false;
    }

    // 3. Prepare Web Audio context and input processor
    const audioCtx = getAudioContext();
    if (!audioCtx) {
      setIsConnecting(false);
      setErrorMessage("Audio system is not supported in this browser.");
      return false;
    }

    if (audioCtx.state === "suspended") {
      await audioCtx.resume().catch(() => {});
    }

    // 4. Resolve WebSocket URL
    let wsHost =
      process.env.NEXT_PUBLIC_CALL_SERVER_WS_URL || "ws://localhost:8080";
    if (wsHost.startsWith("http://")) {
      wsHost = wsHost.replace("http://", "ws://");
    } else if (wsHost.startsWith("https://")) {
      wsHost = wsHost.replace("https://", "wss://");
    } else if (!wsHost.startsWith("ws://") && !wsHost.startsWith("wss://")) {
      wsHost = `ws://${wsHost}`;
    }

    const wsUrl = `${wsHost}/browser-stream?callId=${encodeURIComponent(
      callId
    )}&token=${encodeURIComponent(token)}`;

    // 5. Connect WebSocket
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setIsConnecting(false);

        // Wire microphone audio processor to stream PCM16 chunks
        try {
          const source = audioCtx.createMediaStreamSource(stream);
          sourceNodeRef.current = source;

          // 2048 sample frames (~43ms at 48kHz, ~85ms at 24kHz)
          const processor = audioCtx.createScriptProcessor(2048, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (mutedRef.current || ws.readyState !== WebSocket.OPEN) {
              setLevel(0);
              return;
            }

            const inputData = e.inputBuffer.getChannelData(0);

            // Compute input level for UI waveform
            let sumSq = 0;
            for (let i = 0; i < inputData.length; i++) {
              sumSq += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sumSq / inputData.length);
            const normalizedLevel = Math.min(1, Math.max(0, rms * 5));
            setLevel(Math.round(normalizedLevel * 100) / 100);

            // Resample to 24kHz linear PCM 16-bit
            const pcm16 = resampleTo24kPcm16(inputData, audioCtx.sampleRate);
            const base64 = pcm16ToBase64(pcm16);

            if (base64 && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } catch (procErr) {
          console.error("Audio pipeline initialization error:", procErr);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Call ended by server/partner
          if (data.type === "call_ended") {
            onCallEndedRef.current?.();
            end();
            return;
          }

          // Barge-in: agent audio interrupted by user speech
          if (data.type === "clear") {
            stopActiveAudioPlayback();
            return;
          }

          // Inbound agent audio from server
          if (data.type === "reply.audio" && (data.data || data.audio)) {
            const rawAudio = data.data || data.audio;
            const float32 = base64Pcm16ToFloat32(rawAudio);
            if (float32.length === 0) return;

            // Calculate agent audio level for orb
            let sumSq = 0;
            for (let i = 0; i < float32.length; i++) {
              sumSq += float32[i] * float32[i];
            }
            const rms = Math.sqrt(sumSq / float32.length);
            setAgentLevel(Math.min(1, Math.max(0, rms * 4)));

            // Playback 24kHz audio buffer sequentially
            const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);

            const currentTime = audioCtx.currentTime;
            const startTime = Math.max(currentTime, nextPlayTimeRef.current);
            source.start(startTime);
            nextPlayTimeRef.current = startTime + audioBuffer.duration;

            activeSourcesRef.current.push(source);
            source.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter(
                (s) => s !== source
              );
              if (activeSourcesRef.current.length === 0) {
                setAgentLevel(0);
              }
            };
          }
        } catch (msgErr) {
          console.warn("Non-JSON message received over browser-stream:", msgErr);
        }
      };

      ws.onerror = (err) => {
        console.error("Browser-stream WebSocket error:", err);
        setErrorMessage(
          "That call didn't go through. Nothing was said, and nobody was bothered. Want to try again?"
        );
      };

      ws.onclose = (event) => {
        setConnected(false);
        setIsConnecting(false);
        stopActiveAudioPlayback();
        if (event.code === 4001) {
          setErrorMessage("Authentication failed. Please sign in again.");
        } else if (event.code === 4003) {
          setErrorMessage("You do not have permission to access this call.");
        } else if (event.code === 4009) {
          setErrorMessage("This call session is already active in another tab.");
        } else if (event.code !== 1000) {
          setErrorMessage(
            "That call didn't go through. Nothing was said, and nobody was bothered. Want to try again?"
          );
        }
      };

      return true;
    } catch (wsErr: unknown) {
      console.error("Failed to establish browser call WebSocket:", wsErr);
      setIsConnecting(false);
      setErrorMessage(
        "That call didn't go through. Nothing was said, and nobody was bothered. Want to try again?"
      );
      return false;
    }
  }, [callId, connected, isConnecting, stopActiveAudioPlayback, end]);

  const retryMic = useCallback(async () => {
    return await start();
  }, [start]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      end();
    };
  }, [end]);

  return {
    connected,
    muted,
    isConnecting,
    micDenied,
    errorMessage,
    level,
    agentLevel,
    start,
    end,
    setMuted,
    retryMic,
  };
}
