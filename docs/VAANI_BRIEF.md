# VAANI — Design & Build Brief
*Hand this whole file to Antigravity. Save it in the repo as `/docs/VAANI_BRIEF.md` and paste the prompt from Section 6 into the agent. Sections 1–5 are the source of truth for every token and every word of copy.*

---

## 0. STRATEGY — what wins (read first, 2 minutes)

Judges see dozens of "AI voice agent" demos. Most are call-center bots. Vaani wins if the room *feels* something. So the whole build is bent toward one 3-minute story:

**Upgrades over the original spec (all cheap, all high impact):**

1. **"Let Vaani call *you*" on the landing hero.** A judge types their own number and their phone rings in the room. Nothing beats this. (Guest mode makes it frictionless.)
2. **"A message from you."** In the wizard the user can write one thing they want the person to hear ("Tell her I'm proud of her"). Vaani delivers it warmly, in their words. It is the emotional core and costs one prompt line.
3. **The summary lands as an SMS on the judge's phone within seconds of hanging up**, while the dashboard reveal animates on screen. Two devices, one moment.
4. **Presence, not metrics.** No scores, no charts, no "health monitoring." Each person shows a warm line like *"Last spoke Tuesday · sounded cheerful."* This is the anti-CRM.
5. **Needs-your-attention flag.** If the person mentions a fall, pain, or feeling unwell, Vaani never gives medical advice; it stays kind, tells them it will let the user know, and the summary is flagged. Shows responsibility (judges love it).
6. **Continuity you can watch.** Seed one person (Maa) with a prior call where she mentioned poor sleep. The live call visibly says *"Vaani remembered: trouble sleeping last week"* as a chip above the transcript, and Vaani asks about it naturally.
7. **Demo-mode simulator.** A scripted fake call feeds the same UI (`NEXT_PUBLIC_DEMO_MODE=true`). If Wi-Fi, ngrok, or Twilio fails on stage, you switch and nobody knows.
8. **Ethics is part of the UI.** AI disclosure in the first sentence of every call, and a "they're happy to receive calls" confirmation in the wizard.

**Technical reality check (verified against AssemblyAI docs):**
- AssemblyAI's Voice Agent API bundles STT + LLM + TTS + turn detection + barge-in + tool calling behind one WebSocket. Phone audio is `audio/pcmu` (G.711 μ-law, 8 kHz), which is byte-compatible with Twilio Media Streams, so no transcoding. AssemblyAI publishes an official outbound-call example (Twilio ↔ Voice Agent API). **Start from their repo `AssemblyAI/voice-agent-api-twilio-example`** rather than writing the bridge from scratch.
- Voice names are lowercase and case-sensitive (e.g. `ivy`, `claire`, `dawn`). Check the docs for the current voice list and language support before promising languages in the UI.
- **Twilio trial accounts only call verified numbers and add a trial announcement.** Upgrade the account (about $20) before demo day, or verify every judge number in advance.
- Browser audio uses `audio/pcm` at 24 kHz (docs) — a possible fallback path "Talk to Vaani in your browser" if telephony breaks.
- Disclose AI on every call and honor opt-outs (TCPA / state AI-disclosure laws). It's also your brand.

**Priority order if time runs short (cut from the bottom):**
1. Real call works end-to-end + live transcript + summary reveal
2. Landing page + guest sign-in + wizard
3. Memory continuity chip + memory screen
4. Dashboard polish + presence lines
5. Scheduling / recurring calls (UI only, can be stubbed)
6. Settings depth

**24-hour plan:** H0–3 telephony bridge working from their example (ugly is fine) · H3–8 Supabase + design system + landing · H8–14 dashboard + wizard · H14–19 live call screen + orb + summary reveal · H19–22 seed data, demo mode, SMS · H22–24 rehearse demo 5x, record backup video.

**Demo script (3 min):** (1) 20s: the problem, one line. (2) Judge enters their number on the hero. (3) Phone rings, on-screen orb dials, transcript streams, Vaani says who it is and why. (4) Judge talks; orb listens/speaks. (5) Hang up; summary reveal; SMS buzzes. (6) Show Maa's memory: "Sleep improved" from the earlier call. (7) One sentence: "Presence, continuity, care."

---

## SECTION 1 — DESIGN SYSTEM

### 1.1 Color (light theme; ship this only)

| Token | Hex | Use |
|---|---|---|
| `cream` (background) | `#FAF6F0` | page background |
| `cream-50` (surface) | `#FFFCF8` | cards |
| `cream-100` (surface-2) | `#F4EDE3` | inset panels, inputs |
| `cream-200` (border) | `#E8DFD3` | borders |
| `cream-300` (divider) | `#EFE7DB` | dividers |
| `ink` (primary text) | `#2B211C` | text |
| `ink-soft` (secondary) | `#6F6259` | secondary text |
| `ink-faint` | `#9A8C81` | captions, placeholders |
| `terracotta` (accent / CTA) | `#C4622D` | primary buttons, links |
| `terracotta-hover` | `#AD5224` | hover / pressed |
| `terracotta-subtle` | `#F6E3D6` | tinted backgrounds, chips |
| `terracotta-deep` | `#8F3F17` | orb shadow, strong text on subtle |
| `amber-glow` | `#F2A65A` | orb glow, highlights |
| `amber-soft` | `#FBD9A8` | ambient gradients |
| `sage` (success) | `#5E8C61` | completed, saved |
| `honey` (warning) | `#D9A441` | ringing, needs a look |
| `rust` (error) | `#B5483A` | failed, destructive |

Rule: **no pure black, no pure white, no cool grays, no purple gradients.** Shadows are warm-tinted (`rgba(90, 45, 20, x)`).

