# Vaani

**Vaani is an AI voice companion that calls the people you love on your behalf — catching up with elderly relatives, passing on a message, or just checking in.** It listens, understands, and gives you a warm summary of how the conversation went, so you stay close even when life is busy.

> Built for the [lablab.ai × AssemblyAI hackathon](https://lablab.ai).

---

## How it works

1. **Create a person** — add a name, relationship and a few notes (optional phone number).
2. **Start a call** — describe what you'd like Vaani to say or ask.
3. **Accept the call** in your browser — your mic streams audio to the call server, which bridges it to AssemblyAI's Voice Agent API. Vaani speaks and listens in real time.
4. **End the call** — a written summary appears within seconds; the transcript is saved to your dashboard.

---

## Architecture

```
Browser (Next.js 14)
  │  getUserMedia → WebSocket (useBrowserCall)
  │
  ▼
vaani-call-server  (Express + ws)
  │  /browser-stream  — bidirectional 24 kHz PCM16 WebSocket
  │  /calls/:id/*     — protected REST routes (x-api-secret)
  │
  ▼
AssemblyAI Voice Agent API
  (real-time STT + LLM + TTS in one WebSocket session)
  │
  ▼
Supabase  (Postgres + Realtime + Auth)
  Stores: users, people, calls, transcripts, summaries
  Realtime subscription drives the live-call page and summary state.
```

The **Next.js app** (this repo) handles auth, the wizard UI, the live-call page, and server-side API routes that proxy protected actions to the call server with a shared secret (`CALL_SERVER_SECRET`) that never touches the browser.

The **call server** lives in a companion repo (see below).

---

## Run locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- The [vaani-call-server](https://github.com/toni8283/vaani-call-server) running (see its README)

### 1 — Clone and install

```bash
git clone https://github.com/toni8283/Vaani.git
cd Vaani
npm install
```

### 2 — Environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (**server-only — never expose to browser**) |
| `CALL_SERVER_URL` | HTTP URL of the call server, e.g. `http://localhost:8080` |
| `CALL_SERVER_SECRET` | Shared secret matching `CALL_SERVER_SECRET` in the call server |
| `NEXT_PUBLIC_CALL_SERVER_WS_URL` | WebSocket URL of the call server, e.g. `ws://localhost:8080` |
| `NEXT_PUBLIC_PHONE_CALLS` | Set `"true"` to enable the Twilio phone path (see Scope below) |

### 3 — Database migrations

Run the SQL files in `supabase/migrations/` in order against your Supabase project (via the Supabase SQL editor or `supabase db push`).

### 4 — Start

```bash
# Terminal 1 — call server
cd ../vaani-call-server && npm run dev

# Terminal 2 — Next.js app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scope note

**The browser call is the demo path.** When `NEXT_PUBLIC_PHONE_CALLS` is not set (default), the app places calls entirely through the browser: your microphone streams to the call server, and you hear Vaani's voice through your speakers. No phone number required.

**The Twilio phone path** (Vaani calls a real phone number) is behind `NEXT_PUBLIC_PHONE_CALLS=true`. It is implemented but **not demo-ready** — it requires a Twilio account, a purchased number, and a publicly reachable call-server URL (e.g. via ngrok or a deployed instance). Do not enable it for a demo unless you have all three set up and tested.

---

## Companion repo

The call server that bridges the browser to AssemblyAI is in a separate repo:
**[vaani-call-server](https://github.com/toni8283/vaani-call-server)** _(companion local repo — not yet published)_

---

## Tech stack

- [Next.js 14](https://nextjs.org) App Router · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion
- [Supabase](https://supabase.com) — auth, Postgres, Realtime
- [AssemblyAI Voice Agent API](https://www.assemblyai.com) — real-time speech-to-text, LLM, and text-to-speech
- Twilio (optional, behind `NEXT_PUBLIC_PHONE_CALLS`)
