import Link from "next/link";
import type { Assessment } from "@/lib/analysis";
import { formatNumber } from "@/lib/format";
import { computeValuation, computeYearMetrics, describePe } from "@/lib/metrics";
import type { Ipo } from "@/lib/types";
import { SourceRef } from "@/components/ui/source-ref";
import { Term } from "@/components/ui/term";
import { Unavailable } from "@/components/ui/value";
import { AssessmentCard } from "./assessment-card";
import { AiExplainer } from "./ai-explainer";
import { Callout, Panel, SectionTitle } from "./section";

function Stat({ label, value, sub }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="mt-1 text-xl font-semibold num">{value}</dd>
      {sub && <dd className="mt-0.5 text-xs text-ink-3">{sub}</dd>}
    </div>
  );
}

export function OverviewSection({ ipo, assessments, aiEnabled }: { ipo: Ipo; assessments: Assessment[]; aiEnabled: boolean }) {
  const metrics = computeYearMetrics(ipo.financials);
  const latest = metrics[metrics.length - 1];
  const v = computeValuation(ipo);
  const fmt = (n: number | null | undefined, unit: Parameters<typeof formatNumber>[1]) =>
    n == null ? <Unavailable /> : formatNumber(n, unit);

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle title="The two-minute version" />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            {ipo.business ? (
              <div className="space-y-3 text-ink-2">
                <p>
                  <span className="font-semibold text-ink">What it does. </span>
                  {ipo.business.whatItDoes.text} <SourceRef slug={ipo.slug} citation={ipo.business.whatItDoes.citation} className="align-middle" />
                </p>
                {ipo.business.revenueModel && (
                  <p>
                    <span className="font-semibold text-ink">How it makes money. </span>
                    {ipo.business.revenueModel.text} <SourceRef slug={ipo.slug} citation={ipo.business.revenueModel.citation} className="align-middle" />
                  </p>
                )}
                {ipo.business.customers && (
                  <p>
                    <span className="font-semibold text-ink">Scale. </span>
                    {ipo.business.customers.text} <SourceRef slug={ipo.slug} citation={ipo.business.customers.citation} className="align-middle" />
                  </p>
                )}
              </div>
            ) : (
              <p className="text-ink-3 italic">Business description not yet available.</p>
            )}
          </Panel>
          <Panel>
            <dl className="grid grid-cols-2 gap-5">
              <Stat label={`Revenue${latest ? ` (${latest.period})` : ""}`} value={fmt(latest?.revenue, "INR_CRORE")} />
              <Stat label={`Profit after tax${latest ? ` (${latest.period})` : ""}`} value={fmt(latest?.pat, "INR_CRORE")} />
              <Stat label="Profit margin" value={fmt(latest?.patMargin, "PERCENT")} />
              <Stat
                label={<><Term id="pe-ratio">P/E</Term> at upper band</>}
                value={v.peUpper.kind === "ok" ? describePe(v.peUpper) : <span className="text-sm font-normal text-ink-3 italic">{describePe(v.peUpper)}</span>}
                sub={v.peerMedianPe != null ? `Peer median ${v.peerMedianPe.toFixed(1)}x` : undefined}
              />
            </dl>
          </Panel>
        </div>
      </div>

      <div>
        <SectionTitle
          title="Analysis framework"
          intro={
            <>
              Six areas, each labelled by published rules. Labels describe the evidence; they are not a rating or a
              recommendation. <Link href="/methodology" className="font-medium text-series underline">How labels are assigned</Link>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assessments.map((a) => (
            <AssessmentCard key={a.category} a={a} slug={ipo.slug} />
          ))}
        </div>
        <div className="mt-4">
          <Callout>
            Grey-market premium (GMP) and subscription figures are deliberately not part of this framework. They measure
            short-term demand, not business quality or value. <Link href="/learn/what-is-gmp" className="font-medium text-series underline">Why?</Link>
          </Callout>
        </div>
      </div>

      <AiExplainer slug={ipo.slug} enabled={aiEnabled} />
    </div>
  );
}
