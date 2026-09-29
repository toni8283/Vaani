import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import { ThemeProvider } from "@/components/theme-provider";
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

const themeScript = `
  (function() {
    try {
      var p = window.location.pathname;
      var isDashboard = p !== '/' && !p.startsWith('/login') && !p.startsWith('/signup') && !p.startsWith('/auth');
      var t = localStorage.getItem('vaani-theme') || 'system';
      var d = isDashboard && (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
      if (d) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      var a = localStorage.getItem('vaani-accent') || 'amber';
      document.documentElement.setAttribute('data-accent', isDashboard ? a : 'amber');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-cream text-ink font-sans antialiased min-h-screen relative selection:bg-terracotta-subtle selection:text-ink">
        <ThemeProvider>
          <GrainOverlay />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
