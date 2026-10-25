"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "ipos.theme";

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Kept as a string because it is inlined; keep in sync with applyTheme().
 */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_KEY}")||"system";var d=c==="dark"||(c==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function useThemeChoice() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => setChoice(readChoice()), []);

  // Follow OS changes while on "system".
  useEffect(() => {
    if (choice !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  const set = useCallback((c: ThemeChoice) => {
    setChoice(c);
    try {
      localStorage.setItem(THEME_KEY, c);
    } catch {
      /* storage unavailable: still apply for this page view */
    }
    applyTheme(c);
  }, []);

  return { choice, set };
}

/** The resolved theme ("light" | "dark"), reactive to changes on <html data-theme>. */
export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(
    (cb) => {
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => obs.disconnect();
    },
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );
}

const CHART = {
  light: { series: "#2f5fc4", context: "#9aa3b5", negative: "#a8261b", grid: "#ebe6dd", axis: "#5d6a80", ink: "#0f1f3a", cursor: "rgba(15,31,58,0.05)", dot: "#ffffff" },
  dark: { series: "#5b84df", context: "#6b7690", negative: "#e2685c", grid: "#24304a", axis: "#8d99b0", ink: "#e7ecf5", cursor: "rgba(231,236,245,0.06)", dot: "#111a2e" },
} as const;

/** Chart colours for the current theme (validated for contrast on each surface). */
export function useChartColors() {
  return CHART[useResolvedTheme()];
}
