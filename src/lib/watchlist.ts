"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Watchlist stored in the browser only (no account needed). It never leaves
 * the device, and an unavailable storage simply yields an empty list.
 */
const KEY = "ipos.watchlist.v1";
const EVENT = "ipos-watchlist-change";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

let cache: { raw: string | null; value: string[] } = { raw: null, value: [] };
function snapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  if (raw !== cache.raw) cache = { raw, value: read() };
  return cache.value;
}

const EMPTY: string[] = [];

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function useWatchlist() {
  const slugs = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const toggle = useCallback((slug: string) => {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { slugs, has: (slug: string) => slugs.includes(slug), toggle };
}
