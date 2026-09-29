"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { Home, Users, BookOpen, Settings } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col md:flex-row selection:bg-terracotta-subtle selection:text-ink">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 border-r border-cream-200 bg-cream-50/70 backdrop-blur-xl p-6 flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Sidebar Logo Slot with shared layoutId */}
          <Link href="/home" className="flex items-center gap-3 focus:outline-none">
            <motion.div
              layoutId="vaani-orb"
              className="relative size-10 shrink-0 flex items-center justify-center"
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <VaaniOrb state="idle" className="!size-10" />
            </motion.div>
            <span className="font-display text-2xl font-medium text-ink tracking-tight">
              Vaani
            </span>
          </Link>

          {/* App Navigation Links */}
          <nav className="space-y-1.5 text-small font-medium text-ink-soft">
            <Link
              href="/home"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-cream-100 text-ink font-semibold"
            >
              <Home className="size-4 text-terracotta" />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-ink-faint cursor-not-allowed select-none">
              <Users className="size-4" />
              <span>People</span>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-ink-faint cursor-not-allowed select-none">
              <BookOpen className="size-4" />
              <span>Memory</span>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-ink-faint cursor-not-allowed select-none">
              <Settings className="size-4" />
              <span>Settings</span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Sidebar Logo Slot destination */}
        <header className="md:hidden h-16 border-b border-cream-200 bg-cream-50/80 backdrop-blur-xl px-5 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="relative size-8 shrink-0 flex items-center justify-center">
              <VaaniOrb state="idle" className="!size-8" />
            </div>
            <span className="font-display text-xl font-medium text-ink">Vaani</span>
          </Link>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-content w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
