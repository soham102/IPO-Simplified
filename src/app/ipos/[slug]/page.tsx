import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock } from "lucide-react";
import { assessAll } from "@/lib/analysis";
import { aiConfigured } from "@/lib/ai/claude";
import { getIpo, listIpos, toSummary } from "@/lib/data";
import { safeDivide } from "@/lib/finance";
import { formatDate, formatNumber, formatSignedPct } from "@/lib/format";
import { BullBearSection } from "@/components/detail/bull-bear";
import { BusinessSection } from "@/components/detail/business";
import { FinancialsSection } from "@/components/detail/financials";
import { ListingPerformance } from "@/components/detail/listing-performance";
import { OverviewSection } from "@/components/detail/overview";
import { RisksSection } from "@/components/detail/risks";
import { Callout, SectionTitle } from "@/components/detail/section";
import { SourcesSection } from "@/components/detail/sources";
import { StructureSection } from "@/components/detail/structure";
import { ValuationSection } from "@/components/detail/valuation";
import { WatchButton } from "@/components/ipo/watch-button";
import { ReportErrorButton } from "@/components/layout/report-error";
import { DetailLevelToggle } from "@/components/ui/detail-level";
import { CoverageBadge, IpoStatusBadge, VerificationTag } from "@/components/ui/indicators";
import { Tabs } from "@/components/ui/tabs";
import { SourceRef } from "@/components/ui/source-ref";
import { Term } from "@/components/ui/term";
import { Value } from "@/components/ui/value";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await listIpos()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ipos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ipo = await getIpo(slug);
  return ipo ? { title: `${ipo.company.name} IPO analysis`, description: ipo.company.tagline } : { title: "IPO not found" };
}

