"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Chip } from "@/components/ui/chip";
import {
  User,
  PhoneCall,
  BookHeart,
  Shield,
  Bell,
  Palette,
  LogOut,
  Sparkles,
  Info,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [defaultVoice, setDefaultVoice] = useState("claire");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyApp, setNotifyApp] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsGuest(!!user.is_anonymous);
          setEmail(user.email || "Guest user");

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setDisplayName(profile.display_name || "");
            if (profile.memory_enabled !== undefined) setMemoryEnabled(profile.memory_enabled);
            if (profile.notify_sms !== undefined) setNotifySms(profile.notify_sms);
            if (profile.notify_email !== undefined) setNotifyEmail(profile.notify_email);
          }
        }
      } catch {
        // ignore
      }
    };

    fetchUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("profiles").update({
        display_name: displayName,
        memory_enabled: memoryEnabled,
        notify_sms: notifySms,
        notify_email: notifyEmail,
      }).eq("id", user.id);

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
          Settings
        </h1>
        <p className="text-body text-ink-soft">
          Manage your account preferences, memory, and call defaults.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-sage/15 border border-sage/30 text-sage text-small font-medium animate-in fade-in-0">
          Preferences saved successfully.
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Account */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <User className="size-5 text-terracotta" />
            <h2 className="font-display text-h4 text-ink font-medium">
              Account
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-small font-medium text-ink">
                Display name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-small font-medium text-ink">
                Email address
              </label>
              <Input
                value={email}
                disabled
                className="bg-cream-100/50 text-ink-soft cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-ink-faint">
              {isGuest ? "You are currently exploring as a guest." : "Signed in with email."}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-rust hover:text-rust hover:bg-rust/10 gap-1.5"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </Card>

        {/* 2. Calls */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <PhoneCall className="size-5 text-terracotta" />
            <h2 className="font-display text-h4 text-ink font-medium">
              Calls
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-small font-medium text-ink">
                Default voice
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "claire", label: "Claire (calm & clear)" },
                  { id: "ivy", label: "Ivy (bright & friendly)" },
                  { id: "dawn", label: "Dawn (soft & unhurried)" },
                ].map((v) => (
                  <Chip
                    key={v.id}
                    variant={defaultVoice === v.id ? "terracotta" : "neutral"}
                    size="default"
                    onClick={() => setDefaultVoice(v.id)}
                    className="cursor-pointer"
                  >
                    {v.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cream-100/60 border border-cream-200/70 space-y-1">
              <div className="text-small font-medium text-ink">Quiet hours</div>
              <p className="text-small text-ink-soft">
                Never call before 9:00 am or after 8:00 pm.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-100/60 border border-cream-200/70 space-y-1">
              <div className="text-small font-medium text-ink">AI Disclosure</div>
              <p className="text-small text-ink-soft italic">
                &ldquo;Vaani will always introduce itself as an AI calling on your behalf.&rdquo;
              </p>
            </div>
          </div>
        </Card>

        {/* 3. Memory */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <BookHeart className="size-5 text-terracotta" />
            <h2 className="font-display text-h4 text-ink font-medium">
              Memory
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-small font-medium text-ink">
                Let Vaani remember
              </div>
              <div className="text-xs text-ink-faint">
                Enables natural continuity across calls.
              </div>
            </div>
            <Toggle checked={memoryEnabled} onCheckedChange={setMemoryEnabled} />
          </div>
        </Card>

        {/* 4. Notifications */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <Bell className="size-5 text-terracotta" />
            <h2 className="font-display text-h4 text-ink font-medium">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-small text-ink font-medium">Text message (SMS) summaries</span>
              <Toggle checked={notifySms} onCheckedChange={setNotifySms} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-ink font-medium">Email summaries</span>
              <Toggle checked={notifyEmail} onCheckedChange={setNotifyEmail} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-ink font-medium">In-app notifications</span>
              <Toggle checked={notifyApp} onCheckedChange={setNotifyApp} />
            </div>
          </div>
        </Card>

        {/* 5. Appearance */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <Palette className="size-5 text-terracotta" />
            <h2 className="font-display text-h4 text-ink font-medium">
              Appearance
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-small font-medium transition duration-150 ${
                  theme === "light"
                    ? "bg-terracotta text-cream-50 border-terracotta shadow-xs"
                    : "bg-cream-100/60 text-ink-soft border-cream-200 hover:text-ink hover:bg-cream-100"
                }`}
              >
                <Sun className="size-4" />
                <span>Light (Warm Cream)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-small font-medium transition duration-150 ${
                  theme === "dark"
                    ? "bg-terracotta text-cream-50 border-terracotta shadow-xs"
                    : "bg-cream-100/60 text-ink-soft border-cream-200 hover:text-ink hover:bg-cream-100"
                }`}
              >
                <Moon className="size-4" />
                <span>Evening (Cozy Dark)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-small font-medium transition duration-150 ${
                  theme === "system"
                    ? "bg-terracotta text-cream-50 border-terracotta shadow-xs"
                    : "bg-cream-100/60 text-ink-soft border-cream-200 hover:text-ink hover:bg-cream-100"
                }`}
              >
                <Laptop className="size-4" />
                <span>System</span>
              </button>
            </div>

            <p className="text-small text-ink-faint">
              Evening wraps your dashboard in a cozy warm cocoa theme inspired by quiet nights by the fire.
            </p>
          </div>
        </Card>

        {/* 6. Privacy & Danger Zone */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <Shield className="size-5 text-rust" />
            <h2 className="font-display text-h4 text-ink font-medium">
              Privacy & Data
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-small font-medium text-ink">
                Delete my account
              </div>
              <div className="text-xs text-ink-faint">
                This removes everyone you&apos;ve added, every summary, and every memory.
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-rust hover:text-rust hover:bg-rust/10 border border-rust/30"
              onClick={() => alert("Please contact support to permanently remove your account data.")}
            >
              Delete account
            </Button>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="default">
            Save preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
