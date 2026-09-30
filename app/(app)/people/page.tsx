"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BlurReveal } from "@/components/motion/blur-reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { PresenceDot } from "@/components/ui/presence-dot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PersonDialog, type PersonRecord } from "@/components/app/person-dialog";
import { maskPhoneNumber } from "@/lib/phone";
import { getVoiceById } from "@/lib/voices";
import {
  Search,
  Plus,
  PhoneCall,
  Calendar,
  Edit2,
  Trash2,
  Volume2,
  Sparkles,
  ArrowLeft,
  Clock,
  ChevronRight,
  BookHeart,
} from "lucide-react";

interface CallItem {
  id: string;
  status: string;
  started_at?: string | null;
  scheduled_for?: string | null;
  duration_seconds?: number | null;
  recurrence?: string | null;
  mood_note?: string | null;
  summary?: {
    what_happened?: string;
    important_updates?: string[];
  } | null;
  notes?: string | null;
}

interface MemoryItem {
  id: string;
  content: string;
  kind?: string;
  pinned?: boolean;
  created_at: string;
}

interface PersonDetail extends PersonRecord {
  calls?: CallItem[];
  memories?: MemoryItem[];
}

export default function PeoplePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-ink-soft">Loading people…</div>}>
      <PeopleContent />
    </React.Suspense>
  );
}

function PeopleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [people, setPeople] = useState<PersonDetail[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonRecord | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load people, calls, memories
  const loadPeople = React.useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: peopleData, error: peopleErr } = await supabase
        .from("people")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (peopleErr) throw peopleErr;

      const { data: callsData } = await supabase
        .from("calls")
        .select("id, person_id, status, started_at, scheduled_for, duration_seconds, recurrence, mood_note, summary, notes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: memoriesData } = await supabase
        .from("memories")
        .select("id, person_id, content, kind, pinned, created_at")
        .eq("user_id", user.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      const enriched: PersonDetail[] = (peopleData || []).map((p) => ({
        ...p,
        calls: (callsData || []).filter((c) => c.person_id === p.id),
        memories: (memoriesData || []).filter((m) => m.person_id === p.id),
      }));

      setPeople(enriched);

      // Check query param for selection
      const queryId = searchParams.get("id");
      setSelectedPersonId((prev) => {
        if (queryId && enriched.some((p) => p.id === queryId)) {
          return queryId;
        }
        return prev && enriched.some((p) => p.id === prev) ? prev : enriched[0]?.id || null;
      });
    } catch (err) {
      console.error("Error loading people:", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  // Handle URL ?add=true param
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setAddPersonOpen(true);
    }
    const queryId = searchParams.get("id");
    if (queryId) {
      setSelectedPersonId(queryId);
    }
  }, [searchParams]);

  // Filtered list
  const filteredPeople = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nickname && p.nickname.toLowerCase().includes(q)) ||
        p.relationship.toLowerCase().includes(q)
    );
  }, [people, searchQuery]);

  // Currently selected person
  const currentPerson = useMemo(() => {
    return people.find((p) => p.id === selectedPersonId) || null;
  }, [people, selectedPersonId]);

  // Delete person handler
  const handleDeletePerson = async () => {
    if (!currentPerson) return;
    try {
      setDeleting(true);
      const supabase = createClient();
      const { error } = await supabase.from("people").delete().eq("id", currentPerson.id);
      if (error) throw error;

      setDeleteConfirmOpen(false);
      const remaining = people.filter((p) => p.id !== currentPerson.id);
      setPeople(remaining);
      setSelectedPersonId(remaining[0]?.id || null);
    } catch (err) {
      console.error("Error deleting person:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Helper for presence
  const getPersonPresence = (person: PersonDetail) => {
    const completed = person.calls?.filter((c) => c.status === "completed") || [];
    if (completed.length === 0 || !completed[0].started_at) {
      return { status: "honey" as const, text: "Never spoke yet" };
    }
    const last = completed[0];
    const diffDays = Math.floor(
      (Date.now() - new Date(last.started_at!).getTime()) / (1000 * 60 * 60 * 24)
    );
    const day = new Date(last.started_at!).toLocaleDateString("en-US", { weekday: "short" });
    return {
      status: diffDays <= 3 ? ("sage" as const) : ("honey" as const),
      text: diffDays === 0 ? "Spoke today" : diffDays === 1 ? "Spoke yesterday" : `Spoke ${day}`,
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
            People
          </h1>
          <p className="text-body text-ink-soft">
            The people you love and stay close with.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setAddPersonOpen(true)}
          className="gap-2 shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add someone</span>
        </Button>
      </div>

      {/* Main Master-Detail Container */}
      {!loading && people.length === 0 ? (
        /* Empty State */
        <Card className="rounded-[32px] p-12 text-center flex flex-col items-center bg-cream-50 border-cream-200/90 shadow-sm max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-cream-100 flex items-center justify-center text-terracotta mb-4">
            <Plus className="size-8" />
          </div>
          <h2 className="font-display text-h3 text-ink font-medium">
            No one here yet.
          </h2>
          <p className="text-body text-ink-soft mt-2 mb-6">
            Add a parent, a grandparent, a friend. Anyone who&apos;d love a call.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setAddPersonOpen(true)}
            className="gap-2 shadow-xs"
          >
            <Plus className="size-5" />
            <span>Add someone you love</span>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT LIST: lg:col-span-4 */}
          <div
            className={`space-y-3 lg:col-span-4 ${
              selectedPersonId ? "hidden lg:block" : "block"
            }`}
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="size-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name"
                className="pl-10 h-11 bg-cream-50 border-cream-200"
              />
            </div>

            {/* List of Persons */}
            <div className="space-y-2">
              {filteredPeople.map((person) => {
                const isSelected = person.id === selectedPersonId;
                const presence = getPersonPresence(person);

                return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-150 border ${
                      isSelected
                        ? "bg-cream-100/90 border-terracotta/40 shadow-xs"
                        : "bg-cream-50/80 border-cream-200/80 hover:bg-cream-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarOrb
                        name={person.nickname || person.name}
                        tint={person.tint || "#F2A65A"}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="font-display text-h5 font-medium text-ink truncate">
                          {person.nickname || person.name}
                        </div>
                        <div className="text-xs text-ink-soft truncate">
                          {person.relationship}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <PresenceDot status={presence.status} size="sm" />
                      <span className="text-[11px] text-ink-faint hidden sm:inline">
                        {presence.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT DETAIL: lg:col-span-8 */}
          {currentPerson && (
            <div
              className={`lg:col-span-8 space-y-6 ${
                selectedPersonId ? "block" : "hidden lg:block"
              }`}
            >
              {/* Mobile Back to List Button */}
              <button
                type="button"
                onClick={() => setSelectedPersonId(null)}
                className="lg:hidden flex items-center gap-1.5 text-small text-ink-soft hover:text-ink font-medium pb-2"
              >
                <ArrowLeft className="size-4" />
                <span>Back to all people</span>
              </button>

              {/* Person Header Card */}
              <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <AvatarOrb
                      name={currentPerson.nickname || currentPerson.name}
                      tint={currentPerson.tint || "#F2A65A"}
                      size="lg"
                    />
                    <div>
                      <h2 className="font-display text-h3 text-ink font-medium">
                        {currentPerson.nickname || currentPerson.name}
                      </h2>
                      <p className="text-small text-ink-soft mt-0.5">
                        {currentPerson.name} · {currentPerson.relationship} ·{" "}
                        <span className="font-mono text-xs text-ink-faint">
                          {maskPhoneNumber(currentPerson.phone_e164)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/calls/new?personId=${currentPerson.id}&now=true`}
                    >
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <PhoneCall className="size-3.5" />
                        <span>Call now</span>
                      </Button>
                    </Link>
                    <Link href={`/calls/new?personId=${currentPerson.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-ink-soft hover:text-ink">
                        <Calendar className="size-3.5" />
                        <span>Schedule a call</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPerson(currentPerson)}
                      className="gap-1.5 text-ink-soft hover:text-ink"
                    >
                      <Edit2 className="size-3.5" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-cream-200/80">
                  {/* Block 1: How Vaani speaks */}
                  <div className="space-y-3 bg-cream-100/60 rounded-2xl p-4.5 border border-cream-200/70">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-h5 text-ink font-medium flex items-center gap-2">
                        <Volume2 className="size-4 text-terracotta" />
                        <span>How Vaani speaks with {currentPerson.nickname || currentPerson.name}</span>
                      </h4>
                      <button
                        onClick={() => setEditingPerson(currentPerson)}
                        className="text-xs text-terracotta hover:underline font-medium"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-2 text-small">
                      <div className="flex justify-between items-center">
                        <span className="text-ink-soft">Voice:</span>
                        <span className="font-medium text-ink">
                          {getVoiceById(currentPerson.voice).displayName}{" "}
                          <span className="text-ink-faint font-normal text-xs">
                            · {getVoiceById(currentPerson.voice).accent}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-soft">Tone:</span>
                        <span className="font-medium text-ink">
                          {currentPerson.tone || "Warm"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-soft">Language:</span>
                        <span className="font-medium text-ink">English</span>
                      </div>
                    </div>
                  </div>

                  {/* Block 4: Calls & Schedule */}
                  <div className="space-y-3 bg-cream-100/60 rounded-2xl p-4.5 border border-cream-200/70">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-h5 text-ink font-medium flex items-center gap-2">
                        <Clock className="size-4 text-terracotta" />
                        <span>Calls</span>
                      </h4>
                      <Link
                        href={`/calls/new?personId=${currentPerson.id}`}
                        className="text-xs text-terracotta hover:underline font-medium"
                      >
                        + Schedule
                      </Link>
                    </div>

                    {currentPerson.calls?.some((c) => c.status === "scheduled") ? (
                      <div className="space-y-2">
                        {currentPerson.calls
                          ?.filter((c) => c.status === "scheduled")
                          .slice(0, 2)
                          .map((sc) => (
                            <div
                              key={sc.id}
                              className="flex items-center justify-between text-small bg-cream-50/80 rounded-xl p-2.5 border border-cream-200/60"
                            >
                              <div>
                                <div className="font-medium text-ink">
                                  {sc.recurrence?.includes("weekly")
                                    ? "Every Sunday at 6:30 pm"
                                    : "Upcoming call"}
                                </div>
                                <div className="text-xs text-ink-faint">
                                  {sc.scheduled_for
                                    ? new Date(sc.scheduled_for).toLocaleDateString(
                                        "en-US",
                                        { weekday: "short", hour: "numeric", minute: "2-digit" }
                                      )
                                    : "Scheduled"}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-ink-soft">
                                Pause
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-small text-ink-soft italic pt-1">
                        No recurring calls set up yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Block 2: Recent conversations */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-h4 text-ink font-medium">
                      Recent conversations
                    </h4>
                  </div>

                  {currentPerson.calls && currentPerson.calls.filter((c) => c.status === "completed").length > 0 ? (
                    <div className="space-y-2.5">
                      {currentPerson.calls
                        .filter((c) => c.status === "completed")
                        .slice(0, 5)
                        .map((call) => (
                          <div
                            key={call.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-cream-100/50 border border-cream-200/70"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs text-ink-faint">
                                <span>
                                  {call.started_at
                                    ? new Date(call.started_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })
                                    : "Recent"}
                                </span>
                                {call.duration_seconds && (
                                  <span>· {Math.round(call.duration_seconds / 60)} min</span>
                                )}
                              </div>
                              <p className="text-small text-ink line-clamp-2">
                                {call.summary?.what_happened || call.notes || "Call completed."}
                              </p>
                            </div>

                            <Link href={`/calls/${call.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-terracotta hover:text-terracotta-hover gap-1 px-2 shrink-0"
                              >
                                <span>View</span>
                                <ChevronRight className="size-3" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-small text-ink-soft italic py-2">
                      No conversations yet with {currentPerson.nickname || currentPerson.name}.
                    </p>
                  )}
                </div>

                {/* Block 3: What Vaani remembers */}
                <div className="space-y-3 pt-2 border-t border-cream-200/80">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-h4 text-ink font-medium flex items-center gap-2">
                      <BookHeart className="size-4 text-terracotta" />
                      <span>What Vaani remembers</span>
                    </h4>
                    {currentPerson.memories && currentPerson.memories.length > 0 && (
                      <Link
                        href={`/memory?personId=${currentPerson.id}`}
                        className="text-xs text-terracotta hover:underline font-medium"
                      >
                        See all ({currentPerson.memories.length})
                      </Link>
                    )}
                  </div>

                  {currentPerson.memories && currentPerson.memories.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {currentPerson.memories.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="rounded-2xl bg-cream-100/70 border border-cream-200/80 p-3.5 space-y-1"
                        >
                          <div className="text-[11px] font-medium text-ink-faint capitalize">
                            {m.kind || "memory"}
                          </div>
                          <p className="font-display text-small text-ink leading-relaxed">
                            &ldquo;{m.content}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-small text-ink-soft italic py-2">
                      Nothing remembered yet for {currentPerson.nickname || currentPerson.name}.
                    </p>
                  )}
                </div>

                {/* Danger zone */}
                <div className="pt-4 border-t border-cream-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-small font-medium text-ink">
                      Remove {currentPerson.nickname || currentPerson.name}
                    </div>
                    <div className="text-xs text-ink-faint">
                      This also removes what Vaani remembers about {currentPerson.nickname || "her"}.
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="text-rust hover:text-rust hover:bg-rust/10 gap-1.5 h-8 px-3"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Remove</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Person Dialog */}
      <PersonDialog
        open={addPersonOpen || !!editingPerson}
        onOpenChange={(open) => {
          if (!open) {
            setAddPersonOpen(false);
            setEditingPerson(null);
          }
        }}
        person={editingPerson}
        onSuccess={() => {
          loadPeople();
          setAddPersonOpen(false);
          setEditingPerson(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rust">
              Remove {currentPerson?.nickname || currentPerson?.name}?
            </DialogTitle>
            <DialogDescription className="text-ink-soft pt-2">
              This also removes what Vaani remembers about {currentPerson?.nickname || "her"},
              along with all call history and recurring schedules.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="quiet"
              onClick={handleDeletePerson}
              disabled={deleting}
              className="bg-rust text-white hover:bg-rust/90 border-transparent"
            >
              {deleting ? "Removing…" : `Remove ${currentPerson?.nickname || currentPerson?.name}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
