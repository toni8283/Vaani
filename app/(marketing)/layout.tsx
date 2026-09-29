import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Vaani — Call home. Even when you can't.",
  description:
    "Vaani phones the people you love, has a real conversation, and tells you how they're doing — so a busy week never turns into a quiet month. Always honest about being an AI. Always on your behalf.",
  openGraph: {
    title: "Vaani — Call home. Even when you can't.",
    description:
      "Vaani phones the people you love, has a real conversation, and tells you how they're doing. Built with AssemblyAI Voice Agent API.",
    type: "website",
    url: "https://vaani.app",
    siteName: "Vaani",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaani — Call home. Even when you can't.",
    description: "Vaani phones the people you love, has a real conversation, and tells you how they're doing.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col justify-between selection:bg-terracotta-subtle selection:text-ink">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
