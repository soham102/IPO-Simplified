import type { Metadata } from "next";
import { listSummaries } from "@/lib/data";
import { WatchlistView } from "@/components/ipo/watchlist-view";

export const metadata: Metadata = { title: "Watchlist" };
export const revalidate = 3600;

export default async function WatchlistPage() {
  const items = await listSummaries();
  return (
    <div className="py-10">
      <p className="eyebrow">Watchlist</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">IPOs you&apos;re watching</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Saved on this device only. No account needed, and nothing is sent to our servers.
      </p>
      <div className="mt-8">
        <WatchlistView items={items} />
      </div>
    </div>
  );
}
