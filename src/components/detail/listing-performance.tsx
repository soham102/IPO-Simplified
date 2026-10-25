import { priceChangePct } from "@/lib/finance";
import { formatDate, formatNumber, formatSignedPct } from "@/lib/format";
import type { Ipo } from "@/lib/types";
import { PriceChart } from "@/components/charts/price-chart";
import { VerificationTag } from "@/components/ui/indicators";
import { SourceRef } from "@/components/ui/source-ref";
import { Term } from "@/components/ui/term";
import { Value } from "@/components/ui/value";
import { Callout, Panel } from "./section";

function Change({ v }: { v: number | null }) {
  if (v == null) return <Value v={null} />;
  return <span className={v >= 0 ? "text-good" : "text-risk"}>{formatSignedPct(v)}</span>;
}

/**
 * Post-listing view. Issue price is the upper band (the price retail investors
 * pay at cut-off in a book-built issue) unless a final price is recorded.
 */
export function ListingPerformance({ ipo }: { ipo: Ipo }) {
  const l = ipo.listing;
  if (!l) return null;
  const issue = ipo.priceBand.high.value;
  const listingGain = priceChangePct(issue, l.listingOpen.value);
  const closeGain = priceChangePct(issue, l.listingClose.value);
  const sinceListing = priceChangePct(l.listingClose.value, l.latest.value);
  const sinceIssue = priceChangePct(issue, l.latest.value);

  return (
    <div className="space-y-5">
      <Callout tone="warn">
        <span className="font-medium">Past performance does not predict future returns.</span> Listing-day moves reflect
        short-term demand and market mood, not the long-term value of the business.
      </Callout>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <p className="text-xs text-ink-3">Issue price</p>
          <p className="mt-1 text-2xl font-semibold num">{formatNumber(issue, "INR")}</p>
          <p className="mt-1 text-xs text-ink-3">Upper price band</p>
        </Panel>
        <Panel>
          <p className="text-xs text-ink-3">Listing price (open), <Value v={l.listingDate} date /></p>
          <p className="mt-1 text-2xl font-semibold num"><Value v={l.listingOpen} /></p>
          <p className="mt-1 text-sm num"><Change v={listingGain} /> <Term id="listing-gains">vs issue</Term></p>
        </Panel>
        <Panel>
          <p className="text-xs text-ink-3">Listing-day close</p>
          <p className="mt-1 text-2xl font-semibold num"><Value v={l.listingClose} /></p>
          <p className="mt-1 text-sm num"><Change v={closeGain} /> vs issue</p>
        </Panel>
        <Panel>
          <p className="text-xs text-ink-3">Latest available close{l.latest.period ? `, ${formatDate(l.latest.period)}` : ""}</p>
          <p className="mt-1 text-2xl font-semibold num"><Value v={l.latest} /></p>
          <p className="mt-1 text-sm num"><Change v={sinceIssue} /> vs issue · <Change v={sinceListing} /> since listing close</p>
        </Panel>
      </div>
      <Panel
        title="Price since listing"
        action={
          <span className="flex items-center gap-1.5">
            <VerificationTag status={l.history.status} />
            {l.history.citation && <SourceRef slug={ipo.slug} citation={l.history.citation} />}
          </span>
        }
      >
        {l.history.points.length ? (
          <>
            <PriceChart points={l.history.points} issuePrice={issue} />
            <p className="mt-3 text-xs text-ink-3">
              Daily closing prices. {l.history.status === "sample" ? "This series is fictional sample data, not real trading data." : "Not adjusted for corporate actions unless stated by the source."}{" "}
              The latest price is end-of-day, not real-time.
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-3 italic">
            A daily price history needs a licensed market-data feed, which isn&apos;t connected yet. The prices above are from
            the cited source and are end-of-day, not real-time.
          </p>
        )}
      </Panel>
    </div>
  );
}
