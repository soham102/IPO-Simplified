"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { GLOSSARY_BY_ID } from "@/data/glossary";

/**
 * Inline glossary term. Click / Enter / Space toggles a short definition;
 * Escape or clicking elsewhere closes it. Works with keyboard and touch.
 */
export function Term({ id, children }: { id: string; children?: React.ReactNode }) {
  const entry = GLOSSARY_BY_ID[id];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!entry) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help border-b border-dotted border-ink-3 text-inherit hover:border-ink"
      >
        {children ?? entry.term}
      </button>
      {open && (
        <span
          id={popId}
          role="tooltip"
          className="absolute top-full left-0 z-30 mt-2 block w-72 max-w-[80vw] rounded-lg border border-line bg-surface p-3 text-left text-sm font-normal text-ink-2 shadow-lg"
        >
          <span className="block font-semibold text-ink">{entry.term}</span>
          <span className="mt-1 block">{entry.short}</span>
          <Link href={`/glossary#${entry.id}`} className="mt-2 inline-block text-xs font-medium text-series underline">
            Read more in the glossary
          </Link>
        </span>
      )}
    </span>
  );
}
