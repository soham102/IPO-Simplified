import Link from "next/link";
import { ArrowRight, BookOpen, FileSearch, Scale, Search, ShieldAlert } from "lucide-react";
import { IpoCard } from "@/components/ipo/ipo-card";
import { AssessmentBadge } from "@/components/ui/indicators";
import { EmptyState } from "@/components/ui/empty-state";
import { LESSONS } from "@/data/lessons";
import { assessAll } from "@/lib/analysis";
import { listIpos, toSummary } from "@/lib/data";
import { todayIST } from "@/lib/format";

export const revalidate = 3600;

const STEPS = [
  { Icon: FileSearch, title: "We read the offer document", text: "Business, financials, risks and the offer structure come from the DRHP/RHP and exchange filings. Every figure links back to its source." },
  { Icon: Scale, title: "We apply published rules", text: "Six areas (business, financials, valuation, growth, risks and IPO structure) are labelled using a methodology you can read. No black-box score." },
  { Icon: BookOpen, title: "We explain it simply", text: "Plain-English explanations, inline definitions and a detailed mode for when you want more depth." },
  { Icon: ShieldAlert, title: "You decide", text: "We show evidence and uncertainty, not verdicts. We never tell you to apply or avoid an IPO." },
];

export default async function Home() {
  const ipos = await listIpos();
  const today = todayIST();
  const summaries = ipos.map((i) => toSummary(i, today));
  const live = summaries.filter((s) => s.status === "open" || s.status === "upcoming").slice(0, 3);
  const listed = summaries
    .filter((s) => s.status === "listed")
    .sort((a, b) => (b.listingDate.value ?? "").localeCompare(a.listingDate.value ?? ""))
    .slice(0, 3);
  const sample = ipos.find((i) => i.coverage === "complete" && i.listing) ?? ipos.find((i) => i.coverage === "complete");
  const sampleAssessments = sample ? assessAll(sample) : [];

  return (
    <div>
      {/* Hero */}
      <section className="grid gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:items-center md:py-20">
        <div>
          <p className="eyebrow">Plain-English IPO research for India</p>
          <h1 className="mt-3 text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl">
            Understand an IPO before you invest.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            Company fundamentals, valuation and risks explained in plain English.
          </p>
          <form action="/ipos" method="get" className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row" role="search">
            <label className="relative flex-1">
              <span className="sr-only">Search IPOs</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                name="q"
                type="search"
                placeholder="Search by company or sector"
                className="w-full rounded-xl border border-line-strong bg-surface py-3 pr-3 pl-11 placeholder:text-ink-3"
              />
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-medium text-on-brand hover:bg-ink">
              Explore IPOs <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
          <p className="mt-4 text-sm text-ink-3">Educational information only. Not investment advice.</p>
        </div>

        {/* Sample analysis */}
        {sample && (
          <aside aria-labelledby="sample-heading" className="card p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <p className="eyebrow" id="sample-heading">{sample.dataMode === "sample" ? "Sample analysis" : "Example analysis"}</p>
              {sample.dataMode === "sample" && <span className="text-xs text-sample">Fictional company</span>}
            </div>
            <p className="mt-2 font-serif text-xl font-semibold">{sample.company.name}</p>
            <p className="mt-1 text-sm text-ink-2">{sample.company.tagline}</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {sampleAssessments.map((a) => (
                <li key={a.category} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm font-medium">{a.title}</span>
                  <AssessmentBadge label={a.label} />
                </li>
              ))}
            </ul>
            <Link href={`/ipos/${sample.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-series">
              See the full analysis <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        )}
      </section>

      {/* Open & upcoming */}
      <section aria-labelledby="upcoming-heading" className="py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="upcoming-heading" className="text-2xl font-semibold">Open &amp; upcoming IPOs</h2>
            <p className="mt-1 text-sm text-ink-2">Issues open now or opening soon.</p>
          </div>
          <Link href="/ipos?status=upcoming" className="shrink-0 text-sm font-medium text-series">View all</Link>
        </div>
        <div className="mt-5">
          {live.length ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {live.map((s) => (
                <li key={s.slug} className="flex"><IpoCard ipo={s} /></li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No open or upcoming IPOs in our data right now">Check back soon, or explore recently listed IPOs.</EmptyState>
          )}
        </div>
      </section>

      {/* Recently listed */}
      <section aria-labelledby="listed-heading" className="py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="listed-heading" className="text-2xl font-semibold">Recently listed</h2>
            <p className="mt-1 text-sm text-ink-2">How recent IPOs have traded since listing. Past performance does not predict future returns.</p>
          </div>
          <Link href="/ipos?status=listed" className="shrink-0 text-sm font-medium text-series">View all</Link>
        </div>
        <div className="mt-5">
          {listed.length ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listed.map((s) => (
                <li key={s.slug} className="flex"><IpoCard ipo={s} /></li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No recently listed IPOs in our data" />
          )}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="py-12">
        <h2 id="how-heading" className="text-2xl font-semibold">How IPO Simplified works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand"><s.Icon className="size-5" aria-hidden /></span>
                <span className="text-sm text-ink-3 num">Step {i + 1}</span>
              </div>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink-2">
          Read the full <Link href="/methodology" className="font-medium text-series underline">methodology</Link>, including
          exactly how each label is assigned and what we leave out.
        </p>
      </section>

      {/* Learn */}
      <section aria-labelledby="learn-heading" className="py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="learn-heading" className="text-2xl font-semibold">New to IPOs? Start here</h2>
            <p className="mt-1 text-sm text-ink-2">Short lessons, each under ten minutes.</p>
          </div>
          <Link href="/learn" className="shrink-0 text-sm font-medium text-series">All lessons</Link>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.slice(0, 6).map((l) => (
            <li key={l.slug}>
              <Link href={`/learn/${l.slug}`} className="card block h-full p-5 hover:border-line-strong">
                <p className="text-xs text-ink-3 num">{l.minutes} min read</p>
                <p className="mt-1 font-semibold">{l.title}</p>
                <p className="mt-1 text-sm text-ink-2">{l.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="my-12 rounded-2xl border border-line bg-sunken p-6 text-sm text-ink-2">
        <p className="font-semibold text-ink">Important</p>
        <p className="mt-1">
          IPO Simplified provides educational information about publicly disclosed IPO details. It is not personalised
          investment advice and does not recommend applying for, buying or selling any security. Grey market premiums are
          shown for reference only and, like subscription numbers, are never treated as a sign of quality. Read the offer document and consider
          speaking to a SEBI-registered investment adviser before investing.
        </p>
      </section>
    </div>
  );
}
