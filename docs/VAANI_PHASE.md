# VAANI — Antigravity Phase Pack
*Six copy-paste prompts, run strictly one at a time. Never paste the next phase until the current one passes its checklist.*

---

## 0. Repo setup (10 minutes, you do this, not Antigravity)

```
vaani/
  docs/
    VAANI_BRIEF.md          <- main brief (Sections 1-6)
    VAANI_ADDENDUM_V2.md    <- premium visual pass (wins on conflicts)
    RULES.md                <- the rules block below
  public/
    brand/                  <- logo-mark.svg, logo-wordmark.svg, favicon.svg, og.png (optional; Phase 1 creates them if missing)
    illustrations/          <- your SVGs (see asset plan)
    audio/                  <- sample-call.mp3, voice-claire.mp3, voice-ivy.mp3, voice-dawn.mp3 (optional)
```
Run `git init`. Tell Antigravity to **commit after every phase** so you can roll back a bad phase in one command.

### docs/RULES.md (paste exactly)
```
VAANI BUILD RULES (apply to every phase)
1. Source of truth: /docs/VAANI_BRIEF.md and /docs/VAANI_ADDENDUM_V2.md. Addendum wins on conflicts. Use exact copy, tokens, hex values, and Tailwind classes from them. No placeholder text, no lorem ipsum, ever.
2. Stack is fixed: Next.js 14 App Router, TypeScript (strict), Tailwind, shadcn/ui (restyled to our tokens), Framer Motion, Supabase, lucide-react. Do not add other UI libraries. Small utility packages are OK only if needed (libphonenumber-js, clsx).
3. Only do the current phase. Do not build ahead, do not refactor earlier phases unless a checklist item fails. Do not delete or rename files from earlier phases.
4. UI language: People and Conversations. Never show the words "agent", "workflow", "execution", "telemetry", "prompt", "model" to users.
5. Every animation uses the tokens (ease-calm, durations) and BlurReveal/BlurWords from the addendum. Respect prefers-reduced-motion.
6. Mobile-first: everything must work at 390px, 768px, 1280px.
7. Never use localStorage for app data. Secrets only in .env.local; never expose the Supabase service-role key or any API key to the browser.
8. Missing assets: never leave a blank space. Use the fallback system from Phase 1 (lib/assets.ts).
9. End every phase by: running typecheck + lint + build, fixing errors, committing with message "phase N: <name>", then replying with (a) files created, (b) checklist results, (c) anything you couldn't do. Then STOP and wait. Do not start the next phase.
```

---

## Asset plan (answers "should I provide it or will it do its own?")

**My recommendation: split it by what each side does best.**

| Asset | Who | How |
|---|---|---|
| **Logo** (orb mark + "Vaani" wordmark, favicon) | Antigravity, Phase 1 | Simple gradient orb + Fraunces text. Easy to generate well as SVG. If you want to hand-polish it in Figma later, just replace `public/brand/*.svg`. |
| **Orb, gradients, grain, dots** | Antigravity (code) | It's components and CSS, no files. |
| **Icons** | Antigravity | `lucide-react` icons inside gradient tiles. Zero image files. |
| **Person avatars** | Antigravity | Tinted mini orb + initials. No photos. |
| **Illustrations (about 11 SVGs)** | **You** | AI-written SVG illustration is usually the weakest part of a generated UI. Use a free set (unDraw, Open Doodles, Storyset; check each license), recolor to our palette in Figma or the site's color picker, export SVG, drop in `/public/illustrations/` with the exact filenames below. If a file is missing, the app uses a fallback so nothing breaks. |
| **Audio** (sample call, 3 voice previews) | **You** | Record one real Vaani call for the landing sample; record short greetings for each voice. If missing, the "Hear a sample" and "▶ sample" buttons are hidden. |
| **OG image** (1200×630) | Later | Screenshot of the hero. |

**Illustration filenames** (SVG, transparent background, ≤ 60 KB, palette: terracotta, amber, apricot, coral, cream, one accent):
`hero-phone.svg` · `hero-chai.svg` · `hero-plant.svg` · `hero-note.svg` · `problem-desk.svg` · `step-1-contact.svg` · `step-2-note.svg` · `step-3-envelope.svg` · `demo-sofa.svg` · `cta-phones.svg` · `empty-people.svg`

