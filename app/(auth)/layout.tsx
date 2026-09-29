import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AuthVisual } from "@/components/auth/auth-visual";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream text-ink">
      {/* Left Column: Form Side */}
      <div className="flex flex-col justify-between px-6 py-8 md:px-16 min-h-screen">
        {/* Top Header Logo */}
        <div className="pt-2">
          <Logo size="md" href="/" />
        </div>

        {/* Center: Auth Form Component */}
        <div className="py-8 my-auto w-full">{children}</div>

        {/* Bottom Terms */}
        <div className="pt-4 pb-2 text-center lg:text-left">
          <p className="text-caption text-ink-faint">
            By continuing you agree to our{" "}
            <Link href="#terms" className="underline hover:text-ink transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#privacy" className="underline hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right Column: Visual Side Panel (hidden on mobile, visible on lg) */}
      <AuthVisual />
    </div>
  );
}
