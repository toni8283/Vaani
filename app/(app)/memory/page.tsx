"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BlurReveal } from "@/components/motion/blur-reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Toggle } from "@/components/ui/toggle";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import {
  Heart,
  Calendar,
  Bookmark,
  Sparkles,
  BookHeart,
  Plus,
  Trash2,
  Pin,
} from "lucide-react";

interface Memory {
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

export default function MemoryPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-ink-soft">Loading memories…</div>}>
      <MemoryContent />
    </React.Suspense>
  );
}

function MemoryContent() {
  const searchParams = useSearchParams();
  const filterPersonId = searchParams.get("personId");

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(filterPersonId || "all");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("memories")
            .select("*, people(name, nickname, tint)")
            .eq("user_id", user.id)
            .order("pinned", { ascending: false })
            .order("created_at", { ascending: false });

          if (data) setMemories(data);
        }
      } catch (err) {
        console.error("Error fetching memories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  const peopleOptions = useMemo(() => {
    const map = new Map<string, string>();
    memories.forEach((m) => {
      if (m.person_id && m.people) {
        map.set(m.person_id, m.people.nickname || m.people.name);
      }
    });
    return Array.from(map.entries());
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (selectedFilter === "all") return memories;
    return memories.filter((m) => m.person_id === selectedFilter);
  }, [memories, selectedFilter]);

  const handleForget = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from("memories").delete().eq("id", id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
            What Vaani remembers
          </h1>
          <p className="text-body text-ink-soft mt-0.5">
            Little things that help every call feel like a continuation. You&apos;re always in charge.
          </p>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 bg-cream-50 border border-cream-200 px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
          <span className="text-small font-medium text-ink">
            Let Vaani remember
          </span>
          <Toggle checked={memoryEnabled} onCheckedChange={setMemoryEnabled} />
        </div>
      </div>

      {!memoryEnabled && (
        <div className="p-4 rounded-2xl bg-honey/10 border border-honey/20 text-small text-ink-soft">
          Memory is off. Vaani will start each call fresh without referencing past conversations.
        </div>
      )}

      {/* Filter Tabs */}
      {peopleOptions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Chip
            variant={selectedFilter === "all" ? "terracotta" : "neutral"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
            className="cursor-pointer"
          >
            All ({memories.length})
          </Chip>
          {peopleOptions.map(([id, name]) => (
            <Chip
              key={id}
              variant={selectedFilter === id ? "terracotta" : "neutral"}
              size="sm"
              onClick={() => setSelectedFilter(id)}
              className="cursor-pointer"
            >
              {name}
            </Chip>
          ))}
        </div>
      )}

      {/* Content Grid or Empty State */}
      {!loading && filteredMemories.length === 0 ? (
        <Card className="rounded-[32px] p-12 text-center flex flex-col items-center bg-cream-50 border-cream-200/90 shadow-sm max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-cream-100 flex items-center justify-center text-terracotta mb-4">
            <BookHeart className="size-8" />
          </div>
          <h3 className="font-display text-h3 text-ink font-medium">
            Nothing here yet.
          </h3>
          <p className="text-body text-ink-soft mt-2 mb-6">
            After your first call, Vaani will keep the little things that matter.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((m) => (
            <Card
              key={m.id}
              hoverLift
              className="rounded-[24px] bg-cream-50 border-cream-200/90 shadow-sm p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-ink-faint">
                  <div className="flex items-center gap-2">
                    <AvatarOrb
                      name={m.people?.nickname || m.people?.name || "Person"}
                      tint={m.people?.tint || "#F2A65A"}
                      size="sm"
                    />
                    <span className="font-medium text-ink">
                      {m.people?.nickname || m.people?.name || "Loved one"}
                    </span>
                  </div>

                  {m.pinned && (
                    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-terracotta-subtle text-terracotta font-medium">
                      <Pin className="size-3" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>

                <p className="font-display text-base text-ink leading-relaxed">
                  &ldquo;{m.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-cream-200/60 text-xs text-ink-faint">
                <span className="capitalize">{m.kind || "memory"}</span>
                <button
                  type="button"
                  onClick={() => handleForget(m.id)}
                  className="text-ink-faint hover:text-rust transition-colors"
                  title="Forget this memory"
                >
                  Forget
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
