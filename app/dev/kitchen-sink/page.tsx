"use client";

import * as React from "react";
import { useState } from "react";
import {
  BadgeCheck,
  SlidersHorizontal,
  BookHeart,
  Sparkles,
  PhoneCall,
  Heart,
  Shield,
  Volume2,
  Clock,
  ArrowRight,
  Check,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
import { IconTile } from "@/components/ui/icon-tile";
import { PresenceDot } from "@/components/ui/presence-dot";
import { AvatarOrb } from "@/components/ui/avatar-orb";
import { VaaniOrb, type OrbState } from "@/components/call/vaani-orb";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
import { BlurReveal, BlurWords } from "@/components/motion/blur-reveal";
import { Illustration } from "@/components/ui/illustration";
import { Logo } from "@/components/ui/logo";
import { illustrations, type IllustrationName } from "@/lib/assets";

const illustrationNames = Object.keys(illustrations) as IllustrationName[];

const orbStates: { state: OrbState; label: string; desc: string }[] = [
  { state: "idle", label: "Idle", desc: "Breathes with calm loop (4s)" },
  { state: "dialing", label: "Dialing", desc: "Dual expanding ripple rings (2.4s)" },
  { state: "speaking", label: "Speaking", desc: "Scales dynamically with audio level slider" },
  { state: "listening", label: "Listening", desc: "Contracts slightly (0.94) + reactive ring" },
  { state: "thinking", label: "Thinking", desc: "Inner sheen speeds up rotation (6s)" },
  { state: "ending", label: "Ending", desc: "Dims opacity to 0.55 & contracts to 0.7" },
];

export default function KitchenSinkPage() {
  const [activeOrbState, setActiveOrbState] = useState<OrbState>("idle");
  const [orbLevel, setOrbLevel] = useState<number>(0.65);
  const [toggle1, setToggle1] = useState<boolean>(true);
  const [toggle2, setToggle2] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-cream text-ink pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200">
        <div className="max-w-content mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <span className="hidden sm:inline-block h-5 w-px bg-cream-300" />
            <span className="hidden sm:inline-block text-small font-medium text-ink-soft">
              Phase 1 · Foundation Primitives
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Chip variant="sage" icon={<Check className="size-3.5" />}>
              Tokens Verified
            </Chip>
          </div>
        </div>
      </header>

      <main className="max-w-content mx-auto px-5 md:px-8 pt-12 space-y-20">
        {/* Title Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-terracotta">
            <span className="size-2 rounded-full bg-terracotta" />
            Design System & Component Library
          </div>
          <h1 className="font-display text-display-lg md:text-display-xl text-ink font-medium tracking-tight">
            <BlurWords text="Kitchen Sink" />
          </h1>
          <p className="text-body-lg text-ink-soft max-w-prose">
            Verification suite for all Phase 1 foundations: exact Brief &amp; Addendum tokens,
            Fraunces typography, all 6 VaaniOrb states, motion primitives, and asset fallbacks.
          </p>
        </section>

        {/* 1. BRAND & LOGO */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">1. Brand &amp; Logo Component</h2>
            <p className="text-small text-ink-soft">
              Renders official SVGs on transparent background via Next/Image (not breathing orb).
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <span className="text-caption text-ink-faint">Standard Logo (Dark on Cream)</span>
              <Logo size="md" />
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <span className="text-caption text-ink-faint">Large Logo</span>
              <Logo size="lg" />
            </Card>
            <Card className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <span className="text-caption text-ink-faint">Mark Only (Compact)</span>
              <Logo size="md" markOnly />
            </Card>
            <div className="rounded-card bg-ink p-6 flex flex-col items-center justify-center text-center space-y-3 border border-ink">
              <span className="text-caption text-cream-200">Light Variant (on Dark)</span>
              <Logo variant="light" size="md" />
            </div>
          </div>
        </section>

        {/* 2. THE VAANI ORB & ALL 6 STATES */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-h3 text-ink">2. Vaani Orb (All 6 States)</h2>
              <p className="text-small text-ink-soft">
                Continuous spring dynamics (stiffness: 180, damping: 18), radial/conic glows, and grain.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-cream-100 p-2.5 rounded-full border border-cream-200">
              <Volume2 className="size-4 text-terracotta" />
              <label htmlFor="orb-level-slider" className="text-caption font-medium text-ink-soft">
                Level: {(orbLevel * 100).toFixed(0)}%
              </label>
              <input
                id="orb-level-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={orbLevel}
                onChange={(e) => setOrbLevel(parseFloat(e.target.value))}
                className="w-28 accent-terracotta cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Orb Stage */}
          <div className="relative rounded-card overflow-hidden bg-cream-50 border border-cream-200 p-8 md:p-12 shadow-md flex flex-col items-center justify-center min-h-[460px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#FBD9A8_0%,rgba(250,246,240,0)_65%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <VaaniOrb state={activeOrbState} level={orbLevel} />

              <div className="mt-8 text-center space-y-1">
                <h3 className="font-display text-h4 text-ink capitalize">
                  Current State: {activeOrbState}
                </h3>
                <p className="text-small text-ink-soft">
                  {orbStates.find((s) => s.state === activeOrbState)?.desc}
                </p>
              </div>

              {/* State Controls */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {orbStates.map(({ state, label }) => (
                  <Button
                    key={state}
                    variant={activeOrbState === state ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setActiveOrbState(state)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* All 6 States Side-by-Side Gallery */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {orbStates.map(({ state, label, desc }) => (
              <Card key={state} className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="py-2 flex items-center justify-center">
                  <VaaniOrb state={state} level={orbLevel} className="!size-36 md:!size-40" />
                </div>
                <div>
                  <h4 className="font-display text-h5 text-ink">{label}</h4>
                  <p className="text-caption text-ink-soft mt-1">{desc}</p>
                </div>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => setActiveOrbState(state)}
                  className="text-terracotta font-medium"
                >
                  Select this state &rarr;
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. BUTTONS */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">3. Buttons</h2>
            <p className="text-small text-ink-soft">
              Rounded-full, hover lift (-translate-y-0.5 + shadow-md), calm easing.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Set up Vaani</Button>
            <Button variant="primary" size="lg">
              Call now <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button variant="ghost">Sign in</Button>
            <Button variant="quiet">Continue as guest</Button>
            <Button variant="secondary">View summary</Button>
            <Button variant="outline">Schedule a call</Button>
            <Button variant="destructive">Delete memory</Button>
            <Button variant="primary" disabled>
              Disabled Action
            </Button>
          </div>
        </section>

        {/* 4. INPUTS */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">4. Inputs</h2>
            <p className="text-small text-ink-soft">
              h-12 rounded-input bg-cream-50 border-cream-200 with terracotta focus rings.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-small font-medium text-ink">Standard Input</label>
              <Input placeholder="Enter phone number (+91 98765 43210)" />
            </div>
            <div className="space-y-2">
              <label className="text-small font-medium text-ink">With Pre-filled Value</label>
              <Input defaultValue="Maa (Mother)" />
            </div>
            <div className="space-y-2">
              <label className="text-small font-medium text-ink">Disabled Input</label>
              <Input disabled value="AI introduces itself on every call" />
            </div>
          </div>
        </section>

        {/* 5. CHIPS */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">5. Chips</h2>
            <p className="text-small text-ink-soft">
              Rounded-full chips for tags, memory continuity, status, and transcripts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Chip variant="default">Default terracotta-subtle</Chip>
            <Chip variant="glass" icon={<Sparkles className="size-3.5 text-amber-glow" />}>
              Vaani remembered: trouble sleeping last week
            </Chip>
            <Chip variant="sage" icon={<Check className="size-3.5" />}>
              Completed
            </Chip>
            <Chip variant="honey" icon={<Clock className="size-3.5" />}>
              Ringing…
            </Chip>
            <Chip variant="neutral">Sunday chat</Chip>
            <Chip variant="terracotta">Most loved</Chip>
            <Chip variant="rust">Attention needed</Chip>
          </div>
        </section>

        {/* 6. CARDS */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">6. Cards</h2>
            <p className="text-small text-ink-soft">
              p-6 md:p-8 rounded-card bg-cream-50 border-cream-200 shadow-sm with optional hover lift.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card hoverLift>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Chip variant="sage">Last spoke Tuesday</Chip>
                  <PresenceDot status="sage" pulse />
                </div>
                <CardTitle className="mt-3">Maa</CardTitle>
                <CardDescription>
                  Sounded cheerful and in good spirits. Sleep has improved since the new pillow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-cream-100 text-small text-ink-soft border border-cream-200">
                  &ldquo;Aarav also wanted you to hear this: he is proud of you, and he will call this weekend.&rdquo;
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-caption text-ink-faint">Weekly &middot; Sunday 6:30 pm</span>
                <Button variant="primary" size="sm">
                  Call now
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Three minutes to set up</CardTitle>
                <CardDescription>
                  Then Vaani just shows up whenever you need it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-terracotta text-cream-50 text-xs font-semibold grid place-items-center shrink-0">
                    1
                  </div>
                  <p className="text-small text-ink-soft">
                    Tell Vaani who. Add a name and a number.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-terracotta text-cream-50 text-xs font-semibold grid place-items-center shrink-0">
                    2
                  </div>
                  <p className="text-small text-ink-soft">
                    Tell Vaani what matters. Write it like you would tell a friend.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-terracotta text-cream-50 text-xs font-semibold grid place-items-center shrink-0">
                    3
                  </div>
                  <p className="text-small text-ink-soft">
                    Get the story back the moment they hang up.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Learn more
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 7. TOGGLES & SWITCHES */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">7. Toggle Switches</h2>
            <p className="text-small text-ink-soft">
              Radix switch styled with cream-200 track and terracotta checked state.
            </p>
          </div>
          <Card className="p-6 space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-body font-medium text-ink cursor-pointer">
                  Let Vaani remember
                </label>
                <p className="text-small text-ink-soft">
                  Keep little details between conversations so calls feel continuous.
                </p>
              </div>
              <Toggle checked={toggle1} onCheckedChange={setToggle1} />
            </div>
            <hr className="border-cream-200" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-body font-medium text-ink cursor-pointer">
                  Quiet hours (9 pm – 9 am)
                </label>
                <p className="text-small text-ink-soft">
                  Never place calls during late evening or early morning.
                </p>
              </div>
              <Toggle checked={toggle2} onCheckedChange={setToggle2} />
            </div>
          </Card>
        </section>

        {/* 8. ACCORDION */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">8. Accordion</h2>
            <p className="text-small text-ink-soft">
              Smooth height animation and chevron rotation with Fraunces headers.
            </p>
          </div>
          <Card className="p-6 max-w-2xl">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Does Vaani pretend to be me?</AccordionTrigger>
                <AccordionContent>
                  Never. Vaani always introduces itself in the first sentence as an AI assistant
                  calling on your behalf. We believe honesty builds trust with the people you love.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What if they don&apos;t want to talk to an AI?</AccordionTrigger>
                <AccordionContent>
                  If anyone says they would rather not receive calls, Vaani immediately honors that,
                  says goodbye warmly, and halts all future calls for that person.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How is memory handled?</AccordionTrigger>
                <AccordionContent>
                  Everything Vaani remembers is plain text in your dashboard. You can read, pin, edit,
                  or delete any memory at any time.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        {/* 9. DIALOG & TOAST */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">9. Dialog &amp; Glass Toast</h2>
            <p className="text-small text-ink-soft">
              Backdrop-blur modals and glass toasts (`bg-cream-50/70 backdrop-blur-xl border-white/60`).
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-4">
              <h3 className="font-display text-h5 text-ink">Modal Dialog</h3>
              <p className="text-small text-ink-soft">
                Click below to launch the modal dialog with backdrop blur.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="primary">Open Dialog Demo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add someone you love</DialogTitle>
                    <DialogDescription>
                      Vaani will call warmly on your behalf. We never share numbers or pretend to be you.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <label className="text-small font-medium text-ink">Their nickname</label>
                      <Input placeholder="e.g. Maa, Dadi, Uncle Rajiv" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-small font-medium text-ink">Phone number</label>
                      <Input placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button variant="primary" onClick={() => setDialogOpen(false)}>
                      Save person
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-display text-h5 text-ink">Glass Toast Variations</h3>
              <div className="space-y-3">
                <Toast
                  title="Summary sent to your phone"
                  description="SMS delivered with link to recap."
                  variant="success"
                />
                <Toast
                  title="Maa didn't pick up"
                  description="Want Vaani to try again in an hour?"
                  variant="warning"
                />
                <Toast
                  title="Forgotten"
                  description="Vaani won't bring it up again."
                  variant="default"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* 10. ICON TILES & PRESENCE & AVATARS */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">
              10. Icon Tiles, Presence Dots &amp; Avatars
            </h2>
            <p className="text-small text-ink-soft">
              Apple-style gradient tiles, pulsing status dots, and tinted avatar orbs.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Icon Tiles */}
            <Card className="p-6 space-y-4">
              <h4 className="font-display text-h5 text-ink">Icon Tiles</h4>
              <div className="flex flex-wrap gap-3">
                <IconTile icon={BadgeCheck} />
                <IconTile icon={SlidersHorizontal} />
                <IconTile icon={BookHeart} />
                <IconTile icon={Heart} size="sm" />
                <IconTile icon={PhoneCall} size="lg" />
              </div>
            </Card>

            {/* Presence Dots */}
            <Card className="p-6 space-y-4">
              <h4 className="font-display text-h5 text-ink">Presence Dots</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <PresenceDot status="sage" pulse />
                  <span className="text-small text-ink-soft">Sage (Live / Completed)</span>
                </div>
                <div className="flex items-center gap-3">
                  <PresenceDot status="honey" pulse />
                  <span className="text-small text-ink-soft">Honey (Ringing / Needs look)</span>
                </div>
                <div className="flex items-center gap-3">
                  <PresenceDot status="amber" />
                  <span className="text-small text-ink-soft">Amber (Speaking)</span>
                </div>
                <div className="flex items-center gap-3">
                  <PresenceDot status="rust" />
                  <span className="text-small text-ink-soft">Rust (Call Failed)</span>
                </div>
              </div>
            </Card>

            {/* Avatar Orbs */}
            <Card className="p-6 space-y-4">
              <h4 className="font-display text-h5 text-ink">Avatar Orbs</h4>
              <div className="flex items-center gap-4">
                <AvatarOrb initials="MA" size="sm" />
                <AvatarOrb initials="MA" size="md" />
                <AvatarOrb initials="AR" size="lg" />
                <AvatarOrb initials="VN" size="xl" />
              </div>
            </Card>
          </div>
        </section>

        {/* 11. MESH GRADIENT */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">11. Mesh Gradient (Addendum C)</h2>
            <p className="text-small text-ink-soft">
              Dawn palette blobs (apricot, coral, butter, rose, sky) + animated blob keyframes + dot grid.
            </p>
          </div>
          <div className="relative rounded-[28px] overflow-hidden border border-cream-200 h-80 flex items-center justify-center text-center p-8 shadow-md">
            <MeshGradient />
            <div className="relative z-10 max-w-md space-y-2">
              <Chip variant="glass">Dawn Gradient Palette</Chip>
              <h3 className="font-display text-h3 text-ink font-medium">
                Sunrise, not startup.
              </h3>
              <p className="text-small text-ink-soft">
                Warm colors dominate (75%); rose and sky are subtle accents so it reads human.
              </p>
            </div>
          </div>
        </section>

        {/* 12. MOTION: BLURWORDS & BLURREVEAL */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">
              12. Blur-to-Sharp Motion (Addendum B)
            </h2>
            <p className="text-small text-ink-soft">
              Scroll down to watch elements blur &rarr; sharpen with ease-calm (respects prefers-reduced-motion).
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <BlurReveal delay={0.1}>
              <Card className="p-6 space-y-2">
                <span className="text-caption text-terracotta font-semibold uppercase">Card 01</span>
                <h4 className="font-display text-h5 text-ink">
                  <BlurWords text="Call home. Even when you can't." />
                </h4>
                <p className="text-small text-ink-soft">
                  BlurReveal delay: 0.1s. Sharpening as it enters viewport.
                </p>
              </Card>
            </BlurReveal>

            <BlurReveal delay={0.25}>
              <Card className="p-6 space-y-2">
                <span className="text-caption text-terracotta font-semibold uppercase">Card 02</span>
                <h4 className="font-display text-h5 text-ink">
                  <BlurWords text="Presence, not metrics." />
                </h4>
                <p className="text-small text-ink-soft">
                  BlurReveal delay: 0.25s. Staggered entrance.
                </p>
              </Card>
            </BlurReveal>

            <BlurReveal delay={0.4}>
              <Card className="p-6 space-y-2">
                <span className="text-caption text-terracotta font-semibold uppercase">Card 03</span>
                <h4 className="font-display text-h5 text-ink">
                  <BlurWords text="Warm, but never sneaky." />
                </h4>
                <p className="text-small text-ink-soft">
                  BlurReveal delay: 0.4s. Clean typography and depth.
                </p>
              </Card>
            </BlurReveal>
          </div>
        </section>

        {/* 13. ASSET FALLBACK SYSTEM: ALL 11 ILLUSTRATIONS */}
        <section className="space-y-6">
          <div className="border-b border-cream-200 pb-3">
            <h2 className="font-display text-h3 text-ink">
              13. Illustration Fallback System (All 11 Names)
            </h2>
            <p className="text-small text-ink-soft">
              When SVG files are missing in /public/illustrations/, soft gradient blobs with Lucide icons render. Never a blank space!
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {illustrationNames.map((name) => (
              <Card key={name} className="p-4 flex flex-col items-center justify-between space-y-3">
                <div className="w-full h-44 flex items-center justify-center">
                  <Illustration name={name} className="w-full h-full" />
                </div>
                <div className="text-center w-full pt-1 border-t border-cream-200">
                  <code className="text-caption font-mono text-ink-soft">{name}</code>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
