import type { Assessment } from "@/lib/analysis";
import { minInvestment } from "@/lib/finance";
import { formatNumber, formatSignedPct } from "@/lib/format";
import { computeValuation, computeYearMetrics, describePe, type ValuationSnapshot } from "@/lib/metrics";
import type { Ipo } from "@/lib/types";
import { PeerPeChart } from "@/components/charts/peer-pe-chart";
import { Detailed } from "@/components/ui/detail-level";
import { AssessmentBadge } from "@/components/ui/indicators";
import { SourceRef } from "@/components/ui/source-ref";
import { Term } from "@/components/ui/term";
import { Value } from "@/components/ui/value";
import { Callout, Panel, SectionTitle } from "./section";

function interpretation(ipo: Ipo, v: ValuationSnapshot): string[] {
  const out: string[] = [];
  if (v.peUpper.kind === "negative_earnings") {
    out.push(
      `${ipo.company.name} made a loss in ${v.epsPeriod}, so a P/E ratio can't be calculated. Comparing its price with peers on earnings isn't possible; other measures (such as price-to-sales) would be needed, and those depend on assumptions about future profitability.`,
    );
    return out;
  }
  if (v.peUpper.kind !== "ok") {
    out.push("We can't calculate a P/E ratio because the price band or earnings per share is not yet available.");
    return out;
  }
  if (v.peerMedianPe == null || v.peersWithPe < 2) {
    out.push(
      `At the upper band the P/E is ${describePe(v.peUpper)}, but there aren't enough listed peers with a disclosed P/E to make a fair comparison.`,
    );
    return out;
  }
  const prem = v.premiumToPeersPct!;
  const dir = prem >= 0 ? "above" : "below";
  out.push(
    `At the upper band, the P/E of ${describePe(v.peUpper)} is ${Math.abs(prem).toFixed(0)}% ${dir} the median (${v.peerMedianPe.toFixed(1)}x) of the ${v.peersWithPe} listed peers named in the offer document.`,
  );
  if (v.latestGrowth != null && v.peerMedianGrowth != null) {
    const faster = v.latestGrowth > v.peerMedianGrowth;
    out.push(
      `Its latest revenue growth (${formatNumber(v.latestGrowth, "PERCENT")}) is ${faster ? "higher" : "lower"} than the peer median (${formatNumber(v.peerMedianGrowth, "PERCENT")})${prem > 0 && faster ? ", which may partly explain a higher multiple" : prem > 0 && !faster ? ", so faster growth does not explain the higher multiple" : ""}.`,
    );
  }
  if (v.latestMargin != null && v.peerMedianMargin != null) {
    const better = v.latestMargin >= v.peerMedianMargin;
    out.push(
      `Its profit margin (${formatNumber(v.latestMargin, "PERCENT")}) is ${better ? "at or above" : "below"} the peer median (${formatNumber(v.peerMedianMargin, "PERCENT")})${!better && prem < 0 ? ", which may partly explain the lower multiple" : ""}.`,
    );
  }
  return out;
}

