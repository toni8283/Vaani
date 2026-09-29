"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { BlurReveal } from "@/components/motion/blur-reveal";
import { VaaniOrb } from "@/components/call/vaani-orb";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Something went wrong on our side. Your notes are safe. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/home");
      }, 700);
    } catch {
      setError("Something went wrong on our side. Your notes are safe. Please try again.");
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setGuestLoading(true);
      setError(null);
      const supabase = createClient();
      const { error: guestError } = await supabase.auth.signInAnonymously();

      if (guestError) {
        setError(guestError.message || "Something went wrong on our side. Your notes are safe. Please try again.");
        setGuestLoading(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/welcome");
      }, 700);
    } catch {
      setError("Something went wrong on our side. Your notes are safe. Please try again.");
      setGuestLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm relative">
      <AnimatePresence mode="wait">
        {submitted ? (
          /* Blur-out transition state */
          <motion.div
            key="loading-space"
            initial={{ opacity: 0, filter: "blur(12px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center text-center py-16 space-y-6"
          >
            <VaaniOrb state="thinking" className="!size-40" />
            <div className="space-y-2">
              <h3 className="font-display text-h4 text-ink">Creating your space…</h3>
              <p className="text-small text-ink-soft">Getting Vaani ready for you.</p>
            </div>
          </motion.div>
        ) : (
          /* Form Content */
          <motion.div
            key="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Mobile-only header strip + orb */}
            <div className="lg:hidden flex flex-col items-center justify-center pb-4 text-center">
              <div className="size-20 mb-2 flex items-center justify-center">
                <VaaniOrb state="idle" className="!size-20" />
              </div>
            </div>

            {/* Header Titles */}
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="font-display text-h3 text-ink font-medium tracking-tight">
                Welcome back.
              </h1>
              <p className="text-body text-ink-soft">Sign in to see how everyone&apos;s doing.</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rust/10 border border-rust/20 flex items-start gap-2.5 text-rust text-small leading-relaxed animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <BlurReveal delay={0.07} y={10}>
              <GoogleButton />
            </BlurReveal>

            {/* Divider */}
            <BlurReveal delay={0.14} y={10}>
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-cream-200" />
                <span className="bg-cream px-3 text-caption text-ink-faint uppercase font-medium tracking-wider">
                  or
                </span>
                <div className="w-full border-t border-cream-200" />
              </div>
            </BlurReveal>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <BlurReveal delay={0.21} y={10}>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-small font-medium text-ink">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    autoComplete="email"
                  />
                </div>
              </BlurReveal>

              <BlurReveal delay={0.28} y={10}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-small font-medium text-ink">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </BlurReveal>

              <BlurReveal delay={0.35} y={10}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || guestLoading}
                  className="w-full h-12 rounded-full text-body font-semibold shadow-sm mt-2"
                >
                  {loading ? "Signing in…" : "Continue with email"}
                </Button>
              </BlurReveal>
            </form>

            {/* Continue as guest */}
            <BlurReveal delay={0.42} y={10}>
              <div className="pt-2 text-center">
                <Button
                  type="button"
                  variant="quiet"
                  onClick={handleGuestSignIn}
                  disabled={loading || guestLoading}
                  className="w-full flex-col h-auto py-2.5 rounded-2xl hover:bg-cream-100/70"
                >
                  <span className="text-body font-medium text-ink">
                    {guestLoading ? "Connecting as guest…" : "Continue as guest"}
                  </span>
                  <span className="text-caption text-ink-faint mt-0.5">
                    Try it first. Save your people later.
                  </span>
                </Button>
              </div>
            </BlurReveal>

            {/* Switch to Signup */}
            <BlurReveal delay={0.49} y={10}>
              <div className="text-center pt-2">
                <p className="text-small text-ink-soft">
                  New here?{" "}
                  <Link href="/signup" className="text-terracotta hover:underline font-medium">
                    Create an account
                  </Link>
                </p>
              </div>
            </BlurReveal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