### 1.2 `tailwind.config.ts` (copy exactly)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FAF6F0", 50: "#FFFCF8", 100: "#F4EDE3", 200: "#E8DFD3", 300: "#EFE7DB" },
        ink: { DEFAULT: "#2B211C", soft: "#6F6259", faint: "#9A8C81" },
        terracotta: { DEFAULT: "#C4622D", hover: "#AD5224", subtle: "#F6E3D6", deep: "#8F3F17" },
        amber: { glow: "#F2A65A", soft: "#FBD9A8" },
        sage: "#5E8C61",
        honey: "#D9A441",
        rust: "#B5483A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "500" }],
        "display-lg": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.025em", fontWeight: "500" }],
        h3: ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "500" }],
        h4: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "500" }],
        h5: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        h6: ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.25rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.65" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      borderRadius: { card: "1.5rem", input: "1rem" },
      maxWidth: { content: "1200px", prose: "640px" },
      boxShadow: {
        sm: "0 1px 2px rgba(90,45,20,0.06), 0 1px 1px rgba(90,45,20,0.04)",
        md: "0 6px 20px -6px rgba(90,45,20,0.12), 0 2px 6px rgba(90,45,20,0.05)",
        lg: "0 24px 60px -16px rgba(90,45,20,0.20), 0 8px 16px -8px rgba(90,45,20,0.08)",
        orb: "0 0 80px 10px rgba(242,166,90,0.45), 0 30px 60px -10px rgba(143,63,23,0.35)",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
        breathe: "cubic-bezier(0.45, 0, 0.55, 1)",
      },
      keyframes: {
        breathe: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.035)" } },
        ripple: { "0%": { transform: "scale(0.9)", opacity: "0.5" }, "100%": { transform: "scale(1.9)", opacity: "0" } },
        drift: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
      },
      animation: {
        breathe: "breathe 4s cubic-bezier(0.45,0,0.55,1) infinite",
        ripple: "ripple 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
        drift: "drift 14s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

### 1.3 Typography
- **Display: Fraunces** (Google Fonts, variable). Warm, slightly soft serif. Load with `next/font/google` using `axes: ["opsz","SOFT"]`, and set `font-variation-settings: "SOFT" 100` on display text for rounded terminals. Variable `--font-fraunces`.
- **Body: Instrument Sans** (Google Fonts). Friendly, precise, not Inter. Variable `--font-instrument`. Use `tabular-nums` for times and durations.

| Role | Desktop | Mobile | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| h1 / display-xl | 72px | 44px | 500 Fraunces | 1.02 | -0.03em |
| h2 / display-lg | 48px | 34px | 500 Fraunces | 1.08 | -0.025em |
| h3 | 32px | 26px | 500 Fraunces | 1.15 | -0.02em |
| h4 | 24px | 22px | 500 Fraunces | 1.25 | -0.01em |
| h5 | 20px | 18px | 600 Instrument | 1.35 | 0 |
| h6 (eyebrow: uppercase) | 13px | 13px | 600 Instrument | 1.4 | 0.08em |
| body-lg | 20px | 18px | 400 | 1.6 | 0 |
| body | 16px | 16px | 400 | 1.65 | 0 |
| small | 14px | 14px | 400 | 1.5 | 0 |
| caption | 12px | 12px | 500 | 1.4 | 0.02em |

Use responsive classes: `text-[44px] md:text-display-xl`. Italics in Fraunces for one emotional word per headline (e.g. *even when you can't*).

### 1.4 Spacing & layout
- Base unit **4px** (Tailwind default). 
- Section padding: `py-24 md:py-36` (marketing), `py-8 md:py-12` (app).
- Card: `p-6 md:p-8 rounded-card bg-cream-50 border border-cream-200 shadow-sm`.
- Max content width: `max-w-content mx-auto px-5 md:px-8`. Reading text: `max-w-prose`.
- Grid: 12 columns, `gap-6 md:gap-8`. App shell: fixed left sidebar `w-64` (desktop), bottom tab bar (mobile, 4 tabs: Home, People, Memory, Settings).

### 1.5 Motion
- Easings: **`ease-calm` = cubic-bezier(0.22,1,0.36,1)** (entrances, most things); **`ease-breathe` = cubic-bezier(0.45,0,0.55,1)** (orb, loops); springs via Framer: `{ type: "spring", stiffness: 180, damping: 18 }` for orb amplitude.
- Durations: hover **200ms**, press **120ms**, page transition **400ms** (fade + 12px rise), element entrance **700ms**, stagger **90ms**, orb breathing loop **4s**.
- Animates on scroll (once, `viewport={{ once: true, margin: "-80px" }}`): section headlines and body (fade + 16px rise), cards (stagger), How-it-works connector line (draws), transcript lines (typed in sequence). 
- Does NOT animate on scroll: nav (only the frosted background fades in after 24px scroll), footer, pricing card contents, FAQ answers (they use accordion height only).
- Hover: buttons lift `-translate-y-0.5` + shadow-md; cards lift `-translate-y-1` + shadow-md; links underline slides in; person avatar orb glows brighter.
- Respect `prefers-reduced-motion`: disable loops, keep fades.

### 1.6 Texture & depth
- **Grain overlay:** fixed, full-screen, `pointer-events-none z-[60]`, SVG `feTurbulence` (baseFrequency 0.8, 2 octaves), **opacity 0.035** over the page, **0.08 inside the orb** with `mix-blend-overlay`. Never over text-heavy app panels above 0.03.
- **Glass (nav, call overlay chips, toasts only):** `bg-cream-50/70 backdrop-blur-xl border border-white/60 shadow-md`. Nothing else is glass.
- Shadows: `shadow-sm` resting cards, `shadow-md` hover/popovers, `shadow-lg` modals & the summary reveal, `shadow-orb` orb only.
- Ambient gradient wash behind hero and call screen: `bg-[radial-gradient(ellipse_at_50%_30%,#FBD9A8_0%,rgba(250,246,240,0)_60%)]`.

---

## SECTION 2 — LANDING PAGE

### Navigation
- **Logo:** an 28px amber orb (radial gradient `#FFE3BD → #F2A65A → #C4622D`, soft glow, slow `animate-breathe`) next to wordmark **Vaani** in Fraunces 500, 24px, `text-ink`. 
- **Links (3):** How it works · Trust · Pricing (smooth scroll).
- **Buttons:** ghost **"Sign in"** (`text-ink-soft hover:text-ink`), primary **"Set up Vaani"** (`rounded-full bg-terracotta text-cream-50 px-5 h-10 hover:bg-terracotta-hover`).
- **Sticky:** `fixed top-0 inset-x-0 z-50`, transparent at top; after 24px scroll animates (300ms) to glass `bg-cream-50/70 backdrop-blur-xl border-b border-cream-200/70`. Mobile: logo + primary button + hamburger sheet.

### 1. Hero
- **Layout:** two columns `lg:grid-cols-12`; left 7 cols text, right 5 cols orb. Left-aligned. Mobile: orb above text, smaller.
- **Headline:** *Call home. Even when you can't.*
- **Body:** Vaani phones the people you love, has a real conversation, and tells you how they're doing — so a busy week never turns into a quiet month. Always honest about being an AI. Always on your behalf.
- **CTAs:** primary **"Set up Vaani"**; secondary text-button **"Hear a sample call"** (scrolls to Section 4). Beneath: a small pill input row **"Try it now: let Vaani call you"** with phone field + button **"Call me"** (this is the demo hook; uses guest auth).
- **Visual:** big `VaaniOrb` (idle, breathing) floating on the amber wash; three tiny floating glass chips drifting slowly around it: *"Hi Aunty, it's Vaani"*, *"How's the knee?"*, *"Sleep has improved"*.
- **Container:** `relative overflow-hidden pt-36 pb-24 md:pt-48 md:pb-36 bg-cream`
- **Animation:** headline words fade+rise 16px, 700ms, stagger 90ms; orb fades/scales 0.92→1 in 1.2s ease-calm; chips appear 1.2s later and float (y ±8px, 6–9s loops, offset).

### 2. The Problem (text-only)
- **Layout:** single centered column `max-w-prose`, huge whitespace, lines revealed one by one.
- **Headline:** *You meant to call on Sunday.*
- **Body (3 lines, each on its own line):** Then Monday happened. Then the whole week did. / Somewhere, someone is looking at their phone, hoping it lights up with your name. / You don't love them any less. You just ran out of hours.
- **CTA:** text link **"There's a gentler way →"** (scrolls to How It Works).
- **Visual:** none. A single 1px terracotta line (40px wide) between headline and body.
- **Container:** `py-40 md:py-64 bg-cream text-center`
- **Animation:** each line fades in (opacity only + 8px rise) as it crosses viewport center, 900ms, 400ms apart.

### 3. How It Works
- **Layout:** `grid md:grid-cols-3 gap-8`, connector line across the top on desktop that draws left→right on scroll. Each step is a card with a big Fraunces numeral, title, body, and a small illustration (line-art in terracotta on cream-100).
- **Headline:** *Three minutes to set up. Then Vaani just shows up.*
- **Steps:**
  1. **Tell Vaani who.** Add a name and a number. Choose a voice that feels right for them.
  2. **Tell Vaani what matters.** Write it the way you'd tell a friend: *"Ask about her knee. Say I'll visit in March."*
  3. **Get the story back.** A short, warm summary lands the moment they hang up, with what to remember and what to ask next.
- **CTA:** **"Set up Vaani"**
- **Visual:** step 1 = orb next to a phone-number pill; step 2 = a note with handwritten-style bullets; step 3 = a mini summary card.
- **Container:** `py-24 md:py-36 bg-cream-100`
- **Animation:** connector draws (1.2s); cards rise 24px with 150ms stagger.

### 4. Live Demo / Transcript
- **Layout:** `grid lg:grid-cols-2 gap-8`. Left: transcript card (chat lines with speaker labels, Vaani lines have a small orb dot). Right: summary card with four labeled blocks.
- **Headline:** *Hear how it sounds. Read how it went.*
- **Body:** A real-feeling five-minute chat with Maa, shrunk into the four things you actually need to know.
- **CTA:** **"Let Vaani call you"** (opens the demo-call modal).
- **Transcript (exact):**
  - **Vaani:** Namaste Aunty, this is Vaani. I'm an AI assistant calling on behalf of Aarav. He's stuck at work today and asked me to say hello. Is this an okay time?
  - **Maa:** Oh, Aarav's assistant! Yes, yes, tell me.
  - **Vaani:** He was wondering how you've been. Last time you mentioned trouble sleeping. How have the nights been?
  - **Maa:** Much better, actually. The new pillow helped. But my knee is acting up again.
  - **Vaani:** I'm sorry to hear that. Is it stopping you from your evening walks?
  - **Maa:** A little. Meena's wedding is on the 14th, I hope I can dance!
  - **Vaani:** Aarav also wanted you to hear this: *he's proud of you, and he'll call this weekend.*
  - **Maa:** Tell him I said eat properly. *(laughs)*
- **Summary card:** **What happened** — A warm ten-minute chat. Maa sounded cheerful and in good spirits. · **Important updates** — Sleep has improved. Her knee is bothering her again. · **Things worth remembering** — Meena's wedding is on the 14th. Loves her evening walks. Worries you don't eat properly. · **For your next call** — Ask how the knee is. Ask how the wedding went.
- **Container:** `py-24 md:py-36 bg-cream`
- **Animation:** transcript lines type in sequentially on scroll-in (600ms apart, with a tiny orb pulse on Vaani lines); after the last line, summary card fades up 24px and its four blocks stagger 120ms.

### 5. Trust & Transparency
- **Layout:** centered heading, then `grid md:grid-cols-3 gap-8`; each item: 48px icon in a terracotta-subtle circle, title, 2 lines. Icons (lucide): `BadgeCheck`, `SlidersHorizontal`, `BookHeart`.
- **Headline:** *Warm, but never sneaky.*
- **Points:**
  1. **Honest from the first sentence.** Vaani always says it's an AI calling on your behalf. It never pretends to be you.
  2. **You decide everything.** Who it calls, what it talks about, and when. Say "not today" and it doesn't call.
  3. **Memory you can see.** Everything Vaani remembers is written in plain words. Edit it, delete it, or turn it off.
- **CTA:** **"Read how we protect your family"** (anchors to FAQ)
- **Container:** `py-24 md:py-36 bg-cream-100`
- **Animation:** icons scale 0.8→1 with fade, 500ms, 120ms stagger.

### 6. Pricing
- **Layout:** two cards centered, `max-w-3xl grid md:grid-cols-2 gap-6`. Second card has a `terracotta-subtle` ring and a "Most loved" pill.
- **Headline:** *Less than a coffee a week. More than a coffee's worth of calm.*
- **Body:** Start free. Upgrade when Vaani becomes part of your week.
- **Card 1 — Starter, $0:** 2 calls a month · 1 loved one · Call summaries · Memory. CTA **"Start for free"**
- **Card 2 — Family, $9/month:** Unlimited calls · Up to 5 loved ones · Weekly scheduled calls · SMS summaries · Priority voices. CTA **"Set up Vaani"**
- **Container:** `py-24 md:py-36 bg-cream`
- **Animation:** none on scroll for contents; cards fade in together, hover lift only.

### 7. FAQ (accordion, `max-w-prose`, one open at a time)
- **Headline:** *Good questions.*
1. **Will my mom know it's an AI?** Yes. Vaani says so in its very first sentence: it's an AI calling on your behalf. It never pretends to be you or a person.
2. **Isn't this replacing me?** No. Vaani is a bridge for the weeks you can't call yourself. It even nudges you: *"She'd love a real call this weekend."*
3. **What if she doesn't want to talk?** Vaani asks if it's a good time. If not, it says goodbye kindly and offers to try later. If someone asks it to stop calling, it stops.
4. **Is the call recorded? Who sees it?** Only you see summaries and transcripts. You choose whether Vaani keeps memories, and you can delete any of it, anytime.
5. **What languages does Vaani speak?** English today. Hindi and more are on the way.
- **Container:** `py-24 md:py-36 bg-cream-100`; items `border-b border-cream-200 py-5`; chevron rotates 180° in 250ms; answer height animates 300ms ease-calm.

### 8. Final CTA
- **Layout:** full-bleed section, centered, giant calm orb behind text at 40% opacity, blurred.
- **Headline:** *Who's been on your mind?*
- **Body:** Add them in three minutes. Vaani will take it from there.
- **CTA:** **"Set up Vaani"** (large: `h-14 px-8 text-lg`) and quiet link **"Continue as guest"**
- **Container:** `relative overflow-hidden py-32 md:py-48 bg-[radial-gradient(ellipse_at_50%_50%,#FBD9A8_0%,#FAF6F0_70%)]`
- **Animation:** orb breathes slowly (6s); headline fades in once. Footer: logo, "Made with care for hackathon: lablab.ai × AssemblyAI", links Privacy · Terms.

---

## SECTION 3 — DASHBOARD

**App shell:** `min-h-screen bg-cream`; sidebar (desktop) with logo, nav items **Home, People, Memory, Settings**, and at the bottom the user chip + guest banner *"You're a guest. Save your people →"*. Main: `md:pl-64`, content `max-w-content mx-auto px-5 md:px-8 py-8 md:py-12`. Primary button top-right on most screens: **"New call"**.

### 3.1 Home
- **Layout:** header row; below `grid lg:grid-cols-12 gap-8`: left 8 cols = "Your people" grid (`grid sm:grid-cols-2 gap-5`) then "Fresh from your calls"; right 4 cols = "Coming up" + "Worth remembering" card.
- **Text:** H1 **"Good evening, Aarav."** (time-aware; morning/afternoon/evening). Sub **"Here's who you've been thinking about."** Sections: **"Your people"**, **"Coming up"**, **"Fresh from your calls"**, **"Worth remembering this week"**. Add-person tile: **"+ Add someone"**.
- **Person card:** avatar orb (tinted per person) + name (Fraunces h4) + relationship caption; **presence line** e.g. *"Last spoke Tuesday · sounded cheerful"*; a small dot: sage (recent), honey (a while), cream-200 (never); buttons **"Call now"** (primary small) and **"Details"**. If a call needs attention: terracotta-subtle ribbon **"Worth a look"**.
- **Upcoming row:** *"Maa · Sunday 6:30 pm · Weekly"* with **"Edit"**.
- **Summary card:** person, date, the "What happened" one-liner, chips for updates, link **"View summary"**.
- **Empty state (no people):** *"It starts with one person."* / *"Who would you love to check in on today?"* / button **"Add someone you love"**.
- **Container:** `grid gap-8 lg:grid-cols-12`
- **Emotional goal:** the user feels *connected*, not managed.

### 3.2 People
- **Layout:** master-detail: left list (`lg:col-span-4`, person rows), right detail (`lg:col-span-8`). Mobile: list then push to detail.
- **List text:** H1 **"People"**, search placeholder **"Search by name"**, button **"Add someone"**.
- **Detail:** header with large orb avatar, name, *"Maa · Mother · +91 98•••• ••210"*; actions **"Call now"**, **"Schedule a call"**, **"Edit"**. Blocks: **"How Vaani speaks with Maa"** (voice, tone, language, with **"Change"**); **"Recent conversations"** (last 5 with one-line summary); **"What Vaani remembers"** (top 4 memories, **"See all"**); **"Calls"** (recurring: *"Every Sunday at 6:30 pm"*, **"Pause"**). Danger zone: **"Remove Maa"** with confirm *"This also removes what Vaani remembers about her."*
- **Empty state:** *"No one here yet."* / *"Add a parent, a grandparent, a friend. Anyone who'd love a call."*
- **Container:** `grid gap-8 lg:grid-cols-12`
- **Emotional goal:** each person feels like a *person*, never a record.

### 3.3 Create Call Wizard (`/calls/new`, centered `max-w-2xl`)
Stepper: **Who → Voice → Questions → Schedule**. Progress: 4 dots connected by a line that fills terracotta. Footer: **"Back"** / **"Continue"**; last step **"Call now"** / **"Schedule call"**. Step transition: 400ms slide+fade.

- **Step 1 — Who.** H2 **"Who should Vaani call?"** Sub *"Someone who'd love to hear from you."* Fields: **"Their name"** (placeholder *Meena Sharma*), **"What should Vaani call them?"** (placeholder *Maa, Aunty, Dadi…*), relationship chips **Mom · Dad · Grandparent · Sibling · Partner · Friend · Someone else**, **"Phone number"** with country code (hint *"Include the country code, like +91."*). Toggle to reuse an existing person at the top: **"Choose someone you've added"**.
- **Step 2 — Voice.** H2 **"How should Vaani sound?"** Sub *"You know them best. Pick what feels right."* Voice cards (3, each with a **▶ Hear a sample**): **Claire · calm and clear**, **Ivy · bright and friendly**, **Dawn · soft and unhurried** (map to real voice IDs from AssemblyAI docs). Tone chips: **Warm · Cheerful · Gentle · Playful**. Language select: **English** (Hindi shown as *"Coming soon"*).
- **Step 3 — Questions.** H2 **"What matters in this call?"** Sub *"Write it the way you'd tell a friend. No special format."* Textarea placeholder *"Ask how her knee is doing. Find out if she's going to Meena's wedding. Tell her I'll visit in March."* Tap-to-add suggestion chips: **How has she been feeling?** · **How was her week?** · **Follow up on last time** · **Does she need any help?** · **Ask about her plans.** Second field **"A message from you"** (optional) placeholder *"Something you'd like her to hear, in your own words."* Toggle **"Let Vaani bring up things it remembers"** (on).
- **Step 4 — Schedule.** H2 **"When should Vaani call?"** Options (radio cards): **Right now** · **Later today** · **Pick a time** · **Every week** (day + time). Time zone caption *"Times are in India Standard Time."* Checkbox (required): **"I've checked that Maa is happy to receive calls from Vaani."** Notify: **Text me the summary** / **Email me** / **App only**. Review card: *"Vaani will call Maa right now. It will introduce itself as an AI calling for you, speak warmly in English, and ask about her knee and Meena's wedding."* 
- **Container:** `mx-auto max-w-2xl rounded-card bg-cream-50 border border-cream-200 shadow-md p-6 md:p-10`
- **Emotional goal:** setting up a call should feel like writing a kind note, not configuring software.

### 3.4 Call Detail (`/calls/[id]`)
- **Layout:** `grid lg:grid-cols-12 gap-8`. Left 7 cols: **Transcript** card (scrollable, sticky header). Right 5 cols stacked: **Summary** card (four blocks), **Memory panel**. Top: back link **"← Maa"**, H1 *"Sunday chat with Maa"*, caption *"Sun 27 Sep · 6:32 pm · 8 min"*, status pill (sage **Completed**), actions **"Call again"**, **"Share summary"**.
- **Summary blocks (exact labels):** **What happened** · **Important updates** · **Things worth remembering** · **For your next call**. Under updates, chip **"Worth a look"** if flagged.
- **Vaani's note to you:** a short handwritten-feel line at the top, e.g. *"She sounded cheerful, and she laughed twice. She'd love a real call this weekend."*
- **Memory panel:** title **"Vaani will remember"** with 3 new memories, each with **✓ Keep** and **✕ Forget**. Empty: *"Nothing new to remember from this call."*
- **Transcript text:** speaker labels *Vaani* / *Maa*; timestamps `tabular-nums` caption; header search placeholder **"Search this conversation"**. Empty (no answer): *"Maa didn't pick up. Want Vaani to try again later?"* with **"Try again"**.
- **Container:** `grid gap-8 lg:grid-cols-12`
- **Emotional goal:** you understand a whole conversation in ten seconds and feel closer, not surveilled.

### 3.5 Memory
- **Layout:** header, person filter chips (**All**, one per person), then masonry-ish grid `columns-1 md:columns-2 gap-5`. 
- **Text:** H1 **"What Vaani remembers"**; sub *"Little things that help every call feel like a continuation. You're always in charge."* Master toggle **"Let Vaani remember"**. Memory card: sentence in Fraunces 18px (*"Trouble sleeping. Improving since the new pillow."*), person chip, source *"From Sunday's call"*, kind icon, actions **Edit**, **Pin**, **Forget**. Button **"Add something Vaani should know"**. Delete toast: *"Forgotten. Vaani won't bring it up."* Toggle-off banner: *"Memory is off. Vaani will start each call fresh."*
- **Empty state:** *"Nothing here yet."* / *"After your first call, Vaani will keep the little things that matter."*
- **Container:** `mx-auto max-w-content`
- **Emotional goal:** trust; it should feel like a shared notebook, never a database.

### 3.6 Settings
- **Layout:** left sub-nav (`md:col-span-3`) + panels (`md:col-span-9`), card sections.
- **Sections & text:** **Account** (name, email, **"Save your account"** for guests, sign out) · **Calls** (default voice, quiet hours **"Never call before 9:00 am or after 8:00 pm"**, default disclosure line shown read-only: *"Vaani will always introduce itself as an AI calling on your behalf."*) · **Memory** (toggle **"Let Vaani remember"**, **"Forget everything"**) · **Privacy** (**"Download my data"**, **"Delete my account"** with confirm *"This removes everyone you've added, every summary, and every memory."*) · **Notifications** (SMS / email / app toggles) · **Appearance** (**Light** / **Evening** *"coming soon"*).
- **Container:** `mx-auto max-w-content grid gap-8 md:grid-cols-12`
- **Emotional goal:** you feel in control of everything, with nothing hidden.

---

## SECTION 4 — THE LIVE CALL EXPERIENCE (the demo moment)

**Screen container (all states):** `fixed inset-0 z-50 flex flex-col items-center bg-cream bg-[radial-gradient(ellipse_at_50%_30%,#FBD9A8_0%,rgba(250,246,240,0)_65%)]`. Layout: orb centered upper half; below it status headline + sub; transcript area in a glass panel (`mx-auto w-full max-w-xl`) bottom; top-right a **"End call"** ghost button; top-left person chip.

### The orb
Soft glowing amber-terracotta sphere. No face, no eyes. Layers (all `rounded-full`): (1) outer glow `-inset-12 bg-amber-glow/40 blur-3xl`; (2) core `bg-[radial-gradient(circle_at_35%_30%,#FFE3BD_0%,#F2A65A_38%,#C4622D_75%,#8F3F17_100%)] shadow-orb`; (3) slow rotating inner sheen (`animate-drift`, conic gradient at 20% opacity, blurred); (4) grain (`opacity-[0.08] mix-blend-overlay`); (5) ripple rings (2 rings, `border border-terracotta/30`). Size `size-56 md:size-72`.

```tsx
// components/vaani-orb.tsx
"use client";
import { motion, useSpring } from "framer-motion";
export type OrbState = "idle" | "dialing" | "speaking" | "listening" | "thinking" | "ending";
export function VaaniOrb({ state, level = 0 }: { state: OrbState; level?: number }) {
  // level: 0..1 amplitude of whoever is speaking (from Supabase Broadcast at ~10Hz)
  const scale = useSpring(1, { stiffness: 180, damping: 18 });
  scale.set(
    state === "speaking" ? 1 + level * 0.1 :
    state === "listening" ? 0.94 + level * 0.03 :
    state === "ending" ? 0.7 : 1
  );
  return (
    <div className="relative size-56 md:size-72">
      {state === "dialing" && [0, 0.8].map(d => (
        <span key={d} style={{ animationDelay: `${d}s` }} className="absolute inset-0 rounded-full border border-terracotta/30 animate-ripple" />
      ))}
      <motion.div style={{ scale }} animate={{ opacity: state === "ending" ? 0.55 : 1 }} transition={{ duration: 1.2 }}
        className={`absolute inset-0 ${state === "idle" ? "animate-breathe" : ""}`}>
        <div className="absolute -inset-12 rounded-full bg-amber-glow/40 blur-3xl" />
        <div className="absolute inset-0 rounded-full shadow-orb bg-[radial-gradient(circle_at_35%_30%,#FFE3BD_0%,#F2A65A_38%,#C4622D_75%,#8F3F17_100%)]" />
        <div className={`absolute inset-3 rounded-full opacity-20 blur-xl bg-[conic-gradient(from_0deg,#FFE3BD,#C4622D,#FFE3BD)] ${state === "thinking" ? "animate-drift" : "animate-drift [animation-duration:30s]"}`} />
      </motion.div>
    </div>
  );
}
```

### States

| State | Headline (Fraunces h3) | Sub (body, ink-soft) | What animates | Timing |
|---|---|---|---|---|
| **1. Connecting** | *Getting ready to call Maa…* | *Vaani has your notes: her knee, Meena's wedding, and your message.* | Orb fades/scales 0.85→1, three "note chips" (topics) slide up one by one beneath it. | Orb 1.0s ease-calm; chips 150ms stagger; holds 1.5–2s. |
| **2. Ringing** | *Ringing Maa…* | *Vaani will say hello and explain who it is.* | Orb in `dialing`: two expanding rings looping; status dot honey pulses; a soft tick counter "0:04" under the text. | Rings 2.4s loop offset 0.8s. |
| **3. Live** | *Talking with Maa* | live caption: *"Vaani is speaking"* / *"Maa is speaking"* / *"Listening…"* | Orb `speaking`: scales with amplitude; `listening`: contracts to 0.94, a soft ring of amber glow follows Maa's level. Transcript lines slide up 12px + fade in, current line shows blinking caret; Vaani lines have tiny orb dot, Maa lines a terracotta-subtle initial. **Memory chip** appears above the transcript when Vaani uses memory: glass pill *"Vaani remembered: trouble sleeping last week"* (fades in 500ms, stays 6s). Timer counts up. | Spring 180/18 continuous; line entrance 350ms. |
| **4. Vaani thinking** (between turns, >600ms) | *(unchanged)* caption *"Vaani is thinking…"* | Orb slows breathing, inner sheen speeds (`animate-drift` 6s), three-dot indicator in transcript breathing at 1.2s stagger. No spinners. | Fade-in 200ms after 600ms silence; out instantly on speech. |
| **5. Call ending** | *Saying goodbye…* | *"Take care, Aunty."* (the last spoken line, quoted) | Orb contracts to 0.7 and dims (opacity 0.55) over 1.2s; transcript panel fades to 60%; status dot turns sage. | 1.2s ease-calm, then 600ms hold. |
| **6. Summary ready** | *Here's how it went.* | *A few things you'll want to know.* | Orb slides up and shrinks to 56px (layout animation 700ms, becomes the avatar in the card header). Summary card rises from bottom (`y: 40→0`, `shadow-lg`, 700ms ease-calm); four blocks stagger 140ms; "Vaani's note to you" types in last; a soft confetti-less sparkle: the orb pulses once (scale 1.08, 600ms). If flagged: **"Worth a look"** ribbon slides in. A toast: *"Summary sent to your phone."* (glass). | Total reveal ≈ 2.4s. |

Classes: status headline `mt-10 text-center font-display text-3xl md:text-[32px]`; sub `mt-2 text-ink-soft`; transcript panel `mt-8 w-full max-w-xl max-h-[34vh] overflow-y-auto rounded-card bg-cream-50/70 backdrop-blur-xl border border-white/60 shadow-md p-5 space-y-3`; summary card `w-full max-w-2xl rounded-card bg-cream-50 border border-cream-200 shadow-lg p-8`.

Data feed: `calls.status` changes (Realtime postgres_changes), `call_events` rows for transcript turns, and a Supabase **Broadcast** channel `call:{id}` for `{speaker, level}` amplitude at ~10Hz (not stored). Demo mode replays a scripted timeline through the same channels.

---

## SECTION 5 — MICROCOPY LIBRARY

**Buttons (10):** Set up Vaani · Call now · Schedule a call · Let Vaani call you · View summary · Call again · Add someone you love · Save what Vaani should ask · Keep this memory · Continue as guest

**Empty states (5):**
1. No loved ones — *"It starts with one person. Who would you love to check in on today?"*
2. No calls yet — *"No conversations yet. Your first one is a few taps away."*
3. No memories — *"Nothing here yet. After your first call, Vaani will keep the little things that matter."*
4. No upcoming calls — *"Nothing planned. A weekly call keeps the thread going."*
5. No summaries — *"When Vaani finishes a call, the story shows up here."*

**Loading (5):** *Vaani is dialing…* · *Connecting…* · *Getting Vaani ready…* · *Gathering what you should know…* · *Writing up how it went…*

**Errors (5):**
1. Call failed — *"That call didn't go through. Nothing was said, and nobody was bothered. Want to try again?"*
2. Invalid number — *"That number doesn't look quite right. Try including the country code, like +91."*
3. No answer — *"Maa didn't pick up. That's okay. Want Vaani to try again in an hour?"*
4. They asked not to be called — *"Maa asked not to receive calls, so Vaani has stopped. You can talk to her yourself."*
5. Something broke — *"Something went wrong on our side. Your notes are safe. Please try again."*

**Success (5):** *"The call is done. Here's how it went."* · *"Got it. Vaani will remember that."* · *"All set. Vaani will call Maa on Sunday at 6:30 pm."* · *"Forgotten. Vaani won't bring it up."* · *"Summary sent to your phone."*

**SMS templates (3):**
1. *Warm recap:* "Vaani here 🧡 I just spoke with Maa for 8 min. She sounded cheerful, sleeping better, but her knee is acting up. Meena's wedding is on the 14th. Full summary: {link}"
2. *Short & quick:* "Maa is doing well today. Sleep is better, knee is sore. Worth a real call this weekend? Details: {link}"
3. *Worth a look:* "Vaani here. Maa mentioned she felt dizzy this morning and wanted you to know. She's okay to talk. Please call when you can. Details: {link}"

---

## SECTION 6 — ANTIGRAVITY BUILD PROMPT

*(Paste everything in the block below into Antigravity. It assumes this brief is in the repo as `/docs/VAANI_BRIEF.md`; Antigravity must read Sections 1–5 there and treat them as exact copy and token specs.)*

````
You are building VAANI, an AI voice agent web app, for a 24-hour hackathon. Read /docs/VAANI_BRIEF.md fully before writing code. Sections 1 (design system), 2 (landing copy), 3 (dashboard copy), 4 (live call), 5 (microcopy) are the SOURCE OF TRUTH: use the exact copy, tokens, and Tailwind classes. No placeholder text anywhere. Never use the words "agent", "workflow", "execution", or "telemetry" in the UI; the user thinks in People and Conversations.

TECH STACK: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (restyle with our tokens), Framer Motion, Supabase (Auth, Postgres, Realtime), lucide-react. Package: tailwindcss-animate. Separate Node call-server in /call-server (Express + ws), based on AssemblyAI's example repo (AssemblyAI/voice-agent-api-twilio-example).

BUILD IN THIS ORDER. Finish and verify each step (typecheck + run) before moving on.

1. SCAFFOLD. create-next-app (TS, Tailwind, App Router, src-less). Install deps. Add fonts via next/font/google: Fraunces (axes opsz, SOFT; variable --font-fraunces) and Instrument Sans (--font-instrument). Paste tailwind.config.ts from Section 1.2 EXACTLY. Global CSS: cream background, ink text, `font-sans`, grain overlay component (fixed, pointer-events-none, SVG feTurbulence, opacity 0.035), reduced-motion rules. Folders: app/(marketing), app/(app)/{home,people,calls,memory,settings}, components/{ui,marketing,app,call}, lib/{supabase,demo}, docs.

2. SUPABASE. Create SQL migration (schema below), enable Anonymous sign-ins, Google OAuth, email/password. Create lib/supabase/{client,server}.ts. Auth pages: /login with Google button, email/password form, and "Continue as guest" (supabase.auth.signInAnonymously). Guest banner in app shell: "You're a guest. Save your people →" which links identity via supabase.auth.updateUser / linkIdentity. Middleware protects (app) routes.

3. DESIGN PRIMITIVES. Button (primary/ghost/quiet, rounded-full), Input, Chip, Card (rounded-card bg-cream-50 border-cream-200 shadow-sm, hover lift), Toggle, Accordion, Dialog, Toast (glass), Avatar-Orb (small tinted orb per person), PresenceDot. Build VaaniOrb from Section 4 (all states) and a /dev/orb page to test every state.

4. LANDING PAGE (app/(marketing)/page.tsx). Sticky frosted nav and all 8 sections from Section 2 with exact copy, layouts, Tailwind containers, and scroll animations (whileInView, once). Hero includes the "Let Vaani call you" phone field: on submit sign in as guest if needed, create a person + call, and open the live call screen. Footer.

5. APP SHELL + HOME + PEOPLE (Section 3.1, 3.2). Sidebar (desktop), bottom tabs (mobile). Home with person cards, presence lines ("Last spoke Tuesday · sounded cheerful"), Coming up, Fresh from your calls, empty states. People list/detail with all blocks and empty states. Seed script (`npm run seed`) that creates for the current user: person "Maa" (Mother, +91 98XXXXXXXX placeholder read from env), 2 completed calls, 6 memories including "Trouble sleeping" (improving), "Meena's wedding on the 14th", "Loves evening walks", and a weekly Sunday 6:30 pm schedule.

6. CREATE CALL WIZARD (Section 3.3). 4 steps with slide+fade transitions, validation (E.164 phone via libphonenumber-js), required consent checkbox, review card. On submit: insert into calls, POST to CALL_SERVER_URL/calls/start {callId}, navigate to /calls/[id]/live. "Right now" starts immediately; others store scheduled_for (a scheduler can be stubbed with a cron endpoint that starts due calls).

7. LIVE CALL SCREEN (/calls/[id]/live), Section 4 exactly. Subscribe to calls (status) via Realtime postgres_changes, call_events inserts for transcript turns, Broadcast channel `call:{id}` for {speaker, level}. Map status -> UI state: connecting, ringing, live (speaking/listening/thinking derived from broadcast + turn gaps >600ms), ending, completed (summary reveal). Memory chip when a call_event has kind "memory_used". Implement DEMO MODE (NEXT_PUBLIC_DEMO_MODE=true): lib/demo/simulator.ts plays the scripted Maa transcript (Section 2 hero transcript) with realistic timings, fake amplitude, and the summary from Section 2, through the same subscription interface.

8. CALL DETAIL (/calls/[id]) per Section 3.4: transcript (search), four-block summary, "Vaani's note to you", memory panel with Keep/Forget (writes to memories). Sticky header, "Call again", "Share summary".

9. MEMORY + SETTINGS (Section 3.5, 3.6): memory grid with edit/pin/forget, add-memory dialog, global toggle (profiles.memory_enabled), per-person filter; settings sections with all copy.

10. CALL SERVER (/call-server). Start from AssemblyAI's Twilio outbound example. Endpoints: POST /calls/start (loads call+person+memories from Supabase using the service role, builds the prompt below, creates Twilio call), POST /outbound-twiml, WS /outbound-stream (bridge Twilio Media Streams <-> AssemblyAI Voice Agent API, audio/pcmu passthrough, forward barge-in clear events), POST /call-status. During the call: write call_events rows for each finalized turn (speaker, text, at_ms), broadcast {speaker, level} ~10Hz on Supabase channel `call:{id}`, update calls.status (connecting -> ringing -> live -> ending -> completed / no_answer / failed). Add a tool `remember(note)` and `flag_attention(reason)` the agent can call. On hangup: run summarization with an LLM (Gemini API, JSON-only output) producing {what_happened, important_updates[], worth_remembering[], next_call[], mood_note, needs_attention}; save to calls.summary; insert new memories (only if memory enabled); send SMS via Twilio using Section 5 SMS templates; set status completed. Env vars in .env.example.

11. POLISH. Loading/empty/error/success copy from Section 5 everywhere. Mobile pass at 390px. Reduced-motion. Lighthouse sanity. README with run instructions (ngrok, Twilio webhook setup, seed, demo mode).

VOICE PROMPT TEMPLATE (the call server compiles the user's plain-language notes into this; the user never sees it):
"""
You are Vaani, an AI voice assistant calling {person.nickname} on behalf of {user.display_name}. Your first sentence must clearly say you are an AI calling on {user.display_name}'s behalf. Never pretend to be {user.display_name} or a human. If asked who you are, answer honestly.
Tone: {tone}. Speak in short, natural sentences, like a caring friend. One question at a time. Listen more than you talk. Never sound like a questionnaire. Let silences be okay.
Ask first if it's a good time. If not, say a kind goodbye and offer to try later. If asked to stop calling, agree at once and call flag_attention("asked not to be called").
What {user.display_name} would love to know: {notes_from_user}
A message from {user.display_name} to deliver warmly, in their words, near the end: {personal_message}
Things you remember from before (use gently, only if natural, never list them): {memories}
Safety: never give medical, legal, or financial advice. If they mention a fall, pain, chest issues, confusion, or feeling unsafe, respond with kindness, tell them you'll let {user.display_name} know, call flag_attention(reason), and encourage them to contact {user.display_name} or local emergency services if urgent.
Keep the call to about {target_minutes} minutes. End warmly ("Take care, {nickname}"). Use remember(note) for small personal details worth keeping.
"""
Greeting (spoken first): "Namaste {nickname}, this is Vaani. I'm an AI assistant calling on behalf of {user.display_name}. Is this an okay time for a quick hello?"
(Use the greeting field in the session config. Voice names are lowercase, e.g. "claire". Check docs for valid voices and languages.)

SUPABASE SCHEMA:
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, phone text, is_guest boolean default false,
  timezone text default 'Asia/Kolkata', memory_enabled boolean default true,
  notify_sms boolean default true, notify_email boolean default true,
  created_at timestamptz default now());
create table people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null, nickname text, relationship text not null,
  phone_e164 text not null, language text default 'en',
  voice text default 'claire', tone text default 'warm',
  memory_enabled boolean default true, tint text default '#F2A65A',
  consent_confirmed boolean default false, created_at timestamptz default now());
create table calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  person_id uuid not null references people on delete cascade,
  status text not null default 'scheduled' check (status in
    ('scheduled','connecting','ringing','live','ending','completed','failed','no_answer','declined')),
  notes text, personal_message text, scheduled_for timestamptz, recurrence text,
  started_at timestamptz, ended_at timestamptz, duration_seconds int,
  twilio_call_sid text, summary jsonb, mood_note text,
  needs_attention boolean default false, created_at timestamptz default now());
create table call_events (
  id bigserial primary key,
  call_id uuid not null references calls on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  speaker text not null check (speaker in ('vaani','person','system')),
  kind text default 'turn' check (kind in ('turn','memory_used','flag')),
  text text not null, at_ms int, created_at timestamptz default now());
create table memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  person_id uuid not null references people on delete cascade,
  call_id uuid references calls on delete set null,
  content text not null,
  kind text default 'other' check (kind in ('health','plan','preference','people','moment','other')),
  pinned boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
-- trigger: on auth.users insert -> insert into profiles (id, is_guest = coalesce((new.is_anonymous),false)).
-- Enable Realtime on calls and call_events.

RLS NOTES: enable RLS on all five tables. Anonymous sign-in users are ordinary `authenticated` users with auth.uid(), so ONE set of policies covers guests and full users:
  profiles: select/update using (id = auth.uid()).
  people, calls, call_events, memories: for select/insert/update/delete using (user_id = auth.uid()) with check (user_id = auth.uid()).
The call-server uses the service-role key (bypasses RLS) and must NEVER be exposed to the browser. Broadcast channel names include an unguessable call UUID. Guests keep their data when they "Save your account" (identity linking keeps the same uid).

DEFINITION OF DONE: (a) a real call to a verified phone number completes and streams live transcript into the UI; (b) summary reveal + SMS work; (c) demo mode replays the full Maa story with no network; (d) landing page matches Section 2 exactly; (e) no placeholder copy anywhere.
````

---

### Final checklist for you (not for Antigravity)
- [ ] Twilio account upgraded, number bought, ngrok/Railway URL live
- [ ] AssemblyAI key set; a real call works before you touch UI polish
- [ ] Seed data loaded; Maa memory "Trouble sleeping" visible
- [ ] Demo mode tested with Wi-Fi off
- [ ] 60-second backup screen recording
- [ ] Verify voice names and language support in AssemblyAI docs; edit FAQ #5 and wizard language list to match reality
- [ ] Rehearse: phone in hand, judge number verified, SMS arrives on cue