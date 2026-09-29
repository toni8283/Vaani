"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
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
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-calm",
          scrolled
            ? "bg-cream-50/70 backdrop-blur-xl border-b border-cream-200/70 shadow-sm"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-content mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group focus:outline-none" aria-label="Vaani Home">
            <Logo size="md" />
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
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="primary" asChild>
              <Link href="/signup">Set up Vaani</Link>
            </Button>
          </div>

          {/* Mobile Right Controls: Primary CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup">Set up Vaani</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-ink hover:bg-cream-100/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* 1px gradient line under nav when scrolled */}
        {scrolled && (
          <div className="h-px w-full bg-gradient-to-r from-transparent via-terracotta/25 to-transparent pointer-events-none" />
        )}
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
            className="fixed inset-x-0 top-20 bg-cream-50/95 backdrop-blur-2xl border-b border-cream-200 p-6 shadow-lg flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-4 text-body font-medium text-ink">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-cream-100 hover:text-terracotta transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button variant="primary" asChild className="w-full">
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Set up Vaani
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
