// Web Audio and Speech Synthesis helper for the browser phone simulator

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// DTMF Frequencies
const DTMF_FREQS: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
};

/**
 * Play a standard DTMF keypad tone for 120ms
 */
export function playDtmfTone(key: string) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = DTMF_FREQS[key];
  if (!freqs) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.setValueAtTime(freqs[0], ctx.currentTime);
  osc2.frequency.setValueAtTime(freqs[1], ctx.currentTime);

  gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.15);
}

/**
 * Play a soft gentle ringtone loop for incoming calls. Returns a cleanup function.
 */
export function playRingtone(): () => void {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  let isPlaying = true;
  let timerId: NodeJS.Timeout | null = null;

  // Marimba-like chime notes (E5, G#5, B5, E6)
  const notes = [659.25, 830.61, 987.77, 1318.51];

  const playChimeSequence = () => {
    if (!isPlaying || !ctx) return;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);

      const startTime = ctx.currentTime + idx * 0.18;
      gain.gain.setValueAtTime(0.06, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });

    if (isPlaying) {
      timerId = setTimeout(playChimeSequence, 2400);
    }
  };

  playChimeSequence();

  return () => {
    isPlaying = false;
    if (timerId) clearTimeout(timerId);
  };
}

/**
 * Play a soft click/pickup sound
 */
export function playPickupSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

/**
 * Play a short hangup tone
 */
export function playHangupSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(425, ctx.currentTime);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

/**
 * Speak text using browser SpeechSynthesis if supported
 */
export function speakSpeech(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Google") ||
            v.name.includes("Karen") ||
            v.name.includes("Serena"))
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
    onEnd?.();
  }
}

/**
 * Stop any current speech
 */
export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export interface MicrophoneSession {
  stream: MediaStream;
  stop: () => void;
  setMuted: (muted: boolean) => void;
}

/**
 * Requests microphone permission and streams real-time audio amplitude
 */
export async function requestMicrophone(
  onLevel?: (level: number) => void
): Promise<MicrophoneSession | null> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const ctx = getAudioContext();
    let animId: number | null = null;

    if (ctx) {
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(1, Math.max(0, avg / 110));
        onLevel?.(normalized);
        animId = requestAnimationFrame(checkLevel);
      };

      if (onLevel) {
        animId = requestAnimationFrame(checkLevel);
      }
    }

    return {
      stream,
      setMuted: (muted: boolean) => {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !muted;
        });
      },
      stop: () => {
        if (animId) cancelAnimationFrame(animId);
        stream.getTracks().forEach((track) => track.stop());
      },
    };
  } catch (err) {
    console.warn("Could not access microphone:", err);
    return null;
  }
}

/**
 * Starts continuous browser speech recognition if supported
 */
export function startSpeechRecognition(
  onTranscript: (spokenText: string) => void
): (() => void) | null {
  if (typeof window === "undefined") return null;

  const SpeechRec =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRec) return null;

  try {
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0]?.transcript?.trim();
      if (text) {
        onTranscript(text);
      }
    };

    recognition.onerror = (err: any) => {
      console.warn("Browser speech recognition error:", err);
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  } catch (err) {
    console.warn("Speech recognition not supported or initialization failed:", err);
    return null;
  }
}
