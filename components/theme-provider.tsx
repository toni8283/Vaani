"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Accent = "amber" | "purple" | "pink" | "blue" | "white";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  accent: Accent;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [accent, setAccentState] = useState<Accent>("amber");

  useEffect(() => {
    // 1. Initial load from localStorage
    const savedTheme = (localStorage.getItem("vaani-theme") as Theme) || "system";
    setThemeState(savedTheme);

    const savedAccent = (localStorage.getItem("vaani-accent") as Accent) || "amber";
    setAccentState(savedAccent);
    document.documentElement.setAttribute("data-accent", savedAccent);

    const applyTheme = (t: Theme) => {
      let isDark = false;
      if (t === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = t === "dark";
      }

      setResolvedTheme(isDark ? "dark" : "light");

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme(savedTheme);

    // 2. Listener for system theme changes if set to system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = (localStorage.getItem("vaani-theme") as Theme) || "system";
      if (current === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem("vaani-accent", newAccent);
    document.documentElement.setAttribute("data-accent", newAccent);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, resolvedTheme, accent, setAccent }}
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
    };
  }
  return context;
}
