import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, formatNumber, formatSignedPct } from "@/lib/format";
import { safeDivide } from "@/lib/finance";
import type { IpoSummary } from "@/lib/types";
import { CoverageBadge, IpoStatusBadge, VerificationTag } from "@/components/ui/indicators";
import { Term } from "@/components/ui/term";
import { Value } from "@/components/ui/value";
import { WatchButton } from "./watch-button";

function priceBand(s: IpoSummary) {
  const lo = s.priceLow.value;
  const hi = s.priceHigh.value;
  if (lo == null || hi == null) return null;
  return lo === hi ? formatNumber(hi, "INR") : `${formatNumber(lo, "INR")} – ${formatNumber(hi, "INR")}`;
}

export function IpoCard({ ipo }: { ipo: IpoSummary }) {
  const band = priceBand(ipo);
  const dates =
    ipo.openDate.value && ipo.closeDate.value
      ? `${formatDate(ipo.openDate.value, { short: true })} – ${formatDate(ipo.closeDate.value)}`
      : null;

  return (
    <article className="card group relative flex w-full flex-col p-5 transition-shadow hover:shadow-md focus-within:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <IpoStatusBadge status={ipo.status} />
          {ipo.dataMode === "sample" && <VerificationTag status="sample" />}
        </div>
        <WatchButton slug={ipo.slug} name={ipo.name} compact />
      </div>

      <h3 className="mt-3 font-sans text-lg leading-snug font-semibold">
        <Link href={`/ipos/${ipo.slug}`} className="after:absolute after:inset-0 after:rounded-[14px] focus-visible:outline-none">
          {ipo.name}
        </Link>
      </h3>
      <p className="mt-0.5 text-xs text-ink-3">
        {ipo.exchanges.join(" · ")} · {ipo.board} · {ipo.issueMethod}
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-ink-2">{ipo.tagline}</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-ink-3">{ipo.status === "listed" ? "Listed on" : "Issue dates"}</dt>
          <dd className="mt-0.5 font-medium num">
            {ipo.status === "listed" ? <Value v={ipo.listingDate} /> : dates ?? <span className="text-ink-3 italic font-normal">To be announced</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-3">Price band</dt>
          <dd className="mt-0.5 font-medium num">{band ?? <span className="text-ink-3 italic font-normal">Not announced</span>}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-3">Min. application</dt>
          <dd className="mt-0.5 font-medium">
            <Value v={ipo.minInvestment} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-3">Issue size</dt>
          <dd className="mt-0.5 font-medium">
            <Value v={ipo.issueSize} digits={1} />
          </dd>
        </div>
      </dl>

      {ipo.status !== "listed" && <GmpRow ipo={ipo} />}

      <div className="mt-4 flex items-center justify-between pt-1">
        <CoverageBadge coverage={ipo.coverage} />
        <span className="inline-flex items-center gap-0.5 text-sm font-medium text-series">
          View analysis <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

/** Grey market premium: unofficial, so always shown with its source and time, in neutral colours. */
function GmpRow({ ipo }: { ipo: IpoSummary }) {
  const g = ipo.gmp?.value ?? null;
  const pct = g != null ? safeDivide(g * 100, ipo.priceHigh.value) : null;
  const asOf = ipo.gmp?.period ? new Date(ipo.gmp.period) : null;
  return (
    <div className="relative z-10 mt-4 rounded-lg border border-line bg-sunken px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-ink-2">
          <Term id="gmp">GMP</Term> <span className="text-xs text-ink-3">(unofficial)</span>
        </span>
        {g != null ? (
          <span className="font-semibold num">
            {g < 0 ? "−" : "+"}₹{Math.abs(g).toLocaleString("en-IN")}
            {pct != null && <span className="ml-1 font-normal text-ink-3">({formatSignedPct(pct)})</span>}
          </span>
        ) : (
          <span className="text-xs text-ink-3 italic">Not available</span>
        )}
      </div>
      {g != null && asOf && (
        <p className="mt-0.5 text-[11px] text-ink-3">
          {ipo.gmpPublisher ?? "Source on IPO page"} ·{" "}
          {asOf.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST · not a
          predictor of listing price
        </p>
      )}
    </div>
  );
}
