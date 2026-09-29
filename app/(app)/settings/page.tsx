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
  const { theme, setTheme, accent, setAccent } = useTheme();

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
        {/* 1. Appearance & Colors */}
        <Card className="rounded-[28px] bg-cream-50 border-cream-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200/80">
            <Palette className="size-5 text-terracotta" />
            <div>
              <h2 className="font-display text-h4 text-ink font-medium">
                Appearance & Colors
              </h2>
              <p className="text-small text-ink-soft">
                Choose a cozy theme and your favorite accent color for your dashboard.
              </p>
            </div>
          </div>

          {/* Theme selector */}
          <div className="space-y-3">
            <label className="text-small font-medium text-ink">
              Theme Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "light" as const, label: "Warm Light", desc: "Cozy cream canvas", icon: Sun },
                { id: "dark" as const, label: "Evening Dark", desc: "Warm cocoa night", icon: Moon },
                { id: "system" as const, label: "System Sync", desc: "Follows your device", icon: Laptop },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition duration-150 ${
                      isSelected
                        ? "bg-terracotta/10 border-terracotta ring-2 ring-terracotta/30 text-ink font-medium"
                        : "bg-cream-100/60 border-cream-200 hover:bg-cream-100 text-ink-soft hover:text-ink"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      isSelected ? "bg-terracotta text-cream-50 shadow-xs" : "bg-cream-200/70 text-ink-soft"
                    }`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-small font-semibold text-ink">{opt.label}</div>
                      <div className="text-xs text-ink-faint">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color selector */}
          <div className="space-y-3 pt-2 border-t border-cream-200/60">
            <div className="flex items-center justify-between">
              <label className="text-small font-medium text-ink">
                Accent Color
              </label>
              <span className="text-xs text-ink-faint">
                Changes primary buttons, active tabs & glowing orbs instantly
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "amber" as const, name: "Amber", subtitle: "Sunrise", hex: "#C4622D" },
                { id: "purple" as const, name: "Purple", subtitle: "Lavender Glow", hex: "#8E6BD9" },
                { id: "pink" as const, name: "Pink", subtitle: "Blush Rose", hex: "#E06D94" },
                { id: "blue" as const, name: "Blue", subtitle: "Sky Mist", hex: "#4B8FE2" },
                { id: "white" as const, name: "White", subtitle: "Pearl Cloud", hex: "#FAF5EE" },
              ].map((swatch) => {
                const isSelected = accent === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => setAccent(swatch.id)}
                    className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-150 ${
                      isSelected
                        ? "bg-terracotta/10 border-terracotta ring-2 ring-terracotta/40 scale-[1.02] shadow-xs"
                        : "bg-cream-100/50 border-cream-200 hover:bg-cream-100 hover:border-cream-300"
                    }`}
                  >
                    <div
                      className={`size-9 rounded-full border mb-2 flex items-center justify-center shadow-xs transition-transform ${
                        isSelected ? "scale-110 ring-2 ring-offset-2 ring-terracotta" : "border-black/20 dark:border-white/25"
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {isSelected && (
                        <Sparkles className={`size-4 ${swatch.id === "white" ? "text-ink" : "text-white"}`} />
                      )}
                    </div>
                    <span className="text-small font-semibold text-ink">{swatch.name}</span>
                    <span className="text-[11px] text-ink-faint">{swatch.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 2. Account */}
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

        {/* 3. Calls */}
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

        {/* 4. Memory */}
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

        {/* 5. Notifications */}
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
