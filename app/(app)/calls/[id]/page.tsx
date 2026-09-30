"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Share2,
  PhoneCall,
  Search,
  Check,
  X,
  Sparkles,
  BookHeart,
} from "lucide-react";
import type { TurnEvent, CallSummary } from "@/lib/types/call";

interface CallMemoryItem {
  id: string;
  content: string;
  kind?: string;
  saved?: boolean;
}

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params?.id as string;

  const [call, setCall] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [memories, setMemories] = useState<CallMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!callId) return;

    const fetchCallAndData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. Fetch Call & Person
        const { data: callData, error: callErr } = await supabase
          .from("calls")
          .select("*, people(*)")
          .eq("id", callId)
          .single();

        if (callErr) {
          console.warn("Could not load call from Supabase:", callErr.message);
        } else {
          setCall(callData);
        }

        // 2. Fetch Call Events / Turns
        const { data: eventRows } = await supabase
          .from("call_events")
          .select("*")
          .eq("call_id", callId)
          .order("created_at", { ascending: true });

        if (eventRows && eventRows.length > 0) {
          setEvents(eventRows);
        }

        // 3. Fetch Memories from this call
        const { data: memoryRows } = await supabase
          .from("memories")
          .select("*")
          .eq("call_id", callId);

        if (memoryRows && memoryRows.length > 0) {
          setMemories(
            memoryRows.map((m) => ({
              id: m.id,
              content: m.content,
              kind: m.kind,
              saved: true,
            }))
          );
        } else if (callData?.summary?.worth_remembering) {
          // Suggested memories from the actual summary
          const initialSuggestions = callData.summary.worth_remembering.map(
            (text: string, i: number) => ({
              id: `suggested-${i}`,
              content: text,
              kind: "moment",
              saved: false,
            })
          );
          setMemories(initialSuggestions);
        }
      } catch (err) {
        console.error("Error loading call details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCallAndData();
  }, [callId]);

  const person = call?.people || {
    name: "Loved one",
    nickname: "Loved one",
    relationship: "Family",
    phone_e164: "",
    tint: "#F2A65A",
  };

  const nickname = person.nickname || person.name || "Loved one";
  const summary: CallSummary | null = call?.summary || null;
  const moodNote: string | null = call?.mood_note || summary?.mood_note || null;

  // Stored real events
  const displayTurns: TurnEvent[] = useMemo(() => {
    if (events.length > 0) {
      return events
        .filter((e) => e.kind === "turn")
        .map((e) => ({
          id: e.id.toString(),
          speaker: e.speaker,
          text: e.text,
          at_ms: e.at_ms || 0,
          kind: "turn",
        }));
    }
    return [];
  }, [events]);

  // Filter transcript by search query
  const filteredTurns = useMemo(() => {
    if (!searchQuery.trim()) return displayTurns;
    const q = searchQuery.toLowerCase();
    return displayTurns.filter((t) => t.text.toLowerCase().includes(q));
  }, [displayTurns, searchQuery]);

  // Handle Keep Memory
  const handleKeepMemory = async (item: CallMemoryItem) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && call?.person_id) {
        await supabase.from("memories").insert({
          user_id: user.id,
          person_id: call.person_id,
          call_id: callId,
          content: item.content,
          kind: "moment",
          pinned: false,
        });
      }

      setMemories((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, saved: true } : m))
      );
      showToast("Got it. Vaani will remember that.");
    } catch {
      showToast("Got it. Vaani will remember that.");
    }
  };

  // Handle Forget Memory
  const handleForgetMemory = async (item: CallMemoryItem) => {
    try {
      if (item.saved && !item.id.startsWith("suggested")) {
        const supabase = createClient();
        await supabase.from("memories").delete().eq("id", item.id);
      }
      setMemories((prev) => prev.filter((m) => m.id !== item.id));
      showToast("Forgotten. Vaani won't bring it up.");
    } catch {
      showToast("Forgotten. Vaani won't bring it up.");
    }
  };

  // Share summary
  const handleShare = async () => {
    const text = `Vaani call summary with ${nickname}:\n${summary?.what_happened || ""}\n\nNote: "${moodNote || ""}"`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Call with ${nickname}`,
          text,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Summary copied to clipboard.");
    }
  };

  const formatTimestamp = (ms?: number) => {
    if (!ms) return "";
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-ink-soft">
        <p className="text-body animate-pulse">Gathering what you should know…</p>
      </div>
    );
  }

  // Handle No Answer / Declined empty state per Brief Section 5
  if (
    call?.status === "no_answer" ||
    call?.status === "declined" ||
    call?.status === "ringing_failed"
  ) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
        <div className="size-20 rounded-full bg-honey/10 text-honey mx-auto flex items-center justify-center">
          <PhoneCall className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-h3 text-ink font-medium">
            {nickname} didn&apos;t pick up.
          </h1>
          <p className="text-body text-ink-soft">
            {nickname} didn&apos;t pick up. That&apos;s okay. Want Vaani to try again in an hour?
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href={`/calls/new?personId=${call?.person_id || ""}`}>
            <Button variant="primary">Try again</Button>
          </Link>
          <Link href="/home">
            <Button variant="ghost">Back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle Failed Call empty state per Brief Section 5
  if (call?.status === "failed") {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
        <div className="size-20 rounded-full bg-rust/10 text-rust mx-auto flex items-center justify-center">
          <PhoneCall className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-h3 text-ink font-medium">
            Call not completed
          </h1>
          <p className="text-body text-ink-soft">
            That call didn&apos;t go through. Nothing was said, and nobody was bothered. Want to try again?
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href={`/calls/new?personId=${call?.person_id || ""}`}>
            <Button variant="primary">Try again</Button>
          </Link>
          <Link href="/home">
            <Button variant="ghost">Back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-content mx-auto pb-16">
      {/* 
        1. TOP ROW: BACK LINK, HEADLINE, CAPTION, STATUS, ACTIONS 
      */}
      <div className="space-y-4">
        <Link
          href={`/people?selected=${call?.person_id || ""}`}
          className="inline-flex items-center gap-1.5 text-small text-ink-soft hover:text-ink transition-colors font-medium"
        >
          <ArrowLeft className="size-4" />
          <span>← {nickname}</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
                Conversation with {nickname}
              </h1>
              <Chip variant="sage" size="sm" className="font-semibold">
                Completed
              </Chip>
            </div>
            <p className="text-small text-ink-soft flex items-center gap-2">
              <Calendar className="size-4 text-ink-faint" />
              <span>
                {call?.created_at
                  ? new Date(call.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
              <span>·</span>
              <Clock className="size-4 text-ink-faint" />
              <span>
                {call?.created_at
                  ? new Date(call.created_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
              <span>·</span>
              <span className="tabular-nums">
                {call?.duration_seconds
                  ? `${Math.max(1, Math.round(call.duration_seconds / 60))} min`
                  : "Check-in"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {summary && (
              <Button
                variant="quiet"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="size-4" />
                <span>Share summary</span>
              </Button>
            )}

            <Link href={`/calls/new?personId=${call?.person_id || ""}`}>
              <Button variant="primary" size="sm" className="gap-2 shadow-xs">
                <PhoneCall className="size-4" />
                <span>Call again</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 
        2. MAIN TWO-COLUMN GRID 
      */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT 7 COLS: TRANSCRIPT CARD */}
        <div className="lg:col-span-7">
          <Card className="rounded-[28px] bg-cream-50 border border-cream-200 shadow-sm overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 p-5 bg-cream-50/90 backdrop-blur-xl border-b border-cream-200/80 flex items-center justify-between gap-4">
              <h2 className="font-display text-h5 text-ink font-medium">
                Conversation
              </h2>

              {displayTurns.length > 0 && (
                <div className="relative max-w-xs w-full">
                  <Search className="size-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search this conversation"
                    className="w-full pl-9 pr-3 py-1.5 rounded-full bg-cream-100/70 border border-cream-200/80 text-small text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                  />
                </div>
              )}
            </div>

            <div className="p-6 space-y-5 max-h-[640px] overflow-y-auto">
              {filteredTurns.length === 0 ? (
                <div className="py-12 text-center text-ink-soft space-y-1">
                  <p className="text-body font-medium text-ink">
                    No conversations yet. Your first one is a few taps away.
                  </p>
                  <p className="text-small text-ink-faint">
                    Transcript turns will appear here as you speak with Vaani.
                  </p>
                </div>
              ) : (
                filteredTurns.map((turn) => {
                  const isVaani = turn.speaker === "vaani";
                  return (
                    <div
                      key={turn.id}
                      className={`flex items-start gap-3.5 ${
                        isVaani ? "pl-0" : "pl-3 md:pl-5"
                      }`}
                    >
                      <div className="shrink-0 mt-1">
                        {isVaani ? (
                          <div className="size-7 rounded-full bg-gradient-to-tr from-terracotta to-warm-amber shadow-xs flex items-center justify-center">
                            <span className="size-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <AvatarOrb
                            name={nickname}
                            tint={person.tint || "#F2A65A"}
                            size="sm"
                            className="!size-7"
                          />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-caption font-semibold uppercase tracking-wider text-ink-soft">
                            {isVaani ? "Vaani" : nickname}
                          </span>
                          {turn.at_ms > 0 && (
                            <span className="text-[11px] font-mono text-ink-faint">
                              {formatTimestamp(turn.at_ms)}
                            </span>
                          )}
                        </div>
                        <p className="text-body text-ink leading-relaxed">
                          {turn.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT 5 COLS: SUMMARY CARD & MEMORY PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-[28px] bg-cream-50 border border-cream-200 shadow-sm p-6 space-y-6">
            <h2 className="font-display text-h5 text-ink font-medium">
              Summary
            </h2>

            {!summary ? (
              <div className="py-8 text-center text-ink-soft space-y-1">
                <p className="text-body font-medium text-ink">
                  When Vaani finishes a call, the story shows up here.
                </p>
                <p className="text-small text-ink-faint">
                  Highlights and memories will be organized automatically.
                </p>
              </div>
            ) : (
              <>
                {moodNote && (
                  <div className="p-4 rounded-2xl bg-amber-soft/20 border border-amber-soft/40 space-y-1.5">
                    <div className="text-caption font-semibold uppercase tracking-wider text-terracotta-deep flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      <span>Vaani&apos;s note to you</span>
                    </div>
                    <p className="text-body font-display italic text-ink leading-relaxed">
                      &ldquo;{moodNote}&rdquo;
                    </p>
                  </div>
                )}

                {summary.what_happened && (
                  <div className="space-y-1.5">
                    <h3 className="text-caption font-semibold uppercase tracking-wider text-ink-faint">
                      What happened
                    </h3>
                    <p className="text-small text-ink leading-relaxed">
                      {summary.what_happened}
                    </p>
                  </div>
                )}

                {summary.important_updates && summary.important_updates.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-caption font-semibold uppercase tracking-wider text-ink-faint">
                      Important updates
                    </h3>
                    <ul className="space-y-1.5">
                      {summary.important_updates.map((update, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-small text-ink"
                        >
                          <span className="size-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                          <span>{update}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.worth_remembering && summary.worth_remembering.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-caption font-semibold uppercase tracking-wider text-ink-faint">
                      Things worth remembering
                    </h3>
                    <div className="space-y-2">
                      {summary.worth_remembering.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-cream-100 border border-cream-200/80 text-small text-ink flex items-start gap-2"
                        >
                          <Heart className="size-3.5 text-terracotta shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summary.next_call && summary.next_call.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-caption font-semibold uppercase tracking-wider text-ink-faint">
                      For your next call
                    </h3>
                    <ul className="space-y-1.5">
                      {summary.next_call.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-small text-ink-soft"
                        >
                          <span className="size-1.5 rounded-full bg-honey mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Memory Panel */}
          <Card className="rounded-[28px] bg-cream-50 border border-cream-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookHeart className="size-4 text-terracotta" />
                <h3 className="font-display text-h5 text-ink font-medium">
                  Vaani will remember
                </h3>
              </div>
              <span className="text-xs text-ink-faint">From this call</span>
            </div>

            {memories.length === 0 ? (
              <p className="text-small text-ink-faint py-3 italic">
                Nothing here yet. After your first call, Vaani will keep the little things that matter.
              </p>
            ) : (
              <div className="space-y-3">
                {memories.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200/80 space-y-2.5"
                  >
                    <p className="text-small text-ink leading-snug font-medium">
                      &ldquo;{item.content}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {item.saved ? (
                        <span className="text-xs text-sage font-medium flex items-center gap-1">
                          <Check className="size-3.5" />
                          Saved to memory
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint">Suggested</span>
                      )}

                      <div className="flex items-center gap-2">
                        {!item.saved && (
                          <button
                            type="button"
                            onClick={() => handleKeepMemory(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-50 hover:bg-white border border-cream-300 text-xs font-semibold text-terracotta transition-colors shadow-xs"
                          >
                            <Check className="size-3" />
                            <span>Keep</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleForgetMemory(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-cream-200 text-xs text-ink-faint hover:text-rust transition-colors"
                        >
                          <X className="size-3" />
                          <span>Forget</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-cream-50/90 backdrop-blur-xl border border-cream-200 shadow-lg text-small text-ink flex items-center gap-2 font-medium">
          <Check className="size-4 text-sage shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