export default async function IpoPage({ params }: PageProps<"/ipos/[slug]">) {
  const { slug } = await params;
  const ipo = await getIpo(slug);
  if (!ipo) notFound();

  const summary = toSummary(ipo);
  // GMP is only meaningful before listing.
  const showGmp = summary.status !== "listed";
  const gmp = summary.gmp?.value ?? null;
  const gmpPct = gmp != null ? safeDivide(gmp * 100, ipo.priceBand.high.value) : null;
  const assessments = assessAll(ipo);
  const valuation = assessments.find((a) => a.category === "valuation")!;
  const band =
    ipo.priceBand.low.value != null && ipo.priceBand.high.value != null
      ? ipo.priceBand.low.value === ipo.priceBand.high.value
        ? formatNumber(ipo.priceBand.high.value, "INR")
        : `${formatNumber(ipo.priceBand.low.value, "INR")} – ${formatNumber(ipo.priceBand.high.value, "INR")}`
      : null;

  const tabs = [
    { id: "overview", label: "Overview", content: <OverviewSection ipo={ipo} assessments={assessments} aiEnabled={aiConfigured()} /> },
    { id: "business", label: "Business", content: <BusinessSection ipo={ipo} /> },
    { id: "financials", label: "Financials", content: <FinancialsSection ipo={ipo} /> },
    { id: "valuation", label: "Valuation", content: <ValuationSection ipo={ipo} assessment={valuation} /> },
    { id: "bull-bear", label: "Bull vs bear", content: <BullBearSection ipo={ipo} /> },
    { id: "risks", label: "Risks", content: <RisksSection ipo={ipo} /> },
    { id: "structure", label: "IPO structure", content: <StructureSection ipo={ipo} /> },
    ...(ipo.listing
      ? [{
          id: "performance",
          label: "Since listing",
          content: (
            <div>
              <SectionTitle title="Post-listing performance" />
              <ListingPerformance ipo={ipo} />
              <Link href={`/ipos/${ipo.slug}/performance`} className="mt-4 inline-block text-sm font-medium text-series underline">
                Open the full performance page
              </Link>
            </div>
          ),
        }]
      : []),
    { id: "sources", label: "Sources", content: <SourcesSection ipo={ipo} /> },
  ];

  return (
    <div className="py-8">
      <Link href="/ipos" className="-my-2 inline-flex items-center gap-1 py-2 text-sm text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> All IPOs
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <IpoStatusBadge status={summary.status} />
          <CoverageBadge coverage={ipo.coverage} />
          {ipo.dataMode === "sample" && <VerificationTag status="sample" />}
          {ipo.dataMode === "live" && <VerificationTag status="unverified" />}
        </div>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold sm:text-4xl">{ipo.company.name}</h1>
            <p className="mt-1.5 max-w-2xl text-ink-2">{ipo.company.tagline}</p>
            <p className="mt-1 text-sm text-ink-3">
              {ipo.company.sector} · {ipo.exchanges.join(" & ")} · {ipo.board} · {ipo.issueMethod}
              {ipo.company.headquarters && <> · {ipo.company.headquarters}</>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WatchButton slug={ipo.slug} name={ipo.company.name} />
            <ReportErrorButton context={ipo.slug} />
          </div>
        </div>

        <dl className={`card mt-6 grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3 ${showGmp ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          <div>
            <dt className="text-xs text-ink-3">Price band</dt>
            <dd className="mt-1 font-semibold num">{band ?? <Value v={null} />}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Issue dates</dt>
            <dd className="mt-1 font-semibold num">
              {ipo.dates.open.value && ipo.dates.close.value ? `${formatDate(ipo.dates.open.value, { short: true })} – ${formatDate(ipo.dates.close.value)}` : <span className="text-sm font-normal text-ink-3 italic">To be announced</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">{summary.status === "listed" ? "Listed on" : "Listing (indicative)"}</dt>
            <dd className="mt-1 font-semibold"><Value v={ipo.dates.listing} date /></dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Min. application</dt>
            <dd className="mt-1 font-semibold"><Value v={summary.minInvestment} /></dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Issue size</dt>
            <dd className="mt-1 font-semibold"><Value v={ipo.issueSize.total} /></dd>
          </div>
          {showGmp && (
            <div>
              <dt className="text-xs text-ink-3">
                <Term id="gmp">GMP</Term> (unofficial)
              </dt>
              <dd className="mt-1 font-semibold num">
                {gmp != null ? (
                  <>
                    {gmp < 0 ? "−" : "+"}₹{Math.abs(gmp).toLocaleString("en-IN")}
                    {gmpPct != null && <span className="ml-1 text-sm font-normal text-ink-3">({formatSignedPct(gmpPct)})</span>}
                  </>
                ) : (
                  <Value v={null} />
                )}
              </dd>
              {gmp != null && summary.gmp?.period && (
                <dd className="mt-1 text-[11px] text-ink-3">
                  {summary.gmpPublisher} ·{" "}
                  {new Date(summary.gmp.period).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}{" "}
                  IST <SourceRef slug={ipo.slug} citation={summary.gmp.citation} className="ml-0.5 align-middle" />
                </dd>
              )}
            </div>
          )}
        </dl>
        {showGmp && gmp != null && (
          <p className="mt-2 text-xs text-ink-3">
            GMP is an unregulated grey-market quote, shown for reference only. It is not a predictor of the listing price and
            is not used anywhere in this analysis.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-xs text-ink-3">
            <Clock className="size-3.5" aria-hidden />
            Last reviewed {formatDate(ipo.lastReviewed)} · Data as of the dates shown on each source
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-3">Explanations:</span>
            <DetailLevelToggle />
          </div>
        </div>
        {ipo.dataMode === "sample" && (
          <div className="mt-4">
            <Callout tone="sample">
              <strong>This is a fictional company.</strong> Every figure, peer and document on this page is invented sample
              data used to demonstrate how IPO Simplified explains an IPO.
            </Callout>
          </div>
        )}
      </header>

      <div className="mt-6">
        <Tabs tabs={tabs} label="IPO analysis sections" />
      </div>

      <p className="mt-12 border-t border-line pt-6 text-xs text-ink-3">
        Educational information only, not investment advice. Labels follow our published{" "}
        <Link href="/methodology" className="underline">methodology</Link> and do not indicate whether you should apply. Read
        the offer document before making any investment decision.
      </p>
    </div>
  );
}
