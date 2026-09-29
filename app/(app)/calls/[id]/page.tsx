"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { VaaniOrb } from "@/components/call/vaani-orb";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Heart,
  ChevronRight,
} from "lucide-react";

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params?.id as string;

  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId) return;

    const fetchCall = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("calls")
          .select("*, people(*)")
          .eq("id", callId)
          .single();

        if (error) throw error;
        setCall(data);
      } catch (err) {
        console.error("Error fetching call:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCall();
  }, [callId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-ink-soft">
        <p className="text-body animate-pulse">Loading call details…</p>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="font-display text-h3 text-ink">Call not found</h2>
        <p className="text-body text-ink-soft">This conversation could not be located.</p>
        <Link href="/home">
          <Button variant="primary">Return home</Button>
        </Link>
      </div>
    );
  }

  const person = call.people;
  const isScheduled = call.status === "scheduled";
  const isConnecting = call.status === "connecting";

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/home")}
        className="inline-flex items-center gap-1.5 text-small text-ink-soft hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to dashboard</span>
      </button>

      {/* Main Call Status Card */}
      <Card className="rounded-[28px] bg-cream-50 border border-cream-200/90 shadow-md p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <AvatarOrb
              name={person?.nickname || person?.name || "Person"}
              tint={person?.tint || "#F2A65A"}
              size="lg"
            />
            <div>
              <h1 className="font-display text-h3 text-ink font-medium">
                Call with {person?.nickname || person?.name}
              </h1>
              <p className="text-small text-ink-soft">
                {person?.relationship} · {person?.phone_e164}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            <Chip
              variant={isConnecting ? "terracotta" : isScheduled ? "neutral" : "glass"}
              className="text-xs uppercase tracking-wider font-semibold"
            >
              {call.status}
            </Chip>
          </div>
        </div>

        {/* Phase 5 Coming Next Banner */}
        <div className="p-5 rounded-2xl bg-cream-100 border border-cream-200/80 space-y-3">
          <div className="flex items-center gap-2 text-terracotta text-small font-semibold">
            <Sparkles className="size-4" />
            <span>Coming in Phase 5: Live Voice Agent Call</span>
          </div>
          <p className="text-small text-ink-soft leading-relaxed">
            In Phase 5, this screen transitions directly into the full live call experience
            powered by the AssemblyAI Voice Agent API and Twilio — featuring real-time
            speech streaming, audio wave responses with the Vaani Orb, and post-call instant summary generation.
          </p>
          <div className="pt-2 flex items-center justify-center py-4">
            <div className="relative size-24 flex items-center justify-center">
              <VaaniOrb state={isConnecting ? "dialing" : "idle"} className="!size-24" />
            </div>
          </div>
        </div>

        {/* Call Overview Details */}
        <div className="space-y-4 pt-2 border-t border-cream-200/80">
          <h3 className="font-display text-h5 text-ink font-medium">
            Call Details
          </h3>

          {call.notes && (
            <div className="space-y-1 bg-cream-100/50 p-4 rounded-xl border border-cream-200/60">
              <div className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-terracotta" />
                <span>Notes & Questions</span>
              </div>
              <p className="text-small text-ink leading-relaxed whitespace-pre-wrap">
                {call.notes}
              </p>
            </div>
          )}

          {call.personal_message && (
            <div className="space-y-1 bg-cream-100/50 p-4 rounded-xl border border-cream-200/60">
              <div className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                <Heart className="size-3.5 text-rust" />
                <span>Your Message</span>
              </div>
              <p className="text-small text-ink font-display italic leading-relaxed">
                &ldquo;{call.personal_message}&rdquo;
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-faint pt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Created {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {call.scheduled_for && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Scheduled for {new Date(call.scheduled_for).toLocaleDateString()}</span>
              </div>
            )}
            {call.is_demo && (
              <span className="px-2 py-0.5 rounded bg-terracotta-subtle text-terracotta-deep font-semibold">
                Demo self-call
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200/80">
          <Link href="/home">
            <Button variant="ghost">Go to home</Button>
          </Link>
          {person && (
            <Link href={`/people?id=${person.id}`}>
              <Button variant="primary" className="gap-1.5">
                <span>View {person.nickname || person.name}</span>
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
