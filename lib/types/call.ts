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
  mood_note?: string;
  needs_attention?: boolean;
}

export type CallStatus =
  | "scheduled"
  | "connecting"
  | "ringing"
  | "live"
  | "ending"
  | "completed"
  | "failed"
  | "no_answer"
  | "declined"
  | "ringing_failed";
