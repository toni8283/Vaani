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