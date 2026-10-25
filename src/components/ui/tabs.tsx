"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface TabDef {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern) with arrow-key navigation.
 * The active tab is mirrored to `?tab=` so it can be linked and survives reloads.
 */
export function Tabs({ tabs, label }: { tabs: TabDef[]; label: string }) {
  const [active, setActive] = useState(tabs[0]!.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Restore the tab from ?tab= after hydration (keeps the page statically renderable).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && tabs.some((t) => t.id === fromUrl)) setActive(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback((id: string, focus = false) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
    if (focus) refs.current[id]?.focus();
  }, []);

  // Keep the active tab visible in the horizontally scrolling strip without scrolling the page.
  useEffect(() => {
    const el = refs.current[active];
    const strip = el?.parentElement;
    if (!el || !strip) return;
    const left = el.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + el.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - 16) });
    }
  }, [active]);

  const onKey = (e: React.KeyboardEvent, idx: number) => {
    const n = tabs.length;
    const go = (i: number) => {
      e.preventDefault();
      select(tabs[(i + n) % n]!.id, true);
    };
    if (e.key === "ArrowRight") go(idx + 1);
    else if (e.key === "ArrowLeft") go(idx - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(n - 1);
  };

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur sm:mx-0 sm:px-0">
        <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((t, i) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[t.id] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(t.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  selected ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== active}
          tabIndex={0}
          className="pt-6 focus-visible:outline-none"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
