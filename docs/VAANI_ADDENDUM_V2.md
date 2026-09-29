# VAANI — Design Addendum v2 (Premium Pass)
*Save as `/docs/VAANI_ADDENDUM_V2.md` next to the main brief. Where this file conflicts with `VAANI_BRIEF.md`, **this file wins** (it overrides: Section 1.1 "no purple" rule, Section 1.5 scroll motion, Section 2 hero/visuals, Section 3.1 Home layout, and adds Auth + Welcome). All copy from the main brief stays.*

Reference feel: Google product pages (friendly illustration, colorful soft gradients), Apple (centered type, generous space, product shown big), ElevenLabs / Claude sign-in (split screen, calm, one strong visual). Mood: **sunrise, not startup.**

---

## A. New visual language

**A1. Dawn gradient palette (hero, auth panel, welcome, final CTA only)**
`apricot #FFC99A` · `coral #F7A5A0` · `butter #FFE7A6` · `rose #F3C4E0` · `sky #BFD9F5` on `cream #FAF6F0`. Warm colors dominate (about 75%); rose and sky are small accents so it reads colorful but still human. Text always sits on `ink` with a cream fade at section bottoms for contrast. App screens (dashboard) stay calm cream; gradients appear only in hero cards.

**A2. Dots motif (the signature)**
- Dot-grid backgrounds: `bg-[radial-gradient(rgba(43,33,28,0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]`
- Section eyebrows: a 6px terracotta dot + uppercase label (`● HOW IT WORKS`).
- Dotted connectors between steps, timeline dots in call history, a dotted heart-line joining two phones in the final CTA (SVG `stroke-dasharray="1 8" stroke-linecap="round"`).
- Three-dot "thinking" indicator reuses the same dot shape.

**A3. Illustration system (friendly, flat, Google-style)**
Style: rounded geometric shapes, **no outlines**, 2–3 tones from the warm palette plus one accent, soft grain, characters simplified (round heads, dot eyes, warm skin tones in varied shades, no realistic detail). Sized big, floating over gradients with soft drop shadows (`drop-shadow-[0_20px_30px_rgba(143,63,23,0.15)]`).

