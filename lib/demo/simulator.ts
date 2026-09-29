export interface TurnEvent {
  id: string;
  speaker: "vaani" | "person" | "system";
  text: string;
  at_ms: number;
  kind: "turn" | "memory_used" | "flag";
}

export interface CallSummary {
  what_happened: string;
  important_updates: string[];
  worth_remembering: string[];
  next_call: string[];
  mood_note: string;
  needs_attention: boolean;
}

export const DEMO_SUMMARY: CallSummary = {
  what_happened:
    "Maa is feeling well and in cheerful spirits. Her morning knee stiffness is improving with the doctor's ointment, and she confirmed she will take the Friday train for Meena's wedding.",
  important_updates: [
    "Knee stiffness is improving after doctor's ointment",
    "Taking the Friday train to attend Meena's wedding on the 14th",
    "Packing your favorite homemade ladoos",
  ],
  worth_remembering: [
    "New pillow resolved the sleeping trouble",
    "Traveling by train on Friday for Meena's wedding",
    "Prefers morning walks before it gets too warm",
  ],
  next_call: [
    "Ask how the Friday train journey went",
    "Follow up on Meena's wedding festivities and family gathering",
  ],
  mood_note:
    "She sounded cheerful, and she laughed twice. She'd love a real call this weekend.",
  needs_attention: false,
};

export const DEMO_TURNS: Omit<TurnEvent, "id">[] = [
  {
    speaker: "vaani",
    text: "Namaste Maa, this is Vaani. I'm an AI calling on Aarav's behalf. Is this an okay time for a quick hello?",
    at_ms: 6000,
    kind: "turn",
  },
  {
    speaker: "person",
    text: "Haan beta, bolo! Aarav is busy today? Everything is fine na?",
    at_ms: 12500,
    kind: "turn",
  },
  {
    speaker: "vaani",
    text: "Everything is wonderful! Aarav was just thinking of you and wanted to check in. How has your knee been feeling lately?",
    at_ms: 18000,
    kind: "turn",
  },
  {
    speaker: "person",
    text: "The knee is still a bit stiff in the mornings, but much better after the doctor's ointment. Walking is easier now.",
    at_ms: 24500,
    kind: "turn",
  },
  {
    speaker: "vaani",
    text: "I'm so glad the ointment is bringing relief. Aarav also wanted to know if you've finalized your travel for Meena's wedding on the 14th?",
    at_ms: 31000,
    kind: "turn",
  },
  {
    speaker: "person",
    text: "Yes, we booked the train tickets for Friday! Tell him I'm also preparing a box of his favorite ladoos to send.",
    at_ms: 37500,
    kind: "turn",
  },
  {
    speaker: "system",
    text: "Vaani remembered: trouble sleeping last week",
    at_ms: 41000,
    kind: "memory_used",
  },
  {
    speaker: "vaani",
    text: "Aarav remembered you had trouble sleeping last week. Is the new cervical pillow helping you get good rest?",
    at_ms: 43500,
    kind: "turn",
  },
  {
    speaker: "person",
    text: "Much better beta! Sleeping deeply through the night now. Tell him not to worry so much about me.",
    at_ms: 50000,
    kind: "turn",
  },
  {
    speaker: "vaani",
    text: "He also left a warm message for you: 'Take care of your health Maa, and I will call you this Sunday evening.' Take care, Maa!",
    at_ms: 56000,
    kind: "turn",
  },
  {
    speaker: "person",
    text: "Give him lots of love and my blessings. Namaste beta.",
    at_ms: 62000,
    kind: "turn",
  },
];

export type SimulatorStatus =
  | "connecting"
  | "ringing"
  | "live"
  | "ending"
  | "completed";

export interface SimulatorCallbacks {
  onStatusChange?: (status: SimulatorStatus) => void;
  onTurn?: (turn: TurnEvent) => void;
  onLevel?: (level: number, speaker: "vaani" | "person" | null) => void;
  onMemoryTrigger?: (note: string) => void;
  onSummaryReady?: (summary: CallSummary) => void;
}

export class DemoCallSimulator {
  private status: SimulatorStatus = "connecting";
  private callbacks: SimulatorCallbacks;
  private timeouts: NodeJS.Timeout[] = [];
  private levelInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private isDestroyed: boolean = false;

  constructor(callbacks: SimulatorCallbacks) {
    this.callbacks = callbacks;
  }

