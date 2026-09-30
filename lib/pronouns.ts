export type PronounType = "she" | "he" | "they";

export interface PronounSet {
  type: PronounType;
  label: string; // "She" | "He" | "They"
  subject: string; // "she" | "he" | "they"
  object: string; // "her" | "him" | "them"
  possessive: string; // "her" | "his" | "their"
  subjectCapitalized: string; // "She" | "He" | "They"
  possessiveCapitalized: string; // "Her" | "His" | "Their"
  isAre: string; // "is" | "is" | "are"
  hasHave: string; // "has" | "has" | "have"
  doesDo: string; // "does" | "does" | "do"
  contractionIs: string; // "she's" | "he's" | "they're"
}

export const PRONOUN_SETS: Record<PronounType, PronounSet> = {
  she: {
    type: "she",
    label: "She",
    subject: "she",
    object: "her",
    possessive: "her",
    subjectCapitalized: "She",
    possessiveCapitalized: "Her",
    isAre: "is",
    hasHave: "has",
    doesDo: "does",
    contractionIs: "she's",
  },
  he: {
    type: "he",
    label: "He",
    subject: "he",
    object: "him",
    possessive: "his",
    subjectCapitalized: "He",
    possessiveCapitalized: "His",
    isAre: "is",
    hasHave: "has",
    doesDo: "does",
    contractionIs: "he's",
  },
  they: {
    type: "they",
    label: "They",
    subject: "they",
    object: "them",
    possessive: "their",
    subjectCapitalized: "They",
    possessiveCapitalized: "Their",
    isAre: "are",
    hasHave: "have",
    doesDo: "do",
    contractionIs: "they're",
  },
};

export function getPronouns(p?: string | null): PronounSet {
  if (!p) return PRONOUN_SETS.they;
  const normalized = p.toLowerCase().trim() as PronounType;
  return PRONOUN_SETS[normalized] || PRONOUN_SETS.they;
}

export function inferPronounsFromRelationship(rel?: string | null): PronounType {
  if (!rel) return "they";
  const r = rel.toLowerCase().trim();
  if (
    r.includes("mom") ||
    r.includes("mother") ||
    r.includes("grandmother") ||
    r.includes("grandma") ||
    r.includes("dadi") ||
    r.includes("nani") ||
    r.includes("sister") ||
    r.includes("daughter") ||
    r.includes("wife") ||
    r.includes("aunt")
  ) {
    return "she";
  }
  if (
    r.includes("dad") ||
    r.includes("father") ||
    r.includes("grandfather") ||
    r.includes("grandpa") ||
    r.includes("dada") ||
    r.includes("nana") ||
    r.includes("brother") ||
    r.includes("son") ||
    r.includes("husband") ||
    r.includes("uncle")
  ) {
    return "he";
  }
  return "they";
}

export function getQuestionsPlaceholder(p?: string | null): string {
  const pr = getPronouns(p);
  return `Ask how ${pr.possessive} knee is doing. Find out if ${pr.contractionIs} going to Meena's wedding. Tell ${pr.object} I'll visit in March.`;
}

export function getPersonalMessagePlaceholder(p?: string | null): string {
  const pr = getPronouns(p);
  return `Something you'd like ${pr.object} to hear, in your own words.`;
}

export function getSuggestions(p?: string | null): string[] {
  const pr = getPronouns(p);
  return [
    `How ${pr.hasHave} ${pr.subject} been feeling?`,
    `How was ${pr.possessive} week?`,
    `Follow up on last time`,
    `${pr.doesDo === "do" ? "Do" : "Does"} ${pr.subject} need any help?`,
    `Ask about ${pr.possessive} plans.`,
  ];
}