You can start with zero illustrations and add them any time: flip the flags in `lib/assets.ts` (Phase 1 creates it) to `true`.

---

## Order of work

| Phase | What | Can run in parallel? |
|---|---|---|
| 1 | Foundation: tokens, fonts, motion, orb, logo, asset system | no |
| 2 | Landing page | no |
| 3 | Supabase, auth pages, welcome animation | no |
| 4 | App shell, Home, People, Create Call wizard, seed data | no |
| 5 | Live call screen, Call detail, Memory, Settings, demo mode | no |
| 6 | Call server (Twilio + AssemblyAI + summary + SMS) | **Yes: start it in a second agent right after Phase 3** (it needs the DB schema only) |

Because telephony is the riskiest part, I'd start Phase 6 in a separate Antigravity agent right after Phase 3 finishes, so it is working while phases 4–5 build the UI.

---

## PHASE 1 — Foundation

```
Read /docs/RULES.md, /docs/VAANI_BRIEF.md (Section 1) and /docs/VAANI_ADDENDUM_V2.md (sections A, B). Follow RULES.md.

PHASE 1: FOUNDATION. Build ONLY this:
1. Scaffold Next.js 14 (App Router, TypeScript strict, Tailwind, ESLint). Install: framer-motion, lucide-react, tailwindcss-animate, clsx, tailwind-merge, @supabase/supabase-js, @supabase/ssr. Init shadcn/ui and restyle its tokens to ours.
2. Paste tailwind.config.ts from Brief Section 1.2 exactly, then add the `blob` keyframes/animation from Addendum section C. Load fonts with next/font/google: Fraunces (axes opsz, SOFT; --font-fraunces) and Instrument Sans (--font-instrument). Global CSS: cream background, ink text, selection color terracotta-subtle, grain overlay component (fixed, pointer-events-none, opacity 0.035), reduced-motion rules.
3. Components (components/ui and components/motion): Button (primary, ghost, quiet; rounded-full; hover lift), Input, Chip, Card, Toggle, Accordion, Dialog, Toast (glass), IconTile (gradient tile with lucide icon), PresenceDot, Avatar-Orb (small tinted orb, optional initials).
4. components/motion: BlurReveal and BlurWords exactly as in Addendum section B. components/marketing/mesh-gradient.tsx exactly as in Addendum section C.
5. components/call/vaani-orb.tsx exactly as in Brief Section 4 (all states, spring, ripples).
6. Brand: create public/brand/logo-mark.svg (gradient orb #FFE3BD to #F2A65A to #C4622D), logo-wordmark.svg (mark + "Vaani" in Fraunces, outlined paths or text), favicon.svg, and a <Logo /> component (breathing orb + wordmark).
7. Asset fallback system: lib/assets.ts exporting `illustrations` = { "hero-phone": false, "hero-chai": false, "hero-plant": false, "hero-note": false, "problem-desk": false, "step-1-contact": false, "step-2-note": false, "step-3-envelope": false, "demo-sofa": false, "cta-phones": false, "empty-people": false } and `audio` = { sample: false, claire: false, ivy: false, dawn: false }. Build <Illustration name="..." className /> which renders /illustrations/{name}.svg (next/image, priority false) when its flag is true, otherwise a soft fallback: a rounded gradient blob (apricot/coral) with a centered lucide icon that fits the scene. Then scan /public/illustrations and /public/audio and set flags to true for files that exist.
8. A dev page /dev/kitchen-sink showing: every button, input, chip, card, toggle, accordion, dialog, toast, icon tiles, avatars, all 6 orb states (with a slider for level), MeshGradient, BlurReveal and BlurWords demos, and every Illustration name.

ACCEPTANCE (verify and report each):
[ ] npm run build passes, no TS errors
[ ] /dev/kitchen-sink renders and matches the tokens (cream, terracotta, Fraunces headings)
[ ] Orb states: idle breathes, dialing ripples, speaking scales with slider, listening contracts, thinking speeds sheen, ending dims
[ ] BlurWords/BlurReveal blur then sharpen on scroll, and just fade under reduced motion
[ ] Fallback illustrations show when files are missing (no blank areas)
[ ] Nothing from later phases exists (no landing page, no auth)
Commit "phase 1: foundation". Report and STOP.
```

---

## PHASE 2 — Landing page

