"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  BookHeart,
  Settings,
  PhoneCall,
  Search,
  LogOut,
  Plus,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { GuestBanner } from "@/components/app/guest-banner";
import { CommandPalette } from "@/components/app/command-palette";
import { PersonDialog, type PersonRecord } from "@/components/app/person-dialog";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "People", href: "/people", icon: Users },
  { label: "Memory", href: "/memory", icon: BookHeart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme, accent, setAccent } = useTheme();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [displayName, setDisplayName] = useState("there");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsGuest(!!user.is_anonymous);
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, is_guest")
            .eq("id", user.id)
            .single();

          if (profile) {
            setIsGuest(!!profile.is_guest);
            if (profile.display_name) setDisplayName(profile.display_name);
          } else {
            const metaName =
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0];
            if (metaName) setDisplayName(metaName);
          }
        }
      } catch {
        // fallback
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const handlePersonAdded = (person: PersonRecord) => {
    // If on people page or home page, refresh
    router.refresh();
  };

  return (
    <div
      data-accent={accent}
      className="min-h-screen bg-cream text-ink flex flex-col md:flex-row selection:bg-terracotta-subtle selection:text-ink"
    >
      {/* 1. SIDEBAR: 72px on tablet (md), 256px on desktop (lg), hidden on mobile */}
      <aside className="hidden md:flex md:w-[72px] lg:w-64 border-r border-cream-200 bg-cream-50/80 backdrop-blur-xl flex-col justify-between shrink-0 sticky top-0 h-screen z-30 transition-all duration-200 ease-calm">
        <div className="flex flex-col h-full justify-between p-3 lg:p-5">
          <div className="space-y-6">
            {/* Logo Slot */}
            <div className="h-12 flex items-center justify-center lg:justify-start px-1">
              <Link href="/home" className="flex items-center gap-3 focus:outline-none">
                {/* On desktop show full wordmark logo; on tablet show mark */}
                <div className="hidden lg:block">
                  <Logo size="sm" />
                </div>
                <div className="lg:hidden">
                  <Logo size="sm" markOnly />
                </div>
              </Link>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5 font-medium text-small">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/home" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`group flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-terracotta/15 text-terracotta font-semibold shadow-xs border border-terracotta/30"
                        : "text-ink-soft hover:bg-cream-200/50 dark:hover:bg-white/[0.08] hover:text-ink dark:hover:text-[#FAF5EE]"
                    }`}
                  >
                    <Icon
                      className={`size-5 shrink-0 transition-transform duration-200 ${
                        isActive
                          ? "text-terracotta scale-105"
                          : "text-ink-soft group-hover:text-ink dark:group-hover:text-[#FAF5EE] group-hover:scale-105"
                      }`}
                    />
                    <span className={`hidden lg:inline-block transition-colors duration-150 ${
                      isActive ? "text-terracotta" : ""
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile & sign out at bottom of sidebar */}
          <div className="pt-4 border-t border-cream-200/80 space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-3 px-2 py-1.5 rounded-xl">
              <AvatarOrb name={displayName} tint="#F2A65A" size="sm" />
              <div className="hidden lg:block min-w-0 flex-1">
                <div className="text-small font-medium text-ink truncate">
                  {displayName}
                </div>
                <div className="text-xs text-ink-faint truncate">
                  {isGuest ? "Guest account" : "Signed in"}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign out"
              className="group w-full flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2 rounded-xl text-small text-ink-soft hover:text-rust hover:bg-rust/10 transition-colors duration-150"
            >
              <LogOut className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
              <span className="hidden lg:inline-block">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Glass Top Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-cream-200/70 bg-cream-50/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between gap-3">
          {/* Left: Logo on mobile, Search bar button on tablet/desktop */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Logo size="sm" href="/home" />
            </div>

            {/* ⌘K Trigger Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cream-100/80 hover:bg-cream-100 border border-cream-200/60 text-small text-ink-soft transition duration-150 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
            >
              <Search className="size-4 text-ink-faint" />
              <span className="hidden sm:inline">Search people, actions…</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-mono bg-cream-50 text-ink-faint rounded border border-cream-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Accent Colors, Theme Toggle & "New call" Primary Button */}
          <div className="flex items-center gap-2">
            {/* Quick Accent Color Switcher Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPaletteOpen(!paletteOpen)}
                title="Choose dashboard accent color"
                className="p-2 rounded-full border border-cream-200/80 bg-cream-100/60 hover:bg-cream-100 text-ink-soft hover:text-ink transition duration-150 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                aria-label="Accent colors"
              >
                <Palette className="size-4 text-terracotta" />
              </button>

              {paletteOpen && (
                <div className="absolute right-0 top-12 z-50 p-2.5 rounded-2xl bg-cream-50/95 dark:bg-[#231B17] border border-cream-200/80 dark:border-[#382C25] shadow-lg flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
                  {[
                    { id: "amber" as const, color: "#C4622D", label: "Amber" },
                    { id: "purple" as const, color: "#8E6BD9", label: "Purple" },
                    { id: "pink" as const, color: "#E06D94", label: "Pink" },
                    { id: "blue" as const, color: "#4B8FE2", label: "Blue" },
                    { id: "white" as const, color: "#FAF5EE", label: "White" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAccent(opt.id);
                        setPaletteOpen(false);
                      }}
                      title={`${opt.label} accent`}
                      className={`size-7 rounded-full border flex items-center justify-center transition-transform hover:scale-115 ${
                        accent === opt.id
                          ? "border-white ring-2 ring-terracotta scale-110 shadow-sm"
                          : "border-black/25 dark:border-white/30"
                      }`}
                      style={{ backgroundColor: opt.color }}
                    >
                      {accent === opt.id && (
                        <span className={`size-2 rounded-full ${opt.id === "white" ? "bg-ink" : "bg-white"} shadow-xs`} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              title={resolvedTheme === "dark" ? "Switch to warm light mode" : "Switch to cozy evening mode"}
              className="p-2 rounded-full border border-cream-200/80 bg-cream-100/60 hover:bg-cream-100 text-ink-soft hover:text-ink transition duration-150 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-warm-amber" />
              ) : (
                <Moon className="size-4 text-ink-soft" />
              )}
            </button>

            <Link href="/calls/new">
              <Button
                variant="primary"
                size="sm"
                className="gap-2 shadow-xs"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">New call</span>
                <span className="sm:hidden">Call</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Guest Banner if guest */}
        <div className="px-4 md:px-8 pt-4">
          <GuestBanner isGuest={isGuest} />
        </div>

        {/* Child Page Content */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-28 md:pb-12 max-w-content w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. MOBILE BOTTOM TAB BAR (fixed at bottom on mobile, hidden on md+) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-cream-200/80 bg-cream-50/90 backdrop-blur-xl flex items-center justify-around px-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition duration-150 ${
                isActive ? "text-terracotta font-semibold" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global ⌘K Command Palette Modal */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onAddPersonClick={() => {
          setCommandPaletteOpen(false);
          setAddPersonOpen(true);
        }}
      />

      {/* Global Add Person Dialog */}
      <PersonDialog
        open={addPersonOpen}
        onOpenChange={setAddPersonOpen}
        onSuccess={handlePersonAdded}
      />
    </div>
  );
}