How to source (pick one, don't mix):
- **Fastest:** use a free recolorable set (unDraw, Open Doodles, Storyset). **Check each set's license** and recolor to our palette. 
- **Custom:** have Antigravity generate inline SVG React components following the scenes below (`components/illustrations/*.tsx`), using our hex values only, `viewBox` set, `role="img"` + `aria-label`.

Scenes needed (8):
1. **Hero floating props:** phone with a heart speech bubble, a steaming chai cup, a small plant, a paper note with a tick. Each floats (y ±8px, 6–9s, offset).
2. **Problem:** a person at a laptop at night, wall clock, phone on desk showing an unread notification with a tiny house icon. Warm lamp glow, lots of empty space.
3. **Step 1:** contact card with a small orb avatar and a phone-number pill.
4. **Step 2:** sticky note with three hand-drawn bullets and a pencil.
5. **Step 3:** an envelope opening with a heart and a soft orb inside.
6. **Demo:** an older woman on a sofa holding a phone, smiling, a cushion and a window with evening light.
7. **Trust icons:** custom duotone icon tiles (below).
8. **Final CTA:** two phones facing each other joined by a dotted heart-line, orb glowing between them.

**Icon tiles (Apple style):** `size-14 rounded-2xl bg-gradient-to-br from-terracotta-subtle to-amber-soft border border-white/70 shadow-sm grid place-items-center` with lucide icon `size-6 stroke-[1.5] text-terracotta-deep`. Use for Trust points, dashboard quick actions, settings sections.

---

## B. Blur-to-sharp motion (global rule, replaces scroll motion in 1.5)

Everything that enters the viewport goes **blurred → sharp**, slightly rising, once.

```tsx
// components/motion/blur-reveal.tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";

export function BlurReveal({ children, delay = 0, y = 16, blur = 12, className = "" }:
  { children: React.ReactNode; delay?: number; y?: number; blur?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, filter: `blur(${blur}px)`, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Headlines: each word blurs in with a stagger
export function BlurWords({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.05, delayChildren: delay }}>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} className="inline-block whitespace-pre"
          variants={{ hidden: reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(14px)", y: 14 },
                      show: { opacity: 1, filter: "blur(0px)", y: 0 } }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{w}{" "}</motion.span>
      ))}
    </motion.span>
  );
}
```
Rules: headlines use `BlurWords`; paragraphs, buttons, cards, illustrations use `BlurReveal` with 80–120ms stagger via `delay`. Mobile: `blur=6` to stay smooth. Never blur more than ~20 elements at once. Page transitions between app routes: 350ms blur(8px)→0 crossfade. Add `will-change: filter, opacity` only on animating elements.

---

## C. Landing page upgrades (all copy unchanged)

**Hero (rebuild):** centered Apple-style, not two-column.
- Container: `relative isolate overflow-hidden pt-36 pb-0 md:pt-44 text-center`
- Background: `<MeshGradient />` (code below) + dot grid + grain.
- Order: small pill *"● Built with AssemblyAI Voice Agent API"* → headline (`text-[44px] md:text-display-xl max-w-4xl mx-auto`, one italic Fraunces word) → sub (`text-body-lg text-ink-soft max-w-2xl mx-auto`) → CTA row (**Set up Vaani** + **Hear a sample call**) → phone pill row **"Let Vaani call you"** → **product preview** below: a browser-frame card (`mx-auto mt-16 max-w-5xl rounded-t-[28px] border border-white/70 bg-cream-50/80 backdrop-blur-xl shadow-lg`) showing the live call screen (orb, transcript lines) tilted slightly and rising 40px on scroll (parallax `useScroll`, translateY -40 → 0). Illustrated props (A3 #1) float around it on desktop; hidden below `md`.
- Trailing fade: `absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-cream`.

```tsx
// components/marketing/mesh-gradient.tsx
export function MeshGradient() {
  const blob = "absolute rounded-full animate-blob will-change-transform";
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-cream">
      <div className={`${blob} -top-40 -left-32 size-[640px] bg-[#FFC99A] blur-[110px] opacity-80`} />
      <div className={`${blob} -top-24 -right-24 size-[560px] bg-[#F7A5A0] blur-[120px] opacity-60 [animation-delay:-6s]`} />
      <div className={`${blob} top-1/3 left-1/3 size-[520px] bg-[#FFE7A6] blur-[110px] opacity-70 [animation-delay:-12s]`} />
      <div className={`${blob} -bottom-40 right-1/4 size-[520px] bg-[#F3C4E0] blur-[120px] opacity-50 [animation-delay:-3s]`} />
      <div className={`${blob} -bottom-48 -left-24 size-[480px] bg-[#BFD9F5] blur-[120px] opacity-45 [animation-delay:-9s]`} />
      <div className="absolute inset-0 opacity-100 [background-image:radial-gradient(rgba(43,33,28,0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
    </div>
  );
}
```
Add to `tailwind.config.ts`: keyframes `blob: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "33%": { transform: "translate(40px,-30px) scale(1.1)" }, "66%": { transform: "translate(-30px,20px) scale(0.95)" } }`, animation `blob: "blob 18s ease-in-out infinite"`.

**Section visuals:**
- **Problem:** stays text-only but add the night-desk illustration (A3 #2) small, bottom-right, 30% opacity, plus a faint dot grid. Lines still blur in one by one.
- **How it works:** three cards in a bento row (`grid md:grid-cols-3 gap-6`), each `rounded-[28px] bg-cream-50 border border-cream-200 p-8 overflow-hidden`, big illustration on top (`h-44`), Fraunces numeral `01/02/03`, title, body. A dotted SVG path arcs between cards on desktop and draws on scroll.
- **Demo:** left transcript card gets the sofa illustration peeking from the card's corner; right summary card has a tiny mesh gradient header (`h-20`) with the orb avatar. Transcript lines blur in one by one.
- **Trust:** icon tiles (A3), cards have dot-grid corner texture.
- **Pricing:** Family card gets a 1px gradient border (`bg-gradient-to-br from-apricot via-coral to-rose p-px` wrapper) and a soft glow.
- **Final CTA:** `<MeshGradient />` again, two-phones illustration with dotted heart-line (A3 #8), large centered headline.
- **New thin strip under hero:** *"Built for hackathon: lablab.ai × AssemblyAI"* + small monoline icons (phone, waveform, heart). Not a logo wall.

Nav: same frosted spec; add a subtle 1px gradient line under it when scrolled.

---

## D. Auth pages (`/login`, `/signup`) — split screen

Shared layout `app/(auth)/layout.tsx`: `min-h-screen grid lg:grid-cols-2 bg-cream`.

**Left (form):** `flex flex-col justify-between px-6 py-8 md:px-16`
- Top: logo (link home). Bottom: *"By continuing you agree to our Terms and Privacy Policy."* (`text-caption text-ink-faint`).
- Center column `mx-auto w-full max-w-sm`: 
  - Heading (Fraunces, `text-h3`): **Login:** *"Welcome back."* / **Signup:** *"Let's stay close to the people who matter."* 
  - Sub: *"Sign in to see how everyone's doing."* / *"Create your space in under a minute."*
  - Button 1: **"Continue with Google"** (`h-12 w-full rounded-full border border-cream-200 bg-white hover:bg-cream-50 shadow-sm`, Google "G" mark).
  - Divider: `—— or ——` (`text-caption text-ink-faint`).
  - Fields (`h-12 rounded-input bg-cream-50 border-cream-200 focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta`): Name (signup only, *"What should Vaani call you?"*), **"Email"**, **"Password"** (show/hide eye; signup shows a 4-segment strength bar in sage/honey/rust).
  - Primary: **"Continue with email"** (`h-12 w-full rounded-full bg-terracotta`). 
  - Quiet button below: **"Continue as guest"** with sub *"Try it first. Save your people later."*
  - Switch link: *"New here? Create an account"* / *"Already have an account? Sign in"*.
- Form fields entrance: `BlurReveal` stagger 70ms. On submit, form blurs out (300ms) and the orb+text *"Creating your space…"* blurs in; then redirect to `/welcome`.

**Right (visual):** `hidden lg:block relative m-3 overflow-hidden rounded-[32px]`
- `<MeshGradient />` + grain 0.05.
- Center: large `VaaniOrb` (state idle, `size-72`).
- Above orb (top-left, `p-10`): Fraunces `text-4xl text-ink`: *"Presence, even on your busiest days."*
- Below: a **rotating carousel of 3 glass cards** (`bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-5 max-w-sm`), each swaps every 5s with blur-out/blur-in (450ms), showing a mini transcript line + mini summary chip:
  1. *"Vaani: How have you been sleeping this week?"* · chip *Sleep improved*
  2. *"Maa: Tell him to eat properly."* · chip *Message delivered*
  3. *"Summary sent to your phone."* · chip *Just now*
- Bottom-left: tiny dot indicators for the carousel.
Mobile: right panel hidden; a small gradient strip and orb (`size-24`) sit above the heading.

---

## E. Welcome experience (first login, `/welcome`)

Shown once after signup/guest start (`profiles.onboarded = false`; add the column). Full-screen `fixed inset-0 z-[70]` over the app, `<MeshGradient />` background.

Timeline (Framer Motion, `ease-calm`):
| t | What happens |
|---|---|
| 0.0s | Orb fades in: `opacity 0→1, filter blur(30px)→0, scale 0.8→1`, 1.2s. Shared `layoutId="vaani-orb"`. |
| 0.9s | **"Hi, Aarav."** blur-in word by word (`text-[56px] md:text-[72px] font-display`). Guests: *"Hi there."* |
| 2.0s | *"I'm Vaani. I'll help you stay close to the people who matter."* blur-in (`text-body-lg text-ink-soft`). |
| 3.2s | Two buttons blur-in: **"Add someone you love"** (primary) and **"Look around first"** (quiet). Small **Skip** top-right. |
| on click | Text and buttons blur out (400ms). Orb **flies** to the sidebar logo slot (`layoutId` shared animation, 800ms spring 120/20). Gradient fades. Dashboard mounts. |
| +0.2s | Dashboard elements blur-in in order: sidebar (0ms) → greeting (100) → next-up card (200) → people cards (300+, 80ms stagger) → coming up (500) → getting-started checklist (600). |

```tsx
// app/(app)/welcome/page.tsx (skeleton)
<motion.div className="fixed inset-0 z-[70] grid place-items-center" exit={{ opacity: 0, filter: "blur(12px)" }}>
  <MeshGradient />
  <div className="flex flex-col items-center text-center">
    <motion.div layoutId="vaani-orb" initial={{ opacity: 0, scale: 0.8, filter: "blur(30px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.2, ease: [0.22,1,0.36,1] }}>
      <VaaniOrb state="idle" />
    </motion.div>
    <h1 className="mt-10 font-display text-[56px] md:text-[72px]"><BlurWords text={`Hi, ${name}.`} delay={0.9} /></h1>
    {/* subline delay 2.0s, buttons delay 3.2s */}
  </div>
</motion.div>
```
Returning users: no welcome; a 600ms greeting blur-in only. Respect reduced motion (skip the flight; simple fades).

---

## F. Dashboard layout (bento, pro-grade)

**Shell:** sidebar `w-[72px]` collapsed icons on tablet, `w-64` desktop; icon tiles for Home / People / Memory / Settings; top bar with a **⌘K command palette** (search people, "Call Maa now", "Add someone") and the **New call** button. Top bar is glass and sticky. Content `max-w-content mx-auto px-5 md:px-8 py-8`.

**Home bento grid** (`grid gap-5 lg:grid-cols-12 auto-rows-min`):
1. **Greeting row (col-span-12):** *"Good evening, Aarav."* (Fraunces 44px, `BlurWords`) + sub *"Here's who you've been thinking about."*
2. **Next-up hero card (lg:col-span-8):** `relative overflow-hidden rounded-[28px] p-8 border border-white/60 shadow-md`, with a small mesh gradient background, orb at right, text *"Maa is next."* / *"Sunday, 6:30 pm · Weekly"* / buttons **"Call now"**, **"Edit plans"**. If nothing scheduled: *"No calls planned"* + **"Set up a call"**.
3. **Coming up (lg:col-span-4):** list with dot bullets on a dotted vertical line.
4. **Your people (lg:col-span-7):** 2-column person cards (avatar orb, name, presence line, presence dot, **Call now**). Hover: lift, orb brightens.
5. **Worth remembering this week (lg:col-span-5):** 3 memory notes in soft `bg-cream-100` cards with kind icons.
6. **Fresh from your calls (col-span-12):** vertical **dot timeline** (`before:` dotted line): each entry has date, person, one-line "What happened", update chips, **View summary**.
- Card base: `rounded-[24px] bg-cream-50 border border-cream-200 shadow-sm p-6 hover:shadow-md transition duration-200 ease-calm`; top inner highlight `shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]`.

**New-user dashboard (no people yet):** replace bento rows 2–6 with:
- A large illustrated empty state (sofa/phone scene, A3 #6), heading *"It starts with one person."*, button **"Add someone you love"**.
- **Getting started** card with dotted stepper and progress ring: ● *Add someone you love* → ● *Choose how Vaani sounds* → ● *Try your first call*. Completed steps turn sage with a check, ring animates.
- A dismissible tip glass card: *"Tip: write your notes like you'd tell a friend."*

Everything on screen uses `BlurReveal`/stagger on first paint, and route changes use the 350ms blur crossfade.

---

## G. Responsive & polish checklist
- Breakpoints: design at 390 / 768 / 1280. Hero preview card hidden below 640px, replaced by the orb + one glass chip.
- Sidebar becomes bottom tab bar on mobile with glass blur.
- Tap targets ≥ 44px; contrast AA on gradient (headline stays `ink`).
- Performance: MeshGradient blobs use `transform` only; pause blob animation when off-screen (`IntersectionObserver`) and under `prefers-reduced-motion`.
- Lighthouse target ≥ 90 mobile; lazy-load illustrations below the fold; use `next/image` for any raster.

---

## H. Paste-in prompt for Antigravity (run after the main build, or merge into steps 3–4, 5, 2)

````
Read /docs/VAANI_ADDENDUM_V2.md. It overrides visuals in /docs/VAANI_BRIEF.md where they conflict; all copy stays the same. Do the following in order and verify each:
1. Add tailwind keyframes/animation `blob`. Build components/motion/{blur-reveal}.tsx (BlurReveal, BlurWords) and components/marketing/mesh-gradient.tsx exactly as in the addendum. Replace every scroll animation on the landing page with BlurReveal/BlurWords.
2. Create illustration components in components/illustrations/ for the 8 scenes in section A3 (flat, no outlines, our palette, faceless-simple characters, role="img" + aria-label). If any illustration is not finished, use the icon-tile fallback so nothing is blank.
3. Rebuild the landing hero as the centered layout with MeshGradient, dot grid, "Built with AssemblyAI" pill, product-preview card with parallax, and floating props. Apply section upgrades from section C (bento How It Works with dotted SVG connector, gradient-border pricing card, MeshGradient final CTA).
4. Build the auth split-screen layout and /login and /signup pages from section D, including the rotating glass-card carousel and the blur-out "Creating your space…" transition. Wire to existing Supabase auth (Google, email/password, guest).
5. Add profiles.onboarded boolean default false. Build /welcome from section E with the shared-layoutId orb flight into the sidebar logo and staggered dashboard blur-in. Redirect first-time users there; mark onboarded on finish or skip.
6. Rebuild Home as the bento layout in section F including the ⌘K command palette, dot timeline, and the new-user empty state with Getting-started stepper and progress ring.
7. Responsive + reduced-motion + performance pass per section G at 390/768/1280.
````