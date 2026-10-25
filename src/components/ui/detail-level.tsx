"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Level = "beginner" | "detailed";
const Ctx = createContext<{ level: Level; setLevel: (l: Level) => void }>({ level: "beginner", setLevel: () => {} });
const KEY = "ipos.detailLevel";

export function DetailLevelProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<Level>("beginner");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "beginner" || saved === "detailed") setLevelState(saved);
    } catch {
      /* storage unavailable: keep default */
    }
  }, []);
  const setLevel = (l: Level) => {
    setLevelState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };
  return <Ctx.Provider value={{ level, setLevel }}>{children}</Ctx.Provider>;
}

export function DetailLevelToggle() {
  const { level, setLevel } = useContext(Ctx);
  return (
    <div role="radiogroup" aria-label="Explanation level" className="inline-flex rounded-full border border-line bg-surface p-0.5 text-sm">
      {(["beginner", "detailed"] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={level === l}
          onClick={() => setLevel(l)}
          className={cn(
            "rounded-full px-3 py-1 font-medium capitalize transition-colors",
            level === l ? "bg-brand text-on-brand" : "text-ink-2 hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Content shown only in Detailed mode. */
export function Detailed({ children }: { children: React.ReactNode }) {
  const { level } = useContext(Ctx);
  return level === "detailed" ? <>{children}</> : null;
}

/** Content shown only in Beginner mode. */
export function Beginner({ children }: { children: React.ReactNode }) {
  const { level } = useContext(Ctx);
  return level === "beginner" ? <>{children}</> : null;
}