export function ValuationSection({ ipo, assessment }: { ipo: Ipo; assessment: Assessment }) {
  const v = computeValuation(ipo);
  const minApp = minInvestment(ipo.lotSize.value, ipo.priceBand.high.value);
  const peerCite = ipo.peers[0]?.pe.citation ?? null;
  // Only show peer fundamentals columns when at least one peer has them.
  const showFund = ipo.peers.some((p) => p.revenue.value != null || p.patMargin.value != null || p.revenueGrowth.value != null);
  const chartData = [
    ...(v.peUpper.kind === "ok" ? [{ name: `${ipo.company.name} (IPO)`, pe: v.peUpper.value, isIpo: true }] : []),
    ...ipo.peers.filter((p) => p.pe.value != null).map((p) => ({ name: p.name, pe: p.pe.value!, isIpo: false })),
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Valuation"
        intro="Is the price reasonable compared with similar listed companies? We show the numbers, how they were calculated, and what the comparison can't tell you."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={<Term id="price-band">Price band</Term>}>
          <p className="text-2xl font-semibold num">
            {ipo.priceBand.low.value != null && ipo.priceBand.high.value != null ? (
              ipo.priceBand.low.value === ipo.priceBand.high.value ? (
                formatNumber(ipo.priceBand.high.value, "INR")
              ) : (
                `${formatNumber(ipo.priceBand.low.value, "INR")} – ${formatNumber(ipo.priceBand.high.value, "INR")}`
              )
            ) : (
              <Value v={null} />
            )}
          </p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-ink-3"><Term id="lot-size">Lot size</Term></dt><dd className="num"><Value v={ipo.lotSize} /> {ipo.lotSize.value != null && "shares"}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-ink-3">Minimum application</dt><dd className="num">{minApp != null ? formatNumber(minApp, "INR") : <Value v={null} />}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-ink-3">Face value</dt><dd className="num"><Value v={ipo.faceValue} /></dd></div>
          </dl>
          <SourceRef slug={ipo.slug} citation={ipo.priceBand.high.citation} className="mt-3" />
        </Panel>

        <Panel title="Earnings-based valuation" className="lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-3"><Term id="eps">EPS</Term> used{v.epsPeriod ? ` (${v.epsPeriod}, diluted)` : ""}</dt>
              <dd className="mt-1 text-lg font-semibold num">{v.latestEps != null ? formatNumber(v.latestEps, "INR") : <Value v={null} />}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3"><Term id="pe-ratio">P/E</Term> at upper / lower band</dt>
              <dd className="mt-1 text-lg font-semibold num">
                {v.peUpper.kind === "ok" && v.peLower.kind === "ok" ? `${describePe(v.peUpper)} / ${describePe(v.peLower)}` : <span className="text-sm font-normal text-ink-3 italic">{describePe(v.peUpper)}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Post-issue <Term id="market-cap">market cap</Term> (upper band)</dt>
              <dd className="mt-1 text-lg font-semibold num">{v.marketCap != null ? formatNumber(v.marketCap, "INR_CRORE", 0) : <Value v={null} />}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Post-issue P/E (market cap ÷ latest profit)</dt>
              <dd className="mt-1 text-lg font-semibold num">
                {v.postIssuePe.kind === "ok" ? describePe(v.postIssuePe) : <span className="text-sm font-normal text-ink-3 italic">{describePe(v.postIssuePe)}</span>}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-3">
            <span className="font-medium text-ink-2">Calculation basis:</span> P/E = price ÷ latest full-year diluted EPS
            as disclosed in the offer document (pre-issue shares). Post-issue P/E uses all shares outstanding after the IPO,
            so it reflects dilution from the fresh issue.
          </p>
        </Panel>
      </div>

      <Panel title="How does the price compare?" action={<AssessmentBadge label={assessment.label} />}>
        <div className="space-y-2 text-ink-2">
          {interpretation(ipo, v).map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-3">Label rule applied: {assessment.reason}</p>
      </Panel>

      {ipo.peers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Panel title="P/E: IPO vs listed peers">
            {chartData.length > 1 ? (
              <PeerPeChart data={chartData} median={v.peerMedianPe} />
            ) : (
              <p className="text-sm text-ink-3 italic">Not enough P/E data to chart a comparison.</p>
            )}
          </Panel>
          <Panel title="Peer comparison" action={<SourceRef slug={ipo.slug} citation={peerCite} />}>
            <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
              <table className={showFund ? "w-full min-w-[480px] text-sm" : "w-full text-sm"}>
                <caption className="sr-only">Peer valuation and profitability</caption>
                <thead>
                  <tr className="text-xs text-ink-3">
                    <th scope="col" className="pb-2 text-left font-medium">Company</th>
                    <th scope="col" className="pb-2 text-right font-medium">P/E</th>
                    {showFund && (
                      <>
                        <th scope="col" className="pb-2 text-right font-medium">Revenue</th>
                        <th scope="col" className="pb-2 text-right font-medium">Margin</th>
                        <th scope="col" className="pb-2 text-right font-medium">Growth</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="num">
                  <tr className="border-t border-line bg-brand-soft/50 font-medium">
                    <th scope="row" className="py-2.5 pr-2 text-left">{ipo.company.name} <span className="font-normal text-ink-3">(IPO, upper band)</span></th>
                    <td className="py-2.5 text-right">{describePe(v.peUpper).replace("Not meaningful (loss-making)", "n/m")}</td>
                    {showFund && (
                      <>
                        <td className="py-2.5 text-right">{formatNumber(computeYearMetrics(ipo.financials).at(-1)?.revenue, "INR_CRORE", 0)}</td>
                        <td className="py-2.5 text-right">{formatNumber(v.latestMargin, "PERCENT")}</td>
                        <td className="py-2.5 text-right">{formatSignedPct(v.latestGrowth)}</td>
                      </>
                    )}
                  </tr>
                  {ipo.peers.map((p) => (
                    <tr key={p.name} className="border-t border-line">
                      <th scope="row" className="py-2.5 pr-2 text-left font-normal">{p.name}</th>
                      <td className="py-2.5 text-right"><Value v={p.pe} /></td>
                      {showFund && (
                        <>
                          <td className="py-2.5 text-right"><Value v={p.revenue} digits={0} /></td>
                          <td className="py-2.5 text-right"><Value v={p.patMargin} /></td>
                          <td className="py-2.5 text-right">{formatSignedPct(p.revenueGrowth.value)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="border-t border-line-strong text-ink-2">
                    <th scope="row" className="py-2.5 pr-2 text-left font-medium">Peer median</th>
                    <td className="py-2.5 text-right">{formatNumber(v.peerMedianPe, "RATIO")}</td>
                    {showFund && (
                      <>
                        <td className="py-2.5 text-right">—</td>
                        <td className="py-2.5 text-right">{formatNumber(v.peerMedianMargin, "PERCENT")}</td>
                        <td className="py-2.5 text-right">{formatSignedPct(v.peerMedianGrowth)}</td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink-3">
              Peer P/E ratios are for {ipo.peers[0]?.pe.period ?? "the period stated in the source"} as disclosed in the offer document. n/m = not meaningful.
              {!showFund && " Peer revenue, margins and growth aren't in our data yet, so the comparison is P/E only."}
            </p>
          </Panel>
        </div>
      ) : (
        <Callout tone="warn">
          No listed peers are named in the sources reviewed, so we can&apos;t compare this IPO&apos;s valuation with similar
          companies. That&apos;s a gap in the evidence, not a sign that the price is fair or unfair.
        </Callout>
      )}

      <Panel title="Limitations of this comparison">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>Peers are those chosen in the offer document; they may differ in size, product mix or business model.</li>
          <li>P/E uses a single year&apos;s earnings, which may be unusually high or low.</li>
          <li>Peer P/E ratios change daily with share prices; offer-document figures are a snapshot.</li>
          <li>P/E ignores debt. A company with heavy borrowings can look cheaper on P/E than it really is.</li>
          <Detailed>
            <li>Enterprise-value measures (EV/EBITDA) and price-to-book are not shown because EBITDA and book value per share for peers aren&apos;t yet in our dataset.</li>
          </Detailed>
        </ul>
      </Panel>
    </div>
  );
}
