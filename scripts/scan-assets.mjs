import fs from "fs";
import path from "path";

const illustrationsDir = path.join(process.cwd(), "public", "illustrations");
const audioDir = path.join(process.cwd(), "public", "audio");

const illustrationNames = [
  "hero-phone",
  "hero-chai",
  "hero-plant",
  "hero-note",
  "problem-desk",
  "step-1-contact",
  "step-2-note",
  "step-3-envelope",
  "demo-sofa",
  "cta-phones",
  "empty-people",
];

const audioNames = ["sample", "claire", "ivy", "dawn"];

const illustrationsStatus = {};
for (const name of illustrationNames) {
  const filePath = path.join(illustrationsDir, `${name}.svg`);
  illustrationsStatus[name] = fs.existsSync(filePath);
}

const audioStatus = {};
for (const name of audioNames) {
  // Support .mp3, .wav, .m4a, or exact name
  const exists =
    fs.existsSync(path.join(audioDir, `${name}.mp3`)) ||
    fs.existsSync(path.join(audioDir, `${name}.wav`)) ||
    fs.existsSync(path.join(audioDir, name));
  audioStatus[name] = exists;
}

const content = `export type IllustrationName =
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

export const illustrations: Record<IllustrationName, boolean> = ${JSON.stringify(
  illustrationsStatus,
  null,
  2
)};

export const audio: Record<AudioName, boolean> = ${JSON.stringify(
  audioStatus,
  null,
  2
)};
`;

fs.writeFileSync(path.join(process.cwd(), "lib", "assets.ts"), content, "utf-8");
console.log("Scanned assets and updated lib/assets.ts successfully.");
