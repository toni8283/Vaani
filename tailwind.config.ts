import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FAF6F0", 50: "#FFFCF8", 100: "#F4EDE3", 200: "#E8DFD3", 300: "#EFE7DB" },
        ink: { DEFAULT: "#2B211C", soft: "#6F6259", faint: "#9A8C81" },
        terracotta: {
          DEFAULT: "rgb(var(--accent-primary) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          subtle: "rgb(var(--accent-subtle) / <alpha-value>)",
          deep: "rgb(var(--accent-deep) / <alpha-value>)",
        },
        amber: {
          DEFAULT: "rgb(var(--accent-glow) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        sage: "#5E8C61",
        honey: "#D9A441",
        rust: "#B5483A",
        // shadcn compatibility tokens mapped to our tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "rgb(var(--accent-primary) / <alpha-value>)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--accent-primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "500" }],
        "display-lg": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.025em", fontWeight: "500" }],
        h3: ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "500" }],
        h4: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "500" }],
        h5: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        h6: ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.25rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.65" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      borderRadius: { card: "1.5rem", input: "1rem" },
      maxWidth: { content: "1200px", prose: "640px" },
      boxShadow: {
        sm: "0 1px 2px rgba(90,45,20,0.06), 0 1px 1px rgba(90,45,20,0.04)",
        md: "0 6px 20px -6px rgba(90,45,20,0.12), 0 2px 6px rgba(90,45,20,0.05)",
        lg: "0 24px 60px -16px rgba(90,45,20,0.20), 0 8px 16px -8px rgba(90,45,20,0.08)",
        orb: "0 0 80px 10px rgba(242,166,90,0.45), 0 30px 60px -10px rgba(143,63,23,0.35)",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
        breathe: "cubic-bezier(0.45, 0, 0.55, 1)",
      },
      keyframes: {
        breathe: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.035)" } },
        ripple: { "0%": { transform: "scale(0.9)", opacity: "0.5" }, "100%": { transform: "scale(1.9)", opacity: "0" } },
        drift: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-30px,20px) scale(0.95)" },
        },
      },
      animation: {
        breathe: "breathe 4s cubic-bezier(0.45,0,0.55,1) infinite",
        ripple: "ripple 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
        drift: "drift 14s linear infinite",
        blob: "blob 18s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
