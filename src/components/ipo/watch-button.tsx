"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/cn";

export function WatchButton({ slug, name, compact }: { slug: string; name: string; compact?: boolean }) {
  const { has, toggle } = useWatchlist();
  const on = has(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 rounded-lg border text-sm font-medium transition-colors",
        compact ? "p-1.5" : "px-3 py-2",
        on ? "border-brand/30 bg-brand-soft text-brand" : "border-line bg-surface text-ink-2 hover:text-ink",
      )}
    >
      {on ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
      {!compact && (on ? "Watching" : "Watch")}
    </button>
  );
}
