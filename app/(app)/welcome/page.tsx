"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
import { VaaniOrb } from "@/components/call/vaani-orb";
import { Button } from "@/components/ui/button";
import { BlurWords } from "@/components/motion/blur-reveal";

export default function WelcomePage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [userName, setUserName] = useState<string>("");
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);
        const guest = !!user.is_anonymous;
        setIsGuest(guest);

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, onboarded, is_guest")
          .eq("id", user.id)
          .single();

        // If user is already onboarded, skip welcome and go to /home
        if (profile?.onboarded) {
          router.replace("/home");
          return;
        }

        if (profile) {
          setIsGuest(!!profile.is_guest);
          if (profile.display_name) {
            setUserName(profile.display_name);
          }
        } else {
          const name =
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0];
          if (name) setUserName(name);
        }
      } catch {
        // Safe fallback
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleFinish = async (destination: string) => {
    if (exiting) return;
    setExiting(true);

    try {
      if (userId) {
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ onboarded: true })
          .eq("id", userId);
      }
    } catch {
      // Ignore network errors on update
    }

    // Allow exit animation (400ms for text blur out, orb flies with layoutId)
    setTimeout(() => {
      router.push(destination);
    }, reduce ? 100 : 500);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] grid place-items-center bg-cream">
        <VaaniOrb state="thinking" className="!size-24" />
      </div>
    );
  }

  const greetingName = isGuest || !userName ? "there" : userName;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-cream select-none overflow-hidden">
      {/* Background Mesh Gradient */}
      <MeshGradient />

      {/* Small Skip button top-right */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="quiet"
          size="sm"
          onClick={() => handleFinish("/home")}
          className="text-ink-soft hover:text-ink text-small font-medium"
        >
          Skip
        </Button>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Orb with shared layoutId */}
        <motion.div
          layoutId="vaani-orb"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, filter: "blur(30px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="py-4"
        >
          <VaaniOrb state="idle" className="!size-56 md:!size-64" />
        </motion.div>

        {/* Text and Actions with exit animation */}
        <AnimatePresence>
          {!exiting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)", y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 mt-6 flex flex-col items-center"
            >
              {/* 0.9s: "Hi, {name}." / "Hi there." */}
              <h1 className="font-display text-[48px] md:text-[68px] text-ink font-medium tracking-tight leading-none">
                <BlurWords text={`Hi, ${greetingName}.`} delay={0.9} />
              </h1>

              {/* 2.0s: Subline */}
              <motion.p
                initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 12 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.8, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
                className="text-body-lg text-ink-soft max-w-md mx-auto leading-relaxed"
              >
                I&apos;m Vaani. I&apos;ll help you stay close to the people who matter.
              </motion.p>

              {/* 3.2s: Two Action Buttons */}
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 12 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.8, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}
                className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleFinish("/calls/new")}
                  className="h-12 px-8 text-base font-semibold rounded-full shadow-md w-full sm:w-auto"
                >
                  Add someone you love
                </Button>
                <Button
                  variant="quiet"
                  size="lg"
                  onClick={() => handleFinish("/home")}
                  className="text-ink-soft hover:text-ink font-medium w-full sm:w-auto"
                >
                  Look around first
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