```
Read /docs/RULES.md, /docs/VAANI_BRIEF.md (Section 2) and /docs/VAANI_ADDENDUM_V2.md (sections A, B, C, G). Follow RULES.md.

PHASE 2: LANDING PAGE at app/(marketing)/page.tsx. Build ONLY this:
1. Sticky frosted navigation exactly per Brief Section 2 (Logo, links How it works / Trust / Pricing, ghost "Sign in", primary "Set up Vaani", mobile sheet). Buttons link to /login and /signup (pages come in Phase 3, so use plain links for now).
2. Hero, rebuilt per Addendum section C: centered layout, MeshGradient + dot grid, "Built with AssemblyAI Voice Agent API" pill, exact headline/body/CTAs from the Brief, phone pill "Let Vaani call you" (UI only for now: validate E.164 with libphonenumber-js, show a toast "Coming together in the next step" on submit), the product-preview browser-frame card showing a static version of the live call screen (orb + 3 transcript lines) with scroll parallax, floating <Illustration> props (hero-phone, hero-chai, hero-plant, hero-note) hidden below md, and the strip below the hero.
3. Sections 2 to 8 with the exact headlines, body copy, CTAs, containers, and layouts from Brief Section 2, upgraded per Addendum section C (bento How It Works with dotted SVG connector that draws on scroll; demo transcript typing in line by line and summary card blurring up; trust icon tiles; pricing with gradient-border Family card; FAQ accordion; final CTA with MeshGradient and cta-phones illustration). Footer.
4. All text entrances use BlurWords (headlines) and BlurReveal (everything else) with staggers per the addendum. Anchor links scroll smoothly. Add page metadata (title, description, OG tags).

ACCEPTANCE:
[ ] All 8 sections + nav + footer present with exact Brief copy (spot-check 5 headlines)
[ ] Looks correct at 390, 768, 1280 (no horizontal scroll, hero preview hidden on small screens)
[ ] Scroll: text blurs in then sharpens; nothing animates twice
[ ] Every illustration slot shows a fallback if the file is missing
[ ] Lighthouse mobile performance >= 85 (report the number)
[ ] No auth, no Supabase calls yet
Commit "phase 2: landing". Report and STOP.
```

---

## PHASE 3 — Database, auth, welcome

```
Read /docs/RULES.md, /docs/VAANI_BRIEF.md (Section 6: SUPABASE SCHEMA and RLS NOTES) and /docs/VAANI_ADDENDUM_V2.md (sections D, E). Follow RULES.md.

PHASE 3: SUPABASE + AUTH + WELCOME. Build ONLY this:
1. supabase/migrations/001_init.sql with the exact schema from Brief Section 6 (profiles, people, calls, call_events, memories), plus: profiles.onboarded boolean default false; trigger to create a profile on auth.users insert (is_guest from is_anonymous); RLS enabled on all tables with the policies from the RLS NOTES; Realtime enabled on calls and call_events. Write README steps for me to run it and to enable Anonymous sign-ins and Google OAuth in the Supabase dashboard. Add .env.example (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_DEMO_MODE, CALL_SERVER_URL).
2. lib/supabase/client.ts, server.ts, middleware helper. middleware.ts protecting the (app) routes; unauthenticated users go to /login.
3. Auth pages in app/(auth): shared split-screen layout, /login and /signup exactly per Addendum section D (Google, email + password with strength bar, "Continue as guest" via signInAnonymously, right-side MeshGradient + orb + rotating glass-card carousel, blur-out "Creating your space…" transition). Error and loading copy from Brief Section 5.
4. Wire the landing page CTAs and the hero phone pill: submitting the pill signs in as guest if needed, then routes to /signup-free flow placeholder /calls/new (page comes in Phase 4; if it doesn't exist yet, route to /home).
5. /welcome per Addendum section E (shared layoutId orb flight, blur-in sequence, Skip). First-time users are redirected here; on finish or skip set profiles.onboarded = true. Create a minimal (app) layout and a temporary /home page that only says the greeting, so the flight has a destination.
6. Guest banner component: "You're a guest. Save your people →" that links the guest identity to email/Google.

ACCEPTANCE:
[ ] Migration runs cleanly on a fresh Supabase project (give me the exact steps)
[ ] Sign up with email, log in, Google login, and guest each work
[ ] A guest can only read/write their own rows (test by creating two guests; report the result)
[ ] /welcome plays once, then never again for that user; Skip works
[ ] Auth pages look right at 390/768/1280 and the right panel hides on mobile
[ ] Service-role key never appears in client code (grep and report)
Commit "phase 3: auth". Report and STOP.
```

