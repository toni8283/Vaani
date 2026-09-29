export type IllustrationName =
  | "hero-phone"
  | "hero-chai"
  | "hero-plant"
  | "hero-note"
  | "problem-desk"
  | "step-1-contact"
  | "step-2-note"
  | "step-3-envelope"
  | "demo-sofa"
  | "cta-phones"
  | "empty-people";

export type AudioName = "sample" | "claire" | "ivy" | "dawn";

export const illustrations: Record<IllustrationName, boolean> = {
  "hero-phone": false,
  "hero-chai": false,
  "hero-plant": false,
  "hero-note": false,
  "problem-desk": false,
  "step-1-contact": false,
  "step-2-note": false,
  "step-3-envelope": false,
  "demo-sofa": false,
  "cta-phones": false,
  "empty-people": false
};

export const audio: Record<AudioName, boolean> = {
  "sample": false,
  "claire": false,
  "ivy": false,
  "dawn": false
};
