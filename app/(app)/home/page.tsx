"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GuestBanner } from "@/components/app/guest-banner";
import { BlurWords, BlurReveal } from "@/components/motion/blur-reveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, HeartHandshake, LogOut } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("there");
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>("Good evening");

  useEffect(() => {
    // Set time-aware greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsGuest(!!user.is_anonymous);

          // Get profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, is_guest, onboarded")
            .eq("id", user.id)
            .single();

          if (profile) {
            setIsGuest(!!profile.is_guest);
            if (profile.display_name) {
              setDisplayName(profile.display_name);
            }
          } else {
            const metaName =
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0];
            if (metaName) setDisplayName(metaName);
          }
        }
      } catch {
        // Fallback for offline demo
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Guest Banner if guest */}
      <GuestBanner isGuest={isGuest} />

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="space-y-1">
          <h1 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
            <BlurWords text={`${greeting}, ${displayName}.`} />
          </h1>
          <p className="text-body text-ink-soft">Here&apos;s who you&apos;ve been thinking about.</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="self-start sm:self-auto text-ink-soft hover:text-ink gap-2"
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </Button>
      </div>

      {/* Status Card */}
      <BlurReveal delay={0.2}>
        <Card className="p-8 space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <HeartHandshake className="size-6" />
            <h3 className="font-display text-h4 text-ink">Your Space is Ready</h3>
          </div>
          <p className="text-body text-ink-soft leading-relaxed">
            Welcome to Vaani. Your account has been authenticated and initialized with our secure
            database schema and Row Level Security.
          </p>
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 text-small text-ink-soft flex items-center gap-3">
            <Sparkles className="size-4 text-terracotta shrink-0" />
            <span>
              Phase 4 will construct the full Bento Home Dashboard, People Management, and Call Setup Wizard.
            </span>
          </div>
        </Card>
      </BlurReveal>
    </div>
  );
}
