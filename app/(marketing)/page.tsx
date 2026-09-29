"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  Activity,
  Heart,
  BadgeCheck,
  SlidersHorizontal,
  BookHeart,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Illustration } from "@/components/ui/illustration";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BlurReveal, BlurWords } from "@/components/motion/blur-reveal";
import { MeshGradient } from "@/components/marketing/mesh-gradient";
import { HeroPhoneForm } from "@/components/marketing/hero-phone-form";
import { LiveCallPreview } from "@/components/marketing/live-call-preview";
import { HowItWorksConnector } from "@/components/marketing/how-it-works-connector";
import { DemoTranscript } from "@/components/marketing/demo-transcript";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden w-full">
      {/* ────────────────────────────────────────────────────────────
          1. HERO SECTION (Rebuilt per Addendum C)
         ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative isolate overflow-hidden pt-32 pb-0 md:pt-40 text-center bg-cream"
      >
        <MeshGradient />

        <div className="max-w-content mx-auto px-5 md:px-8 relative z-10">
          {/* Eyebrow Pill */}
          <BlurReveal delay={0.05} y={10}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold bg-cream-50/85 backdrop-blur-md border border-cream-200 text-ink-soft shadow-sm mb-6">
              <span className="size-2 rounded-full bg-terracotta" />
              Built with AssemblyAI Voice Agent API
            </div>
          </BlurReveal>

          {/* Main Headline */}
          <h1 className="font-display text-[44px] md:text-display-xl max-w-4xl mx-auto text-ink font-medium tracking-tight leading-[1.05]">
            <BlurWords text="Call home. Even when you can't." />
          </h1>

          {/* Subline Body */}
          <BlurReveal delay={0.2} y={14}>
            <p className="mt-6 text-body md:text-body-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
              Vaani phones the people you love, has a real conversation, and tells you how
              they&apos;re doing &mdash; so a busy week never turns into a quiet month. Always honest
              about being an AI. Always on your behalf.
            </p>
          </BlurReveal>

          {/* CTA Buttons */}
          <BlurReveal delay={0.3} y={16}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" asChild className="h-12 px-7 text-base font-semibold">
                <Link href="/signup">Set up Vaani</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-ink-soft hover:text-ink font-medium">
                <a href="#live-demo">Hear a sample call</a>
              </Button>
            </div>
          </BlurReveal>

          {/* Phone Pill "Let Vaani call you" */}
          <BlurReveal delay={0.4} y={16}>
            <div className="mt-10">
              <HeroPhoneForm />
            </div>
          </BlurReveal>

          {/* Product Preview Browser Card */}
          <BlurReveal delay={0.5} y={24}>
            <LiveCallPreview />
          </BlurReveal>
        </div>

        {/* Trailing fade transition to next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-cream pointer-events-none" />

        {/* Thin strip under hero */}
        <div className="relative z-10 border-t border-cream-200/80 bg-cream-50/60 backdrop-blur-sm py-4 px-5">
          <div className="max-w-content mx-auto flex flex-wrap items-center justify-center gap-6 text-caption text-ink-soft font-medium">
            <span>Built for hackathon: lablab.ai &times; AssemblyAI</span>
            <div className="hidden sm:flex items-center gap-4 text-terracotta">
              <Phone className="size-3.5" />
              <Activity className="size-3.5" />
              <Heart className="size-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          2. THE PROBLEM (Text-only, high emotion whitespace)
         ──────────────────────────────────────────────────────────── */}
      <section id="problem" className="py-32 md:py-48 bg-cream text-center relative overflow-hidden">
        {/* Subtle dot grid & night desk illustration (30% opacity) */}
        <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(rgba(43,33,28,0.1)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-16 w-36 h-36 opacity-30 pointer-events-none">
          <Illustration name="problem-desk" className="w-full h-full rounded-2xl" />
        </div>

        <div className="max-w-prose mx-auto px-5 relative z-10 space-y-6">
          <h2 className="font-display text-h3 md:text-display-lg text-ink font-medium tracking-tight">
            <BlurWords text="You meant to call on Sunday." />
          </h2>

          {/* Single 1px terracotta line (40px wide) */}
          <div className="h-px w-10 bg-terracotta mx-auto my-6" />

          {/* 3 lines revealed one by one */}
          <div className="space-y-4 text-body-lg text-ink-soft leading-relaxed font-sans">
            <BlurReveal delay={0.1} y={12}>
              <p>Then Monday happened. Then the whole week did.</p>
            </BlurReveal>
            <BlurReveal delay={0.3} y={12}>
              <p>
                Somewhere, someone is looking at their phone, hoping it lights up with your name.
              </p>
            </BlurReveal>
            <BlurReveal delay={0.5} y={12}>
              <p>You don&apos;t love them any less. You just ran out of hours.</p>
            </BlurReveal>
          </div>

          <BlurReveal delay={0.7} y={12}>
            <div className="pt-4">
              <a
                href="#how-it-works"
                className="inline-flex items-center text-body font-medium text-terracotta hover:text-terracotta-hover transition-colors group"
              >
                <span>There&apos;s a gentler way</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          3. HOW IT WORKS (Bento row + Dotted SVG connector)
         ──────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-36 bg-cream-100 relative">
        <div className="max-w-content mx-auto px-5 md:px-8">
          {/* Eyebrow & Headline */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-terracotta">
              <span className="size-2 rounded-full bg-terracotta" />
              HOW IT WORKS
            </div>
            <h2 className="font-display text-h3 md:text-display-lg text-ink font-medium">
              <BlurWords text="Three minutes to set up. Then Vaani just shows up." />
            </h2>
          </div>

          {/* Bento Cards Container with Dotted Arc Connector */}
          <div className="relative">
            <HowItWorksConnector />

            <div className="grid md:grid-cols-3 gap-6 relative z-20">
              {/* Step 1 */}
              <BlurReveal delay={0.1}>
                <div className="h-full rounded-[28px] bg-cream-50 border border-cream-200 p-8 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 ease-calm">
                  <div>
                    <div className="h-44 w-full mb-6 flex items-center justify-center">
                      <Illustration name="step-1-contact" className="w-full h-full" />
                    </div>
                    <span className="font-display text-h3 text-terracotta block mb-2">01</span>
                    <h3 className="font-display text-h4 text-ink mb-2">Tell Vaani who.</h3>
                    <p className="text-body text-ink-soft leading-relaxed">
                      Add a name and a number. Choose a voice that feels right for them.
                    </p>
                  </div>
                </div>
              </BlurReveal>

              {/* Step 2 */}
              <BlurReveal delay={0.25}>
                <div className="h-full rounded-[28px] bg-cream-50 border border-cream-200 p-8 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 ease-calm">
                  <div>
                    <div className="h-44 w-full mb-6 flex items-center justify-center">
                      <Illustration name="step-2-note" className="w-full h-full" />
                    </div>
                    <span className="font-display text-h3 text-terracotta block mb-2">02</span>
                    <h3 className="font-display text-h4 text-ink mb-2">Tell Vaani what matters.</h3>
                    <p className="text-body text-ink-soft leading-relaxed">
                      Write it the way you&apos;d tell a friend: &ldquo;Ask about her knee. Say I&apos;ll
                      visit in March.&rdquo;
                    </p>
                  </div>
                </div>
              </BlurReveal>

              {/* Step 3 */}
              <BlurReveal delay={0.4}>
                <div className="h-full rounded-[28px] bg-cream-50 border border-cream-200 p-8 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 ease-calm">
                  <div>
                    <div className="h-44 w-full mb-6 flex items-center justify-center">
                      <Illustration name="step-3-envelope" className="w-full h-full" />
                    </div>
                    <span className="font-display text-h3 text-terracotta block mb-2">03</span>
                    <h3 className="font-display text-h4 text-ink mb-2">Get the story back.</h3>
                    <p className="text-body text-ink-soft leading-relaxed">
                      A short, warm summary lands the moment they hang up, with what to remember and what
                      to ask next.
                    </p>
                  </div>
                </div>
              </BlurReveal>
            </div>
          </div>

          {/* Section CTA */}
          <BlurReveal delay={0.5}>
            <div className="text-center mt-12">
              <Button variant="primary" size="lg" asChild>
                <Link href="/signup">Set up Vaani</Link>
              </Button>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          4. LIVE DEMO / TRANSCRIPT
         ──────────────────────────────────────────────────────────── */}
      <section id="live-demo" className="py-24 md:py-36 bg-cream relative">
        <div className="max-w-content mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-terracotta">
              <span className="size-2 rounded-full bg-terracotta" />
              LIVE CONVERSATION
            </div>
            <h2 className="font-display text-h3 md:text-display-lg text-ink font-medium">
              <BlurWords text="Hear how it sounds. Read how it went." />
            </h2>
            <p className="text-body-lg text-ink-soft">
              A real-feeling five-minute chat with Maa, shrunk into the four things you actually need to know.
            </p>
            <div className="pt-2">
              <Button variant="secondary" asChild size="default">
                <a href="#hero">Let Vaani call you</a>
              </Button>
            </div>
          </div>

          <DemoTranscript />
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. TRUST & TRANSPARENCY
         ──────────────────────────────────────────────────────────── */}
      <section id="trust" className="py-24 md:py-36 bg-cream-100 relative">
        <div className="max-w-content mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-terracotta">
              <span className="size-2 rounded-full bg-terracotta" />
              TRUST &amp; ETHICS
            </div>
            <h2 className="font-display text-h3 md:text-display-lg text-ink font-medium">
              <BlurWords text="Warm, but never sneaky." />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BlurReveal delay={0.1}>
              <Card className="h-full p-8 flex flex-col items-center text-center space-y-4 hover:shadow-md transition duration-200">
                <IconTile icon={BadgeCheck} size="md" />
                <h3 className="font-display text-h4 text-ink">Honest from the first sentence.</h3>
                <p className="text-body text-ink-soft leading-relaxed">
                  Vaani always says it&apos;s an AI calling on your behalf. It never pretends to be you.
                </p>
              </Card>
            </BlurReveal>

            <BlurReveal delay={0.25}>
              <Card className="h-full p-8 flex flex-col items-center text-center space-y-4 hover:shadow-md transition duration-200">
                <IconTile icon={SlidersHorizontal} size="md" />
                <h3 className="font-display text-h4 text-ink">You decide everything.</h3>
                <p className="text-body text-ink-soft leading-relaxed">
                  Who it calls, what it talks about, and when. Say &ldquo;not today&rdquo; and it doesn&apos;t call.
                </p>
              </Card>
            </BlurReveal>

            <BlurReveal delay={0.4}>
              <Card className="h-full p-8 flex flex-col items-center text-center space-y-4 hover:shadow-md transition duration-200">
                <IconTile icon={BookHeart} size="md" />
                <h3 className="font-display text-h4 text-ink">Memory you can see.</h3>
                <p className="text-body text-ink-soft leading-relaxed">
                  Everything Vaani remembers is written in plain words. Edit it, delete it, or turn it off.
                </p>
              </Card>
            </BlurReveal>
          </div>

          <BlurReveal delay={0.5}>
            <div className="text-center mt-12">
              <a
                href="#faq"
                className="text-body font-medium text-terracotta hover:text-terracotta-hover transition-colors"
              >
                Read how we protect your family &rarr;
              </a>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          6. PRICING
         ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-36 bg-cream relative">
        <div className="max-w-content mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-terracotta">
              <span className="size-2 rounded-full bg-terracotta" />
              SIMPLE PRICING
            </div>
            <h2 className="font-display text-h3 md:text-display-lg text-ink font-medium">
              <BlurWords text="Less than a coffee a week. More than a coffee's worth of calm." />
            </h2>
            <p className="text-body-lg text-ink-soft">
              Start free. Upgrade when Vaani becomes part of your week.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Starter */}
            <BlurReveal delay={0.1} className="h-full">
              <div className="h-full rounded-card bg-cream-50 border border-cream-200 p-8 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition duration-200">
                <div>
                  <h3 className="font-display text-h4 text-ink">Starter</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-semibold text-ink">$0</span>
                    <span className="text-small text-ink-soft">/ month</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-body text-ink-soft">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-sage shrink-0" />
                      <span>2 calls a month</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-sage shrink-0" />
                      <span>1 loved one</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-sage shrink-0" />
                      <span>Call summaries</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-sage shrink-0" />
                      <span>Memory</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Button variant="outline" size="lg" asChild className="w-full">
                    <Link href="/signup">Start for free</Link>
                  </Button>
                </div>
              </div>
            </BlurReveal>

            {/* Card 2: Family (Gradient Border Upgrade) */}
            <BlurReveal delay={0.2} className="h-full">
              <div className="h-full p-px rounded-[26px] bg-gradient-to-br from-[#FFC99A] via-[#F7A5A0] to-[#F3C4E0] shadow-md hover:-translate-y-1 hover:shadow-lg transition duration-200">
                <div className="h-full rounded-[25px] bg-cream-50 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-h4 text-ink">Family</h3>
                      <Chip variant="terracotta" size="sm">
                        Most loved
                      </Chip>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-semibold text-ink">$9</span>
                      <span className="text-small text-ink-soft">/ month</span>
                    </div>
                    <ul className="mt-6 space-y-3 text-body text-ink-soft">
                      <li className="flex items-center gap-2.5">
                        <Check className="size-4 text-sage shrink-0" />
                        <span>Unlimited calls</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="size-4 text-sage shrink-0" />
                        <span>Up to 5 loved ones</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="size-4 text-sage shrink-0" />
                        <span>Weekly scheduled calls</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="size-4 text-sage shrink-0" />
                        <span>SMS summaries</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="size-4 text-sage shrink-0" />
                        <span>Priority voices</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-8">
                    <Button variant="primary" size="lg" asChild className="w-full">
                      <Link href="/signup">Set up Vaani</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          7. FAQ (Accordion)
         ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-36 bg-cream-100 relative">
        <div className="max-w-prose mx-auto px-5">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-terracotta">
              <span className="size-2 rounded-full bg-terracotta" />
              FREQUENTLY ASKED
            </div>
            <h2 className="font-display text-h3 md:text-display-lg text-ink font-medium">
              <BlurWords text="Good questions." />
            </h2>
          </div>

          <Accordion type="single" collapsible defaultValue="faq-1" className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Will my mom know it&apos;s an AI?</AccordionTrigger>
              <AccordionContent>
                Yes. Vaani says so in its very first sentence: it&apos;s an AI calling on your behalf.
                It never pretends to be you or a person.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger>Isn&apos;t this replacing me?</AccordionTrigger>
              <AccordionContent>
                No. Vaani is a bridge for the weeks you can&apos;t call yourself. It even nudges you:
                &ldquo;She&apos;d love a real call this weekend.&rdquo;
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger>What if she doesn&apos;t want to talk?</AccordionTrigger>
              <AccordionContent>
                Vaani asks if it&apos;s a good time. If not, it says goodbye kindly and offers to try
                later. If someone asks it to stop calling, it stops.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger>Is the call recorded? Who sees it?</AccordionTrigger>
              <AccordionContent>
                Only you see summaries and transcripts. You choose whether Vaani keeps memories, and
                you can delete any of it, anytime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5">
              <AccordionTrigger>What languages does Vaani speak?</AccordionTrigger>
              <AccordionContent>
                English today. Hindi and more are on the way.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          8. FINAL CTA SECTION (Full-bleed Dawn MeshGradient)
         ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32 md:py-48 text-center bg-cream">
        <MeshGradient />

        {/* Big calm orb background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-amber-soft/40 blur-3xl pointer-events-none" />

        <div className="max-w-content mx-auto px-5 md:px-8 relative z-10 space-y-6">
          <BlurReveal delay={0.1}>
            <div className="w-28 h-28 mx-auto mb-2 flex items-center justify-center">
              <Illustration name="cta-phones" className="w-full h-full rounded-2xl" />
            </div>
          </BlurReveal>

          <h2 className="font-display text-h2 md:text-display-lg text-ink font-medium max-w-xl mx-auto tracking-tight">
            <BlurWords text="Who's been on your mind?" />
          </h2>

          <BlurReveal delay={0.25} y={12}>
            <p className="text-body-lg text-ink-soft max-w-md mx-auto leading-relaxed">
              Add them in three minutes. Vaani will take it from there.
            </p>
          </BlurReveal>

          <BlurReveal delay={0.4} y={16}>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" asChild className="h-14 px-8 text-lg font-semibold rounded-full shadow-md">
                <Link href="/signup">Set up Vaani</Link>
              </Button>
              <Button variant="quiet" size="lg" asChild className="text-ink-soft hover:text-ink font-medium">
                <Link href="/login">Continue as guest</Link>
              </Button>
            </div>
          </BlurReveal>
        </div>
      </section>
    </div>
  );
}
