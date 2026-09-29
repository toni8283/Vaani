"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  isDashboard: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

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
    } else {
      document.documentElement.classList.remove("dark");
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

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, resolvedTheme, isDashboard }}
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
      isDashboard: false,
    };
  }
  return context;
}