*After Phase 3 passes: open a second Antigravity agent for Phase 6 while continuing 4 and 5 in the first.*

---

## PHASE 4 — Dashboard, People, Create Call wizard

```
Read /docs/RULES.md, /docs/VAANI_BRIEF.md (Section 3.1, 3.2, 3.3 and Section 5) and /docs/VAANI_ADDENDUM_V2.md (section F). Follow RULES.md.

PHASE 4: APP SHELL, HOME, PEOPLE, WIZARD. Build ONLY this:
1. App shell: glass top bar with the ⌘K command palette (search people, "Call {name} now", "Add someone"), "New call" button, sidebar (72px tablet / 256px desktop; bottom tab bar on mobile) with Home, People, Memory, Settings. Memory and Settings pages can be simple stubs titled correctly.
2. Home as the bento layout from Addendum section F: greeting with BlurWords, Next-up hero card, Coming up with dotted timeline, Your people cards with presence lines and PresenceDot, Worth remembering, Fresh from your calls dot timeline. Real data from Supabase. New-user state: illustrated empty state (empty-people) + Getting started stepper with animated progress ring.
3. People: master-detail per Brief 3.2 (list + search + detail with all blocks, Call now / Schedule / Edit / Remove with confirm). Add/Edit person dialog.
4. Create Call wizard at /calls/new: 4 steps per Brief 3.3 with slide+fade transitions, exact copy, voice cards (voices: claire, ivy, dawn; show "▶ Hear a sample" only if audio flags are true), tone chips, language select, tap-to-add suggestion chips, "A message from you" field, required consent checkbox, review card sentence generated from the inputs. On submit: create/reuse the person row, insert a calls row (status connecting for "Right now", scheduled otherwise), then navigate to /calls/{id}/live (built in Phase 5; until then route to /calls/{id}).
5. Seed: `npm run seed` script that creates for the signed-in user (or a given email): person "Maa" (phone from SEED_PHONE env), 2 completed calls with realistic summaries, 6 memories including "Trouble sleeping. Improving since the new pillow." and "Meena's wedding is on the 14th.", and a weekly Sunday 6:30 pm schedule. Idempotent.

ACCEPTANCE:
[ ] New user sees the illustrated empty state and Getting started stepper; after running seed, Home shows the full bento with real data
[ ] Wizard validates phone (E.164), requires consent, and creates the rows correctly (show me the inserted call row)
[ ] ⌘K opens, searches people, and navigates
[ ] All empty states use Brief Section 5 copy
[ ] Works at 390/768/1280; bottom tab bar on mobile
Commit "phase 4: dashboard". Report and STOP.
```

---

## PHASE 5 — Live call, Call detail, Memory, Settings, demo mode

```
Read /docs/RULES.md, /docs/VAANI_BRIEF.md (Sections 3.4, 3.5, 3.6, 4 and 5). Follow RULES.md.

PHASE 5: LIVE CALL, CALL DETAIL, MEMORY, SETTINGS, DEMO MODE. Build ONLY this:
1. Live call screen /calls/[id]/live implementing all 6 states from Brief Section 4 exactly (container classes, copy, timings, orb behavior, memory chip, summary reveal with the orb shrinking into the card). Drive it from one hook `useCallStream(callId)` that subscribes to: calls.status (Realtime postgres_changes), call_events inserts, and Broadcast channel `call:{id}` events {speaker, level}. Map status and events to UI states; "thinking" appears after 600ms of silence between turns.
2. DEMO MODE: when NEXT_PUBLIC_DEMO_MODE=true, `useCallStream` uses lib/demo/simulator.ts instead: it plays the full Maa transcript from Brief Section 2 with realistic timings (dial 4s, live about 60s, one memory_used event "Vaani remembered: trouble sleeping last week"), fake amplitude, then the summary from Section 2 and the toast "Summary sent to your phone." Same hook interface, so the UI is identical. Add a hidden shortcut (press D three times) to toggle demo mode at runtime.
3. Call detail /calls/[id] per Brief 3.4: transcript with search, four-block summary, "Vaani's note to you", Worth a look ribbon, memory panel with Keep / Forget writing to memories, Call again, Share summary (copy link).
4. Memory page per Brief 3.5: grid, person filter chips, edit/pin/forget, add dialog, master toggle writing profiles.memory_enabled, banners and toasts with exact copy.
5. Settings per Brief 3.6: all sections wired where simple (name, notifications, memory toggle, quiet hours saved to profiles, Delete account with confirm, Download my data as JSON).
6. Error states for a failed / no-answer / declined call using Brief Section 5 copy.

ACCEPTANCE:
[ ] With DEMO MODE on, starting a call from the wizard plays the entire story end to end and lands on the summary reveal (record a 30-second screen capture description or screenshots)
[ ] Orb visibly reacts to speaking / listening / thinking
[ ] Forgetting a memory removes it and the toast appears
[ ] Every screen has loading, empty, and error states with brief copy
[ ] 390/768/1280 all fine; reveal animation smooth on mobile
Commit "phase 5: live call and detail". Report and STOP.
```

