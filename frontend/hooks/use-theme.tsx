"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "typeform-clone-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  // Genuinely a "synchronize with an external system" effect (localStorage,
  // matchMedia, the DOM class list) -- the recommended use case for
  // useEffect per https://react.dev/learn/synchronizing-with-effects. It
  // can't run during render because these browser APIs aren't available
  // during SSR and reading them then would cause a hydration mismatch.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const preferred: Theme =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial mount sync from browser APIs, see comment above
    setThemeState(preferred);
    document.documentElement.classList.toggle("dark", preferred === "dark");
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Falls back gracefully for components rendered outside the provider
    // (e.g. during static generation) instead of throwing.
    return { theme: "light" as Theme, toggleTheme: () => {}, setTheme: () => {} };
  }
  return ctx;
}
