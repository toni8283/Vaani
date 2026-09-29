"use client";

import * as React from "react";
import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function HeroPhoneForm() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();

    if (!trimmed) {
      setError("Please enter a phone number.");
      return;
    }

    // Check with libphonenumber-js (fallback to international format if starts with +)
    let valid = false;
    try {
      valid = isValidPhoneNumber(trimmed) || (trimmed.startsWith("+") ? isValidPhoneNumber(trimmed) : isValidPhoneNumber(trimmed, "IN") || isValidPhoneNumber(trimmed, "US"));
    } catch {
      valid = false;
    }

    if (!valid && !/^\+?[0-9\s\-()]{8,18}$/.test(trimmed)) {
      setError("That number doesn't look quite right. Try including the country code, like +91.");
      return;
    }

    setError(null);
    setToastMessage("Coming together in the next step");
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <p className="text-caption font-medium tracking-wide uppercase text-ink-soft mb-2.5">
        Try it now: let Vaani call you
      </p>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center p-1.5 rounded-full bg-cream-50/90 backdrop-blur-xl border border-cream-200 shadow-sm transition-all duration-200",
          error ? "border-rust ring-1 ring-rust/30" : "focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/25"
        )}
      >
        <div className="pl-4 pr-2 text-ink-faint">
          <Phone className="size-4" />
        </div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError(null);
          }}
          placeholder="+91 98765 43210"
          className="w-full bg-transparent text-body text-ink placeholder:text-ink-faint focus:outline-none py-1.5"
          aria-label="Phone number to receive a test call"
        />
        <Button type="submit" variant="primary" size="default" className="shrink-0 h-10 px-5 rounded-full">
          <span>Call me</span>
          <ArrowRight className="size-3.5 ml-1.5 hidden sm:inline" />
        </Button>
      </form>

      {error && (
        <p className="mt-2 text-caption text-rust font-medium text-left px-4 animate-in fade-in duration-200">
          {error}
        </p>
      )}

      {/* Floating Glass Toast Notification on submission */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Toast
            title={toastMessage}
            description="Our live telephony bridge connects in Phase 3."
            variant="success"
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}
    </div>
  );
}
