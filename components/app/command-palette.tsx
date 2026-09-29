"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  PhoneCall,
  UserPlus,
  Home,
  Users,
  BookOpen,
  Settings,
  ArrowRight,
} from "lucide-react";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { createClient } from "@/lib/supabase/client";

interface CommandItem {
  id: string;
  category: "people" | "actions" | "navigation";
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPersonClick?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onAddPersonClick,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<
    { id: string; name: string; nickname?: string | null; relationship: string; tint?: string }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch people when palette opens
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    const fetchPeople = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("people")
          .select("id, name, nickname, relationship, tint")
          .eq("user_id", user.id)
          .order("name");

        if (data) setPeople(data);
      } catch {
        // offline fallback
      }
    };

    fetchPeople();
  }, [open]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Build items
  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];
    const q = query.toLowerCase().trim();

    // 1. People matches
    const filteredPeople = people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nickname && p.nickname.toLowerCase().includes(q)) ||
        p.relationship.toLowerCase().includes(q)
    );

    filteredPeople.forEach((p) => {
      list.push({
        id: `call-${p.id}`,
        category: "people",
        title: `Call ${p.nickname || p.name} now`,
        subtitle: `${p.relationship} · Voice call`,
        icon: (
          <div className="relative size-6 shrink-0 flex items-center justify-center">
            <AvatarOrb name={p.nickname || p.name} tint={p.tint || "#F2A65A"} size="sm" />
          </div>
        ),
        onSelect: () => {
          onOpenChange(false);
          router.push(`/calls/new?personId=${p.id}&now=true`);
        },
      });

      list.push({
        id: `view-${p.id}`,
        category: "people",
        title: `View ${p.nickname || p.name}'s profile`,
        subtitle: `${p.relationship} · Details & memory`,
        icon: <Users className="size-4 text-ink-soft" />,
        onSelect: () => {
          onOpenChange(false);
          router.push(`/people?id=${p.id}`);
        },
      });
    });

    // 2. Quick Actions
    if (!q || "new call".includes(q) || "call".includes(q)) {
      list.push({
        id: "action-new-call",
        category: "actions",
        title: "New call",
        subtitle: "Start or schedule a call with someone",
        icon: <PhoneCall className="size-4 text-terracotta" />,
        onSelect: () => {
          onOpenChange(false);
          router.push("/calls/new");
        },
      });
    }

    if (!q || "add someone".includes(q) || "person".includes(q) || "add".includes(q)) {
      list.push({
        id: "action-add-person",
        category: "actions",
        title: "Add someone",
        subtitle: "Set up a new loved one to call",
        icon: <UserPlus className="size-4 text-sage" />,
        onSelect: () => {
          onOpenChange(false);
          if (onAddPersonClick) {
            onAddPersonClick();
          } else {
            router.push("/people?add=true");
          }
        },
      });
    }

    // 3. Navigation
    const navItems = [
      { id: "nav-home", title: "Home", path: "/home", icon: <Home className="size-4 text-ink-soft" /> },
      { id: "nav-people", title: "People", path: "/people", icon: <Users className="size-4 text-ink-soft" /> },
      { id: "nav-memory", title: "Memory", path: "/memory", icon: <BookOpen className="size-4 text-ink-soft" /> },
      { id: "nav-settings", title: "Settings", path: "/settings", icon: <Settings className="size-4 text-ink-soft" /> },
    ];

    navItems.forEach((n) => {
      if (!q || n.title.toLowerCase().includes(q)) {
        list.push({
          id: n.id,
          category: "navigation",
          title: `Go to ${n.title}`,
          subtitle: `Navigate to ${n.title}`,
          icon: n.icon,
          onSelect: () => {
            onOpenChange(false);
            router.push(n.path);
          },
        });
      }
    });

    return list;
  }, [people, query, onOpenChange, onAddPersonClick, router]);

  // Adjust selection bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].onSelect();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden bg-cream-50/95 backdrop-blur-2xl border-cream-200 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-cream-200">
          <Search className="size-5 text-ink-faint shrink-0 ml-1 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search people, actions, or pages…"
            className="w-full h-14 bg-transparent text-ink placeholder:text-ink-faint text-base focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono bg-cream-100 text-ink-soft rounded border border-cream-200">
            esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-small text-ink-faint">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-cream-100 text-ink"
                      : "text-ink-soft hover:bg-cream-100/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-cream-200/60 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-small font-medium text-ink truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-ink-faint truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight className="size-4 text-terracotta shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-cream-200/80 bg-cream-100/50 flex items-center justify-between text-xs text-ink-faint">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>⌘K to toggle</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
