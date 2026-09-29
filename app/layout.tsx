import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaani — Call home. Even when you can't.",
  description: "Vaani phones the people you love, has a real conversation, and tells you how they're doing.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="bg-cream text-ink font-sans antialiased min-h-screen relative selection:bg-terracotta-subtle selection:text-ink">
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