---

## PHASE 6 — Call server (run in a parallel agent after Phase 3)

```
Read /docs/RULES.md and /docs/VAANI_BRIEF.md (Section 0 technical reality check, Section 6 step 10 and VOICE PROMPT TEMPLATE). Follow RULES.md. This phase lives ONLY in /call-server (a separate Node + TypeScript service). Do not edit the Next.js app.

PHASE 6: CALL SERVER. Start from AssemblyAI's official example (github.com/AssemblyAI/voice-agent-api-twilio-example) and adapt it. Build ONLY this:
1. Express + ws server with: POST /calls/start {callId} (loads call + person + user + memories from Supabase using the service role key; refuses if the person's consent_confirmed is false; refuses outside quiet hours), POST /outbound-twiml, WS /outbound-stream (bridge Twilio Media Streams to the AssemblyAI Voice Agent API, audio/pcmu passthrough, send Twilio "clear" on barge-in), POST /call-status.
2. Compile the voice prompt and greeting from the VOICE PROMPT TEMPLATE (never show it to users). Use the person's voice (lowercase name) and tone. Expose tools remember(note) and flag_attention(reason); always send a tool result back.
3. During the call: update calls.status (connecting, ringing, live, ending, completed / no_answer / failed / declined); insert call_events per finalized turn with speaker, text, at_ms; insert a kind="memory_used" event when the agent uses memory; broadcast {speaker, level} about 10 times per second on Supabase channel `call:{id}`.
4. On hangup: summarize the transcript with an LLM (JSON only): {what_happened, important_updates[], worth_remembering[], next_call[], mood_note, needs_attention}; save to calls.summary and mood_note; insert new memories only if profiles.memory_enabled and people.memory_enabled; send the SMS with Twilio using the templates in Brief Section 5 (link {link} = APP_URL/calls/{id}); finally set status completed and duration.
5. Safety: the first spoken sentence must say it is an AI calling on the user's behalf; if the person asks to stop being called, end kindly and set needs_attention with reason.
6. .env.example (ASSEMBLYAI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LLM_API_KEY, APP_URL, HOSTNAME), a README with ngrok + Twilio webhook setup, and a `npm run test-call -- +91XXXXXXXXXX` script that places a test call with a default prompt (no Supabase needed) so I can verify telephony before wiring the UI.

ACCEPTANCE:
[ ] `npm run test-call` rings my phone, Vaani speaks first and introduces itself as an AI, and I can interrupt it
[ ] A call started from the app updates calls.status live and inserts call_events I can see appearing in Supabase
[ ] Hanging up produces a saved summary, new memories, and an SMS
[ ] no_answer and failed paths set the right status
[ ] Service role key exists only in /call-server env
Commit "phase 6: call server". Report and STOP.
```

---

## Final integration pass (after all six)
Tell Antigravity: *"Integration pass: run the full flow with NEXT_PUBLIC_DEMO_MODE=false against a real phone, fix any mismatch between the UI and the call server events, then run through the demo script in Brief Section 0 twice and fix anything that stutters. Do not add features."*

## If a phase goes wrong
- `git reset --hard HEAD~1` returns to the last good phase.
- Re-run the phase with one extra line: *"Last attempt failed at: {problem}. Fix only that."*
- Never let it "fix" earlier phases unless a checklist item fails.