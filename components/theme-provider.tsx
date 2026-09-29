"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark" | "system";
export type Accent = "amber" | "purple" | "pink" | "blue" | "white";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  accent: Accent;
  setAccent: (accent: Accent) => void;
  isDashboard: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [accent, setAccentState] = useState<Accent>("amber");

  // Determine if on dashboard/app routes vs marketing/auth
  const isDashboard = Boolean(
    pathname &&
      pathname !== "/" &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/signup") &&
      !pathname.startsWith("/auth")
  );

  useEffect(() => {
    // 1. Initial load from localStorage
    const savedTheme = (localStorage.getItem("vaani-theme") as Theme) || "system";
    setThemeState(savedTheme);

    const savedAccent = (localStorage.getItem("vaani-accent") as Accent) || "amber";
    setAccentState(savedAccent);

    const computeIsDark = (t: Theme) => {
      if (t === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return t === "dark";
    };

    const isDark = computeIsDark(savedTheme);
    setResolvedTheme(isDark ? "dark" : "light");

    // Dark mode ONLY applies on dashboard routes
    if (isDashboard && isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-accent", savedAccent);
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-accent", isDashboard ? savedAccent : "amber");
    }

    // 2. Listener for system theme changes if set to system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = (localStorage.getItem("vaani-theme") as Theme) || "system";
      if (current === "system") {
        const sysDark = mediaQuery.matches;
        setResolvedTheme(sysDark ? "dark" : "light");
        if (isDashboard && sysDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isDashboard, pathname]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("vaani-theme", newTheme);

    let isDark = false;
    if (newTheme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = newTheme === "dark";
    }

    setResolvedTheme(isDark ? "dark" : "light");

    if (isDashboard && isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem("vaani-accent", newAccent);
    if (isDashboard) {
      document.documentElement.setAttribute("data-accent", newAccent);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, resolvedTheme, accent, setAccent, isDashboard }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "light" as Theme,
      setTheme: () => {},
      resolvedTheme: "light" as "light" | "dark",
      accent: "amber" as Accent,
      setAccent: () => {},
      isDashboard: false,
    };
  }
  return context;
}
