"use client";

import * as React from "react";
import { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";

export function GuestBanner({ isGuest }: { isGuest?: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  if (!isGuest) return null;

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: updateError } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to save account. Please try again.");
        setLoading(false);
        return;
      }

      // Update profile is_guest flag
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ is_guest: false })
          .eq("id", user.id);
      }

      setOpen(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 5000);
    } catch {
      setError("Something went wrong on our side. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl bg-terracotta-subtle/85 border border-terracotta/25 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-small font-medium text-terracotta-deep">
          <Sparkles className="size-4 shrink-0 text-terracotta" />
          <span>You&apos;re a guest. Save your people &rarr;</span>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="primary"
              size="sm"
              className="h-8 px-4 text-xs font-semibold rounded-full shadow-xs shrink-0"
            >
              <span>Save your account</span>
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save your account</DialogTitle>
              <DialogDescription>
                Add an email and password so your people, calls, and memories are never lost when you switch devices.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveAccount} className="space-y-4 py-2">
              {error && (
                <div className="p-3 rounded-xl bg-rust/10 border border-rust/20 text-rust text-small">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-small font-medium text-ink">Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-small font-medium text-ink">Choose a password</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <DialogFooter className="pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Maybe later
                  </Button>
                </DialogClose>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Saving…" : "Save account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Toast
            title="Account saved!"
            description="Your people and memories are safely linked."
            variant="success"
            onClose={() => setSuccessToast(false)}
          />
        </div>
      )}
    </>
  );
}
