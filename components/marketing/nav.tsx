"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { TalkToVaaniButton } from "@/components/call/talk-to-vaani-button";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Trust", href: "#trust" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      {/* Floating Outer Container */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 flex items-center justify-center transition-all duration-400 ease-calm pointer-events-none",
          scrolled ? "pt-3.5 px-4 sm:px-6" : "pt-0 px-0"
        )}
      >
        {/* Nav Shell: Transforms from full-width bar at top to floating glass pill when scrolled */}
        <div
          className={cn(
            "w-full transition-all duration-400 ease-calm flex items-center justify-between pointer-events-auto",
            scrolled
              ? "max-w-4xl h-16 px-6 md:px-8 rounded-full bg-cream-50/80 backdrop-blur-2xl border border-cream-200/90 shadow-md shadow-ink/5"
              : "max-w-content h-20 px-5 md:px-8 rounded-none bg-transparent border-b border-transparent shadow-none"
          )}
        >
          {/* Brand Logo with name */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none"
            aria-label="Vaani Home"
          >
            <Logo size={scrolled ? "sm" : "md"} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-small font-medium text-ink-soft">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-ink transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <TalkToVaaniButton variant="primary" size="sm">
              Talk to Vaani
            </TalkToVaaniButton>
          </div>

          {/* Mobile Right Controls: Primary CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <TalkToVaaniButton variant="primary" size="sm" className="h-8 px-3 text-xs">
              Talk to Vaani
            </TalkToVaaniButton>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-ink hover:bg-cream-100/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 md:hidden bg-ink/30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-x-4 top-24 rounded-3xl bg-cream-50/95 backdrop-blur-2xl border border-cream-200 p-6 shadow-xl flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-3 text-body font-medium text-ink">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-cream-100/70 hover:text-terracotta transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2.5 pt-2 border-t border-cream-200/80">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <TalkToVaaniButton variant="primary" className="w-full">
                Talk to Vaani
              </TalkToVaaniButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
