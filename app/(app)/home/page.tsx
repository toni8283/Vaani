"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BlurWords, BlurReveal } from "@/components/motion/blur-reveal";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { PresenceDot } from "@/components/ui/presence-dot";
import { Illustration } from "@/components/ui/illustration";
import { GettingStartedCard } from "@/components/app/getting-started-card";
import { PersonDialog, type PersonRecord } from "@/components/app/person-dialog";
import {
  PhoneCall,
  Calendar,
  Sparkles,
  Heart,
  Bookmark,
  BookHeart,
  Plus,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface PersonWithCalls extends PersonRecord {
  calls?: CallRecord[];
  lastCall?: CallRecord | null;
}

interface CallSummary {
  what_happened?: string;
  important_updates?: string[];
  worth_remembering?: string[];
  next_call?: string[];
}

interface CallRecord {
  id: string;
  user_id: string;
  person_id: string;
  status: string;
  notes?: string | null;
  personal_message?: string | null;
  scheduled_for?: string | null;
  recurrence?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  summary?: CallSummary | null;
  mood_note?: string | null;
  needs_attention?: boolean;
  created_at: string;
  is_demo?: boolean;
  people?: {
    name: string;
    nickname?: string | null;
    relationship: string;
    tint?: string;
  } | null;
}

interface MemoryRecord {
  id: string;
  person_id: string;
  content: string;
  kind?: string;
  pinned?: boolean;
  created_at: string;
  people?: {
    name: string;
    nickname?: string | null;
    tint?: string;
  } | null;
}

export default function HomePage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState<string>("there");
  const [greeting, setGreeting] = useState<string>("Good evening");
  const [people, setPeople] = useState<PersonWithCalls[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPersonOpen, setAddPersonOpen] = useState(false);

  useEffect(() => {
    // Time-aware greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const loadData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 1. Profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", user.id)
            .single();

          if (profile?.display_name) {
            setDisplayName(profile.display_name);
          } else {
            const metaName =
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0];
            if (metaName) setDisplayName(metaName);
          }

          // 2. People
          const { data: peopleData } = await supabase
            .from("people")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          // 3. Calls
          const { data: callsData } = await supabase
            .from("calls")
            .select("*, people(name, nickname, relationship, tint)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          // 4. Memories
          const { data: memoriesData } = await supabase
            .from("memories")
            .select("*, people(name, nickname, tint)")
            .eq("user_id", user.id)
            .order("pinned", { ascending: false })
            .order("created_at", { ascending: false });

          const allCalls: CallRecord[] = callsData || [];
          setCalls(allCalls);
          setMemories(memoriesData || []);

          // Match last call for each person
          const peopleWithCalls: PersonWithCalls[] = (peopleData || []).map((p) => {
            const personCalls = allCalls.filter((c) => c.person_id === p.id);
            const completed = personCalls.filter((c) => c.status === "completed");
            return {
              ...p,
              calls: personCalls,
              lastCall: completed[0] || null,
            };
          });

          setPeople(peopleWithCalls);
        }
      } catch (err) {
        console.error("Error loading home dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute active call in progress
  const activeCall = useMemo(() => {
    return calls.find((c) =>
      ["connecting", "ringing", "live"].includes(c.status)
    );
  }, [calls]);

  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [activeMemory, setActiveMemory] = useState<string | null>(null);

  // Realtime subscription for active call transcript & memory
  useEffect(() => {
    if (!activeCall) {
      setActiveEvents([]);
      setActiveMemory(null);
      return;
    }

    const supabase = createClient();

    // 1. Load initial events
    supabase
      .from("call_events")
      .select("*")
      .eq("call_id", activeCall.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setActiveEvents(data);
          const memory = data.filter((e) => e.kind === "memory_used").pop();
          if (memory) setActiveMemory(memory.text);
        }
      });

    // 2. Realtime inserts for call_events
    const eventsCh = supabase
      .channel(`home_active_call_events_${activeCall.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_events",
          filter: `call_id=eq.${activeCall.id}`,
        },
        (payload) => {
          const newEv = payload.new as any;
          setActiveEvents((prev) => [...prev, newEv]);
          if (newEv.kind === "memory_used") {
            setActiveMemory(newEv.text);
          }
        }
      )
      .subscribe();

    // 3. Realtime updates for call row
    const callCh = supabase
      .channel(`home_active_call_status_${activeCall.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          filter: `id=eq.${activeCall.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setCalls((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsCh);
      supabase.removeChannel(callCh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall?.id]);

  // Compute next up call
  const nextScheduledCall = useMemo(() => {
    const scheduled = calls.filter(
      (c) => c.status === "scheduled" && c.scheduled_for
    );
    if (scheduled.length === 0) return null;
    // sort earliest
    return scheduled.sort(
      (a, b) =>
        new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime()
    )[0];
  }, [calls]);

  // Compute upcoming calls list
  const upcomingCalls = useMemo(() => {
    return calls
      .filter((c) => c.status === "scheduled")
      .slice(0, 4);
  }, [calls]);

  // Compute fresh completed calls
  const freshCalls = useMemo(() => {
    return calls.filter((c) => c.status === "completed").slice(0, 4);
  }, [calls]);

  // Helpers for presence line & dot
  const getPresence = (lastCall?: CallRecord | null) => {
    if (!lastCall || !lastCall.started_at) {
      return {
        line: "Never spoke yet",
        status: "honey" as const,
        customColor: "bg-cream-200 border border-cream-300",
      };
    }

    const diffDays = Math.floor(
      (Date.now() - new Date(lastCall.started_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const dayName = new Date(lastCall.started_at).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const mood = lastCall.mood_note
      ? lastCall.mood_note.toLowerCase().includes("cheerful")
        ? "sounded cheerful"
        : "in good spirits"
      : "sounded cheerful";

    const timeText = diffDays === 0 ? "today" : diffDays === 1 ? "yesterday" : dayName;

    return {
      line: `Last spoke ${timeText} · ${mood}`,
      status: diffDays <= 3 ? ("sage" as const) : ("honey" as const),
    };
  };

  const handlePersonAdded = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. GREETING ROW (col-span-12) */}
      <div className="pt-2">
        <h1 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
          <BlurWords text={`${greeting}, ${displayName}.`} />
        </h1>
        <p className="text-body text-ink-soft mt-1">
          Here&apos;s who you&apos;ve been thinking about.
        </p>
      </div>

      {/* CALL IN PROGRESS PANEL */}
      {activeCall && (
        <BlurReveal delay={0.05}>
          <div className="relative overflow-hidden rounded-[28px] p-6 md:p-7 border border-warm-amber/40 bg-gradient-to-r from-cream-50 via-cream-100 to-amber-soft/20 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <AvatarOrb
                    name={
                      activeCall.people?.nickname ||
                      activeCall.people?.name ||
                      "Loved one"
                    }
                    tint={activeCall.people?.tint || "#F2A65A"}
                    size="md"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-sage ring-2 ring-cream-50 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-terracotta uppercase tracking-wider">
                      Call in progress
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-terracotta/10 text-terracotta">
                      {activeCall.status === "live"
                        ? "Live conversation"
                        : activeCall.status === "ringing"
                        ? "Ringing…"
                        : "Connecting…"}
                    </span>
                  </div>
                  <h3 className="font-display text-h4 text-ink font-medium mt-0.5">
                    Checking in with {activeCall.people?.nickname || activeCall.people?.name || "loved one"}
                  </h3>
                </div>
              </div>

              <Link href={`/calls/${activeCall.id}/live`}>
                <Button variant="primary" size="default" className="gap-2 shadow-xs">
                  <PhoneCall className="size-4" />
                  <span>Open live call</span>
                </Button>
              </Link>
            </div>

            {/* Memory chip if triggered */}
            {activeMemory && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-50 border border-warm-amber/50 shadow-xs text-xs font-medium text-ink">
                <BookHeart className="size-3.5 text-terracotta shrink-0" />
                <span>{activeMemory}</span>
              </div>
            )}

            {/* Live streaming transcript preview */}
            <div className="rounded-2xl bg-cream-50/80 border border-cream-200/80 p-4 space-y-2 max-h-40 overflow-y-auto">
              {activeEvents.length === 0 ? (
                <p className="text-xs text-ink-faint italic">
                  Connecting audio stream. Conversation turns will stream here…
                </p>
              ) : (
                activeEvents
                  .filter((e) => e.kind === "turn")
                  .slice(-4)
                  .map((ev) => (
                    <div key={ev.id} className="text-xs leading-relaxed flex items-start gap-2">
                      <span className="font-semibold text-ink-faint uppercase tracking-wider shrink-0 text-[10px] mt-0.5">
                        {ev.speaker === "vaani"
                          ? "Vaani"
                          : activeCall.people?.nickname || "Person"}
                        :
                      </span>
                      <span className="text-ink">{ev.text}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </BlurReveal>
      )}

      {/* NEW USER STATE: No people added yet */}
      {!loading && people.length === 0 ? (
        <div className="space-y-8">
          <BlurReveal delay={0.1}>
            <div className="rounded-[32px] bg-cream-50 border border-cream-200/90 shadow-sm p-8 md:p-12 text-center flex flex-col items-center">
              <div className="w-48 h-36 mb-4 flex items-center justify-center">
                <Illustration name="empty-people" width={220} height={160} />
              </div>
              <h2 className="font-display text-h3 text-ink font-medium">
                It starts with one person.
              </h2>
              <p className="text-body text-ink-soft max-w-md mx-auto mt-2 mb-6">
                Who would you love to check in on today?
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setAddPersonOpen(true)}
                className="gap-2 shadow-sm"
              >
                <Plus className="size-5" />
                <span>Add someone you love</span>
              </Button>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.25}>
            <GettingStartedCard
              peopleCount={0}
              callsCount={calls.length}
              onAddPerson={() => setAddPersonOpen(true)}
            />
          </BlurReveal>
        </div>
      ) : (
        /* BENTO DASHBOARD FOR USERS WITH DATA */
        <div className="grid gap-6 lg:grid-cols-12 auto-rows-min">
          {/* 2. NEXT-UP HERO CARD (lg:col-span-8) */}
          <BlurReveal delay={0.1} className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-[28px] p-7 md:p-9 border border-white/70 bg-cream-50 shadow-md">
              <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
                <MeshGradient />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4 max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100/90 border border-cream-200 text-xs font-semibold text-terracotta uppercase tracking-wider">
                    <Clock className="size-3.5" />
                    <span>Next up</span>
                  </div>

                  {nextScheduledCall ? (
                    <>
                      <h2 className="font-display text-h3 md:text-4xl text-ink font-medium leading-tight">
                        {nextScheduledCall.people?.nickname ||
                          nextScheduledCall.people?.name ||
                          "Maa"}{" "}
                        is next.
                      </h2>
                      <p className="text-body text-ink-soft">
                        {new Date(nextScheduledCall.scheduled_for!).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}{" "}
                        ·{" "}
                        {nextScheduledCall.recurrence?.includes("weekly")
                          ? "Weekly"
                          : "Scheduled"}
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <Link
                          href={`/calls/new?personId=${nextScheduledCall.person_id}&now=true`}
                        >
                          <Button variant="primary" size="default" className="gap-2">
                            <PhoneCall className="size-4" />
                            <span>Call now</span>
                          </Button>
                        </Link>
                        <Link href={`/people?id=${nextScheduledCall.person_id}`}>
                          <Button variant="ghost" size="default" className="text-ink-soft hover:text-ink">
                            Edit plans
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="font-display text-h3 md:text-4xl text-ink font-medium leading-tight">
                        No calls planned
                      </h2>
                      <p className="text-body text-ink-soft">
                        Set a weekly time to keep the thread going.
                      </p>
                      <div className="pt-2">
                        <Link href="/calls/new">
                          <Button variant="primary" size="default" className="gap-2">
                            <Calendar className="size-4" />
                            <span>Set up a call</span>
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Orb on right */}
                <div className="relative self-center shrink-0">
                  <div className="relative size-28 md:size-36 flex items-center justify-center">
                    <VaaniOrb state="idle" className="!size-28 md:!size-36" />
                  </div>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* 3. COMING UP (lg:col-span-4) */}
          <BlurReveal delay={0.15} className="lg:col-span-4">
            <Card className="rounded-[24px] bg-cream-50 border-cream-200/90 shadow-sm p-6 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-h4 font-medium text-ink">
                    Coming up
                  </h3>
                  <Link
                    href="/calls/new"
                    className="text-xs text-terracotta hover:underline font-medium"
                  >
                    + Schedule
                  </Link>
                </div>

                {upcomingCalls.length > 0 ? (
                  <div className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:border-l-2 before:border-dotted before:border-cream-300">
                    {upcomingCalls.map((c) => (
                      <div key={c.id} className="relative flex items-start gap-3 pl-1">
                        <div className="size-3.5 rounded-full bg-terracotta/20 border-2 border-terracotta mt-1.5 shrink-0 z-10" />
                        <div className="min-w-0 flex-1">
                          <div className="text-small font-medium text-ink truncate">
                            {c.people?.nickname || c.people?.name || "Loved one"}
                          </div>
                          <div className="text-xs text-ink-faint">
                            {c.scheduled_for
                              ? new Date(c.scheduled_for).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "Upcoming"}{" "}
                            · {c.recurrence ? "Weekly" : "Once"}
                          </div>
                        </div>
                        <Link href={`/people?id=${c.person_id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-ink-soft">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-ink-soft italic py-4">
                    Nothing planned. A weekly call keeps the thread going.
                  </p>
                )}
              </div>
            </Card>
          </BlurReveal>

          {/* 4. YOUR PEOPLE (lg:col-span-7) */}
          <BlurReveal delay={0.2} className="lg:col-span-7">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-h4 font-medium text-ink">
                  Your people
                </h3>
                <Link
                  href="/people"
                  className="text-small text-terracotta hover:underline font-medium"
                >
                  View all ({people.length})
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {people.map((person) => {
                  const presence = getPresence(person.lastCall);
                  const needsAttention = person.lastCall?.needs_attention;

                  return (
                    <Card
                      key={person.id}
                      hoverLift
                      className="relative rounded-[24px] bg-cream-50 border-cream-200/90 shadow-sm p-5 space-y-4"
                    >
                      {needsAttention && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-terracotta-subtle border border-terracotta/30 text-terracotta-deep text-[11px] font-semibold flex items-center gap-1">
                          <AlertCircle className="size-3" />
                          <span>Worth a look</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <AvatarOrb
                          name={person.nickname || person.name}
                          tint={person.tint || "#F2A65A"}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-h4 font-medium text-ink truncate">
                            {person.nickname || person.name}
                          </h4>
                          <p className="text-small text-ink-soft truncate">
                            {person.relationship}
                          </p>
                        </div>
                      </div>

                      {/* Presence Line with PresenceDot */}
                      <div className="flex items-center gap-2 text-xs text-ink-soft pt-1 border-t border-cream-200/60">
                        <PresenceDot
                          status={presence.status}
                          size="sm"
                          className={presence.customColor}
                        />
                        <span className="truncate">{presence.line}</span>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Link
                          href={`/calls/new?personId=${person.id}&now=true`}
                          className="flex-1"
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full gap-1.5 h-8 text-xs font-medium"
                          >
                            <PhoneCall className="size-3.5" />
                            <span>Call now</span>
                          </Button>
                        </Link>
                        <Link href={`/people?id=${person.id}`} className="flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-ink-soft hover:text-ink"
                          >
                            Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}

                {/* + Add someone tile */}
                <button
                  type="button"
                  onClick={() => setAddPersonOpen(true)}
                  className="rounded-[24px] border-2 border-dashed border-cream-300 hover:border-terracotta/50 bg-cream-50/50 hover:bg-cream-100/60 p-5 flex flex-col items-center justify-center text-center gap-2 transition duration-150 min-h-[160px]"
                >
                  <div className="size-10 rounded-full bg-cream-100 flex items-center justify-center text-terracotta">
                    <Plus className="size-5" />
                  </div>
                  <span className="text-small font-medium text-ink">
                    + Add someone
                  </span>
                  <span className="text-xs text-ink-faint">
                    Anyone who&apos;d love a call
                  </span>
                </button>
              </div>
            </div>
          </BlurReveal>

          {/* 5. WORTH REMEMBERING THIS WEEK (lg:col-span-5) */}
          <BlurReveal delay={0.25} className="lg:col-span-5">
            <Card className="rounded-[24px] bg-cream-50 border-cream-200/90 shadow-sm p-6 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-h4 font-medium text-ink">
                    Worth remembering
                  </h3>
                  <Link
                    href="/memory"
                    className="text-xs text-terracotta hover:underline font-medium"
                  >
                    View all
                  </Link>
                </div>

                {memories.length > 0 ? (
                  <div className="space-y-3">
                    {memories.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-cream-100/70 border border-cream-200/80 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs text-ink-faint">
                          <div className="flex items-center gap-1.5 text-terracotta">
                            {m.kind === "health" ? (
                              <Heart className="size-3" />
                            ) : m.kind === "plan" ? (
                              <Calendar className="size-3" />
                            ) : (
                              <Bookmark className="size-3" />
                            )}
                            <span className="font-medium capitalize text-ink-soft">
                              {m.people?.nickname || m.people?.name || "Memory"}
                            </span>
                          </div>
                          {m.pinned && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream-200 font-medium">
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="font-display text-small text-ink leading-relaxed">
                          &ldquo;{m.content}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-ink-soft italic py-4">
                    Nothing here yet. After your first call, Vaani will keep the little
                    things that matter.
                  </p>
                )}
              </div>
            </Card>
          </BlurReveal>

          {/* 6. FRESH FROM YOUR CALLS (col-span-12) */}
          <BlurReveal delay={0.3} className="col-span-12">
            <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-h4 font-medium text-ink">
                    Fresh from your calls
                  </h3>
                  <p className="text-small text-ink-soft">
                    Recent stories and updates gathered by Vaani.
                  </p>
                </div>
              </div>

              {freshCalls.length > 0 ? (
                <div className="relative space-y-8 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-0.5 before:border-l-2 before:border-dotted before:border-cream-300">
                  {freshCalls.map((call) => {
                    const personName =
                      call.people?.nickname || call.people?.name || "Loved one";
                    const formattedDate = call.started_at
                      ? new Date(call.started_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently";

                    const whatHappened =
                      call.summary?.what_happened ||
                      call.notes ||
                      "A warm conversation checking in on how things are going.";

                    const updates = call.summary?.important_updates || [];

                    return (
                      <div key={call.id} className="relative flex items-start gap-4 pl-1">
                        {/* Dot on timeline */}
                        <div className="size-6 rounded-full bg-cream-100 border-2 border-terracotta flex items-center justify-center shrink-0 z-10 mt-1 shadow-xs">
                          <div className="size-2 rounded-full bg-terracotta" />
                        </div>

                        {/* Story Body */}
                        <div className="flex-1 bg-cream-100/60 rounded-2xl p-5 border border-cream-200/70 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-h5 font-medium text-ink">
                                {personName}
                              </span>
                              <span className="text-xs text-ink-faint">·</span>
                              <span className="text-xs text-ink-faint">
                                {formattedDate}
                              </span>
                              {call.duration_seconds && (
                                <span className="text-xs text-ink-faint">
                                  · {Math.round(call.duration_seconds / 60)} min
                                </span>
                              )}
                            </div>

                            <Link href={`/calls/${call.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-terracotta hover:text-terracotta-hover gap-1 px-2"
                              >
                                <span>View summary</span>
                                <ChevronRight className="size-3.5" />
                              </Button>
                            </Link>
                          </div>

                          <p className="text-body text-ink leading-relaxed">
                            {whatHappened}
                          </p>

                          {updates.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {updates.map((update, i) => (
                                <Chip
                                  key={i}
                                  variant="neutral"
                                  size="sm"
                                  className="text-xs bg-cream-50/80 text-ink-soft border-cream-300"
                                >
                                  {update}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-body text-ink-soft italic">
                  No conversations yet. Your first one is a few taps away.
                </div>
              )}
            </Card>
          </BlurReveal>
        </div>
      )}

      {/* Add Person Modal */}
      <PersonDialog
        open={addPersonOpen}
        onOpenChange={setAddPersonOpen}
        onSuccess={handlePersonAdded}
      />
    </div>
  );
}
