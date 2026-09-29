"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GuestButton({
  className = "",
  children = "Continue as guest",
  size = "lg",
  variant = "quiet",
}: {
  className?: string;
  children?: React.ReactNode;
  size?: "default" | "sm" | "lg";
  variant?: "primary" | "ghost" | "quiet" | "secondary" | "outline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signInAnonymously();
      router.push("/welcome");
    } catch {
      router.push("/welcome");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={loading}
      onClick={handleClick}
      className={className}
    >
      {loading ? "Connecting…" : children}
    </Button>
  );
}
