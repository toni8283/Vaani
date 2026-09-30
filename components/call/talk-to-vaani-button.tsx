"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PhoneCall, Loader2 } from "lucide-react";

interface TalkToVaaniButtonProps extends ButtonProps {
  children?: React.ReactNode;
  personName?: string;
  relationship?: string;
}

export function TalkToVaaniButton({
  children = "Talk to Vaani",
  personName = "Maa",
  relationship = "Mother",
  className,
  disabled,
  ...props
}: TalkToVaaniButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    if (e.defaultPrevented) return;

    try {
      setLoading(true);
      const supabase = createClient();

      // 1. Authenticate user, or sign in as guest
      let {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { data: anonData, error: anonErr } =
          await supabase.auth.signInAnonymously();
        if (anonErr) {
          console.error("Anonymous guest sign in error:", anonErr);
        }
        user = anonData?.user || null;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Find existing person or create a default contact
      let personId: string | null = null;
      const { data: people } = await supabase
        .from("people")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (people && people.length > 0) {
        personId = people[0].id;
      } else {
        const { data: newPerson, error: personErr } = await supabase
          .from("people")
          .insert({
            user_id: user.id,
            name: personName,
            nickname: personName,
            relationship,
            phone_e164: null,
            language: "en",
            voice: "claire",
            tone: "warm",
            memory_enabled: true,
            tint: "#F2A65A",
            consent_confirmed: true,
          })
          .select("id")
          .single();

        if (personErr) {
          console.error("Error creating default contact:", personErr);
        } else if (newPerson) {
          personId = newPerson.id;
        }
      }

      if (!personId) {
        throw new Error("Could not initialize conversation partner.");
      }

      // 3. Create call record with channel = 'browser', status = 'ringing'
      // Note: No /api/calls/start or Twilio call is triggered
      const { data: callRow, error: callErr } = await supabase
        .from("calls")
        .insert({
          user_id: user.id,
          person_id: personId,
          channel: "browser",
          status: "ringing",
          notes: "Check in warmly and ask how the day was.",
          is_demo: false,
        })
        .select("id")
        .single();

      if (callErr || !callRow) {
        throw callErr || new Error("Failed to create call row.");
      }

      // 4. Navigate directly to live call screen
      router.push(`/calls/${callRow.id}/live`);
    } catch (err) {
      console.error("Talk to Vaani error:", err);
      // Fallback redirect if offline or DB error
      router.push("/calls/new");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" />
          <span>Connecting…</span>
        </>
      ) : (
        <>
          <PhoneCall className="size-4 mr-2" />
          <span>{children}</span>
        </>
      )}
    </Button>
  );
}
