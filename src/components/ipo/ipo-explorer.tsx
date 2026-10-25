"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import type { IpoStatus, IpoSummary } from "@/lib/types";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { IpoCard } from "./ipo-card";

export type StatusFilter = "all" | IpoStatus;
type SortKey = "date" | "size" | "name";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "upcoming", label: "Upcoming" },
  { id: "closed", label: "Closed" },
  { id: "listed", label: "Listed" },
];

/** Relevance date for sorting: open date for live issues, listing date for listed ones. */
function sortDate(s: IpoSummary): string {
  return (s.status === "listed" ? s.listingDate.value : s.openDate.value) ?? "9999-12-31";
}

export function filterAndSort(
  items: IpoSummary[],
  opts: { status: StatusFilter; query: string; board: "all" | "Mainboard" | "SME"; fullOnly: boolean; sort: SortKey },
): IpoSummary[] {
  const q = opts.query.trim().toLowerCase();
  const out = items.filter(
    (i) =>
      (opts.status === "all" || i.status === opts.status) &&
      (opts.board === "all" || i.board === opts.board) &&
      (!opts.fullOnly || i.coverage === "complete") &&
      (!q || i.name.toLowerCase().includes(q) || i.sector.toLowerCase().includes(q) || i.tagline.toLowerCase().includes(q)),
  );
  const statusOrder: Record<IpoStatus, number> = { open: 0, upcoming: 1, closed: 2, listed: 3 };
  return out.sort((a, b) => {
    if (opts.sort === "name") return a.name.localeCompare(b.name);
    if (opts.sort === "size") return (b.issueSize.value ?? -1) - (a.issueSize.value ?? -1);
    // Default: open first, then upcoming (soonest first), closed, listed (most recent first).
    const so = statusOrder[a.status] - statusOrder[b.status];
    if (so !== 0) return so;
    return a.status === "listed" || a.status === "closed"
      ? sortDate(b).localeCompare(sortDate(a))
      : sortDate(a).localeCompare(sortDate(b));
  });
}

export function IpoExplorer({
  items,
  initialStatus = "all",
  initialQuery = "",
}: {
  items: IpoSummary[];
  initialStatus?: StatusFilter;
  initialQuery?: string;
}) {
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [query, setQuery] = useState(initialQuery);
  const [board, setBoard] = useState<"all" | "Mainboard" | "SME">("all");
  const [fullOnly, setFullOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("date");

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: items.length, open: 0, upcoming: 0, closed: 0, listed: 0 };
    for (const i of items) c[i.status]++;
    return c;
  }, [items]);

  const visible = useMemo(
    () => filterAndSort(items, { status, query, board, fullOnly, sort }),
    [items, status, query, board, fullOnly, sort],
  );

  const syncUrl = (next: { status?: StatusFilter; q?: string }) => {
    const url = new URL(window.location.href);
    const s = next.status ?? status;
    const q = next.q ?? query;
    if (s === "all") url.searchParams.delete("status");
    else url.searchParams.set("status", s);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  };

  const reset = () => {
    setStatus("all");
    setQuery("");
    setBoard("all");
    setFullOnly(false);
    syncUrl({ status: "all", q: "" });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 lg:flex-nowrap">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={status === t.id}
              onClick={() => {
                setStatus(t.id);
                syncUrl({ status: t.id });
              }}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors pointer-coarse:py-2.5",
                status === t.id ? "bg-brand text-on-brand" : "text-ink-2 hover:bg-sunken hover:text-ink",
              )}
            >
              {t.label} <span className={cn("num ml-0.5", status === t.id ? "text-on-brand/80" : "text-ink-3")}>{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">Search IPOs</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              syncUrl({ q: e.target.value });
            }}
            placeholder="Search company or sector"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pr-3 pl-9 text-sm placeholder:text-ink-3"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-ink-3">Board</span>
          <select value={board} onChange={(e) => setBoard(e.target.value as typeof board)} className="rounded-lg border border-line bg-surface px-2 py-1.5">
            <option value="all">All</option>
            <option value="Mainboard">Mainboard</option>
            <option value="SME">SME</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-ink-3">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-lg border border-line bg-surface px-2 py-1.5">
            <option value="date">Status &amp; date</option>
            <option value="size">Issue size (largest first)</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={fullOnly} onChange={(e) => setFullOnly(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
          <span>Full analysis available</span>
        </label>
        <p className="ml-auto text-ink-3" aria-live="polite">
          {visible.length} {visible.length === 1 ? "IPO" : "IPOs"}
        </p>
      </div>

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No IPOs match these filters"
            action={
              <button type="button" onClick={reset} className="rounded-lg border border-line px-3 py-2 text-sm font-medium">
                Clear filters
              </button>
            }
          >
            Try a different search term or status. We only list IPOs we have data for, and we never invent listings to
            fill a gap.
          </EmptyState>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((ipo) => (
              <li key={ipo.slug} className="flex">
                <IpoCard ipo={ipo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
