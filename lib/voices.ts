export interface VoiceOption {
  id: string;
  displayName: string;
  gender: "female" | "male";
  accent: string;
  description: string;
}

/**
 * Static catalog of supported voices.
 * Default selection is the first female voice ("claire").
 */
export const VOICES: VoiceOption[] = [
  // --- Female Voices ---
  {
    id: "claire",
    displayName: "Claire",
    gender: "female",
    accent: "US English",
    description: "Calm and clear conversational tone",
  },
  {
    id: "ivy",
    displayName: "Ivy",
    gender: "female",
    accent: "US English",
    description: "Bright and friendly conversational tone",
  },
  {
    id: "dawn",
    displayName: "Dawn",
    gender: "female",
    accent: "US English",
    description: "Soft and unhurried conversational tone",
  },
  {
    id: "alba",
    displayName: "Alba",
    gender: "female",
    accent: "US English",
    description: "Warm, natural, and gentle everyday conversational tone",
  },
  {
    id: "anna",
    displayName: "Anna",
    gender: "female",
    accent: "US English",
    description: "Clear, friendly, and articulate professional voice",
  },
  {
    id: "eve",
    displayName: "Eve",
    gender: "female",
    accent: "US English",
    description: "Soft, expressive, and empathetic conversational voice",
  },
  {
    id: "jane",
    displayName: "Jane",
    gender: "female",
    accent: "US English",
    description: "Approachable, cheerful, and relaxed conversational tone",
  },
  {
    id: "mary",
    displayName: "Mary",
    gender: "female",
    accent: "US English",
    description: "Caring, soothing, and warm conversational voice",
  },
  {
    id: "sophie",
    displayName: "Sophie",
    gender: "female",
    accent: "UK English",
    description: "Polite, crisp British English female voice",
  },
  {
    id: "vera",
    displayName: "Vera",
    gender: "female",
    accent: "UK English",
    description: "Warm, distinct British English female voice with natural cadence",
  },
  {
    id: "lola",
    displayName: "Lola",
    gender: "female",
    accent: "Spanish",
    description: "Spanish native-accent female voice with natural English code-switching",
  },
  {
    id: "estelle",
    displayName: "Estelle",
    gender: "female",
    accent: "French",
    description: "French native-accent female voice with natural English code-switching",
  },

  // --- Male Voices ---
  {
    id: "george",
    displayName: "George",
    gender: "male",
    accent: "US English",
    description: "Deep, calm, and resonant US English male voice",
  },
  {
    id: "charles",
    displayName: "Charles",
    gender: "male",
    accent: "US English",
    description: "Confident, warm, and natural conversational voice",
  },
  {
    id: "michael",
    displayName: "Michael",
    gender: "male",
    accent: "US English",
    description: "Relaxed, friendly, and grounded male voice",
  },
  {
    id: "james",
    displayName: "James",
    gender: "male",
    accent: "US English",
    description: "Engaging, conversational US English male voice",
  },
  {
    id: "jean",
    displayName: "Jean",
    gender: "male",
    accent: "US English",
    description: "Thoughtful and expressive conversational voice",
  },
  {
    id: "paul",
    displayName: "Paul",
    gender: "male",
    accent: "UK English",
    description: "Polished and natural British English male voice",
  },
  {
    id: "arjun",
    displayName: "Arjun",
    gender: "male",
    accent: "Hindi / Indian English",
    description: "Warm Indian English male voice with natural Hindi code-switching",
  },
  {
    id: "giovanni",
    displayName: "Giovanni",
    gender: "male",
    accent: "Italian",
    description: "Italian native-accent male voice with natural English code-switching",
  },
  {
    id: "diego",
    displayName: "Diego",
    gender: "male",
    accent: "Latin American Spanish",
    description: "Latin American Spanish male voice with natural English code-switching",
  },
  {
    id: "juergen",
    displayName: "Juergen",
    gender: "male",
    accent: "German",
    description: "German native-accent male voice with natural English code-switching",
  },
  {
    id: "rafael",
    displayName: "Rafael",
    gender: "male",
    accent: "Portuguese",
    description: "Portuguese native-accent male voice with natural English code-switching",
  },
];

export const DEFAULT_FEMALE_VOICE: VoiceOption =
  VOICES.find((v) => v.gender === "female") || VOICES[0];

export function getVoiceById(id?: string | null): VoiceOption {
  if (!id) return DEFAULT_FEMALE_VOICE;
  const normalized = id.toLowerCase().trim();
  const found = VOICES.find(
    (v) =>
      v.id.toLowerCase() === normalized ||
      v.displayName.toLowerCase() === normalized
  );
  return found || DEFAULT_FEMALE_VOICE;
}
