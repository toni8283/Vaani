import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-cream-200 bg-cream py-12">
      <div className="max-w-content mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-caption text-ink-faint">
            &copy; {new Date().getFullYear()} Vaani. All rights reserved.
          </span>
        </div>

        {/* Center: Hackathon credit */}
        <p className="text-small text-ink-soft text-center">
          Made with care for hackathon: lablab.ai &times; AssemblyAI
        </p>

        {/* Right: Policy links */}
        <div className="flex items-center gap-6 text-small text-ink-soft">
          <Link href="#privacy" className="hover:text-ink transition-colors">
            Privacy
          </Link>
          <span className="text-cream-300">&middot;</span>
          <Link href="#terms" className="hover:text-ink transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