  public start() {
    this.status = "connecting";
    this.callbacks.onStatusChange?.("connecting");
    this.startTime = Date.now();

    // 1. Transition to ringing at 2.2s
    this.schedule(() => {
      this.status = "ringing";
      this.callbacks.onStatusChange?.("ringing");
    }, 2200);

    // 2. Transition to live at 6.0s
    this.schedule(() => {
      this.status = "live";
      this.callbacks.onStatusChange?.("live");
      this.startLevelLoop();
    }, 6000);

    // 3. Play through turns
    DEMO_TURNS.forEach((turn, idx) => {
      this.schedule(() => {
        const turnEvent: TurnEvent = {
          id: `demo-turn-${idx}-${Date.now()}`,
          speaker: turn.speaker,
          text: turn.text,
          at_ms: turn.at_ms,
          kind: turn.kind,
        };

        if (turn.kind === "memory_used") {
          this.callbacks.onMemoryTrigger?.(turn.text);
        }

        this.callbacks.onTurn?.(turnEvent);
      }, turn.at_ms);
    });

    // 4. Ending at 64.0s
    this.schedule(() => {
      this.status = "ending";
      this.callbacks.onStatusChange?.("ending");
    }, 64000);

    // 5. Summary ready at 66.5s
    this.schedule(() => {
      this.status = "completed";
      this.stopLevelLoop();
      this.callbacks.onStatusChange?.("completed");
      this.callbacks.onSummaryReady?.(DEMO_SUMMARY);
    }, 66500);
  }

  public answerNow() {
    // If ringing or connecting, jump straight to live
    if (this.status === "connecting" || this.status === "ringing") {
      this.clearAll();
      this.status = "live";
      this.callbacks.onStatusChange?.("live");
      this.startLevelLoop();

      // Schedule remaining turns starting from turn 0
      let offset = 400;
      DEMO_TURNS.forEach((turn, idx) => {
        const delay = offset;
        offset += Math.max(3800, turn.text.length * 60);

        this.schedule(() => {
          const turnEvent: TurnEvent = {
            id: `demo-turn-${idx}-${Date.now()}`,
            speaker: turn.speaker,
            text: turn.text,
            at_ms: delay,
            kind: turn.kind,
          };
          if (turn.kind === "memory_used") {
            this.callbacks.onMemoryTrigger?.(turn.text);
          }
          this.callbacks.onTurn?.(turnEvent);
        }, delay);
      });

      this.schedule(() => {
        this.status = "ending";
        this.callbacks.onStatusChange?.("ending");
      }, offset + 1200);

      this.schedule(() => {
        this.status = "completed";
        this.stopLevelLoop();
        this.callbacks.onStatusChange?.("completed");
        this.callbacks.onSummaryReady?.(DEMO_SUMMARY);
      }, offset + 3500);
    }
  }

  public endNow() {
    this.clearAll();
    this.status = "ending";
    this.callbacks.onStatusChange?.("ending");

    this.schedule(() => {
      this.status = "completed";
      this.stopLevelLoop();
      this.callbacks.onStatusChange?.("completed");
      this.callbacks.onSummaryReady?.(DEMO_SUMMARY);
    }, 1800);
  }

  private startLevelLoop() {
    if (this.levelInterval) clearInterval(this.levelInterval);
    let phase = 0;

    this.levelInterval = setInterval(() => {
      if (this.isDestroyed || this.status !== "live") return;
      phase += 0.25;
      // Synthesize realistic speech amplitude modulations
      const base = 0.25 + 0.35 * Math.sin(phase) + 0.15 * Math.sin(phase * 2.3);
      const level = Math.max(0, Math.min(1, base));
      this.callbacks.onLevel?.(level, level > 0.3 ? "vaani" : null);
    }, 120);
  }

  private stopLevelLoop() {
    if (this.levelInterval) {
      clearInterval(this.levelInterval);
      this.levelInterval = null;
    }
    this.callbacks.onLevel?.(0, null);
  }

  private schedule(fn: () => void, delayMs: number) {
    if (this.isDestroyed) return;
    const t = setTimeout(() => {
      if (!this.isDestroyed) fn();
    }, delayMs);
    this.timeouts.push(t);
  }

  private clearAll() {
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];
  }

  public destroy() {
    this.isDestroyed = true;
    this.clearAll();
    this.stopLevelLoop();
  }
}
