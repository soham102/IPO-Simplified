"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { IpoSummary } from "@/lib/types";
import { useWatchlist } from "@/lib/watchlist";
import { EmptyState } from "@/components/ui/empty-state";
import { IpoCard } from "./ipo-card";

export function WatchlistView({ items }: { items: IpoSummary[] }) {
  const { slugs } = useWatchlist();
  const watched = items.filter((i) => slugs.includes(i.slug));
  const missing = slugs.filter((s) => !items.some((i) => i.slug === s));

  if (watched.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Your watchlist is empty"
        action={<Link href="/ipos" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand">Explore IPOs</Link>}
      >
        Use the bookmark button on any IPO to keep track of it here.
      </EmptyState>
    );
  }
  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {watched.map((ipo) => (
          <li key={ipo.slug} className="flex"><IpoCard ipo={ipo} /></li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="mt-4 text-sm text-ink-3">{missing.length} saved IPO(s) are no longer in our data and are hidden.</p>
      )}
    </>
  );
}
