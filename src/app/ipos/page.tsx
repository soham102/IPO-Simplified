import Link from "next/link";
import type { Metadata } from "next";
import { IpoExplorer, type StatusFilter } from "@/components/ipo/ipo-explorer";
import { configuredDataMode, listSummaries } from "@/lib/data";

export const metadata: Metadata = { title: "Explore IPOs" };

const STATUSES: StatusFilter[] = ["all", "open", "upcoming", "closed", "listed"];

export default async function IposPage({ searchParams }: PageProps<"/ipos">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && STATUSES.includes(sp.status as StatusFilter) ? (sp.status as StatusFilter) : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const items = await listSummaries();

  return (
    <div className="py-10">
      <p className="eyebrow">IPO dashboard</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Explore IPOs</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Browse current and recent Indian IPOs. Each card shows the basics from the offer document; open one for a
        plain-English breakdown of the business, financials, valuation and risks.
      </p>
      {configuredDataMode() === "sample" && (
        <p className="mt-3 text-sm text-sample">
          Showing fictional sample IPOs. Dates are generated relative to today so every tab has examples.
        </p>
      )}
      <div className="mt-8">
        <IpoExplorer items={items} initialStatus={status} initialQuery={q} />
      </div>
      <p className="mt-8 text-xs text-ink-3">
        GMP (grey market premium) is an unofficial, unregulated quote, shown for reference with its source and time. It and
        subscription figures reflect short-term demand, not whether a business is sound or fairly priced, and are not used in
        our analysis. <Link href="/learn/what-is-gmp" className="underline">Why GMP is unreliable</Link>
      </p>
    </div>
  );
}
