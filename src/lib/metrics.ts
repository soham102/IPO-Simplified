import {
  cagrPct,
  debtToEquity,
  growthPct,
  marginPct,
  marketCapCrore,
  median,
  peRatio,
  safeDivide,
  type PeResult,
} from "./finance";
import type { FinancialStatements, FinancialYear, Ipo } from "./types";

export interface YearMetrics {
  period: string;
  months: number;
  revenue: number | null;
  revenueGrowth: number | null;
  pat: number | null;
  patMargin: number | null;
  borrowings: number | null;
  netWorth: number | null;
  debtToEquity: number | null;
  operatingCashFlow: number | null;
  dilutedEps: number | null;
  source: FinancialYear;
}

/** Full-year periods sorted oldest → newest. Partial periods are excluded from trend maths. */
export function fullYears(fs: FinancialStatements | null): FinancialYear[] {
  if (!fs) return [];
  return fs.years.filter((y) => y.months === 12).sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
}

export function computeYearMetrics(fs: FinancialStatements | null): YearMetrics[] {
  const years = fullYears(fs);
  return years.map((y, i) => {
    const prev = i > 0 ? years[i - 1] : undefined;
    return {
      period: y.period,
      months: y.months,
      revenue: y.revenue.value,
      revenueGrowth: prev ? growthPct(y.revenue.value, prev.revenue.value) : null,
      pat: y.pat.value,
      patMargin: marginPct(y.pat.value, y.revenue.value),
      borrowings: y.borrowings.value,
      netWorth: y.netWorth.value,
      debtToEquity: debtToEquity(y.borrowings.value, y.netWorth.value),
      operatingCashFlow: y.operatingCashFlow.value,
      dilutedEps: y.dilutedEps.value,
      source: y,
    };
  });
}

/** Revenue CAGR across the available full years (needs ≥ 2). */
export function revenueCagr(metrics: YearMetrics[]): number | null {
  if (metrics.length < 2) return null;
  const first = metrics[0]!;
  const last = metrics[metrics.length - 1]!;
  return cagrPct(first.revenue, last.revenue, metrics.length - 1);
}

export interface ValuationSnapshot {
  priceLow: number | null;
  priceHigh: number | null;
  epsPeriod: string | null;
  latestEps: number | null;
  /** P/E at the upper band on latest full-year diluted (pre-issue) EPS. */
  peUpper: PeResult;
  peLower: PeResult;
  /** Post-issue market cap at upper band, ₹ crore. */
  marketCap: number | null;
  /** Post-issue market cap ÷ latest PAT — accounts for dilution from the fresh issue. */
  postIssuePe: PeResult;
  latestMargin: number | null;
  latestGrowth: number | null;
  peerCount: number;
  peersWithPe: number;
  peerMedianPe: number | null;
  peerMedianMargin: number | null;
  peerMedianGrowth: number | null;
  /** (IPO P/E ÷ peer median P/E − 1) × 100, using the upper-band P/E. */
  premiumToPeersPct: number | null;
}

export function computeValuation(ipo: Ipo): ValuationSnapshot {
  const metrics = computeYearMetrics(ipo.financials);
  const latest = metrics[metrics.length - 1];
  const priceHigh = ipo.priceBand.high.value;
  const priceLow = ipo.priceBand.low.value;
  const latestEps = latest?.dilutedEps ?? null;
  const peUpper = peRatio(priceHigh, latestEps);
  const marketCap = marketCapCrore(priceHigh, ipo.postIssueShares.value);
  const postIssuePe: PeResult =
    marketCap == null || latest?.pat == null
      ? { kind: "missing" }
      : latest.pat < 0
        ? { kind: "negative_earnings" }
        : latest.pat === 0
          ? { kind: "zero_earnings" }
          : { kind: "ok", value: marketCap / latest.pat };

  const peerPes = ipo.peers.map((p) => p.pe.value).filter((v): v is number => v != null && v > 0);
  const peerMedianPe = median(peerPes);
  const premium =
    peUpper.kind === "ok" && peerMedianPe != null
      ? (safeDivide(peUpper.value, peerMedianPe)! - 1) * 100
      : null;

  return {
    priceLow,
    priceHigh,
    epsPeriod: latest?.period ?? null,
    latestEps,
    peUpper,
    peLower: peRatio(priceLow, latestEps),
    marketCap,
    postIssuePe,
    latestMargin: latest?.patMargin ?? null,
    latestGrowth: latest?.revenueGrowth ?? null,
    peerCount: ipo.peers.length,
    peersWithPe: peerPes.length,
    peerMedianPe,
    peerMedianMargin: median(ipo.peers.map((p) => p.patMargin.value)),
    peerMedianGrowth: median(ipo.peers.map((p) => p.revenueGrowth.value)),
    premiumToPeersPct: premium,
  };
}

export function describePe(pe: PeResult): string {
  switch (pe.kind) {
    case "ok":
      return `${pe.value.toFixed(1)}x`;
    case "negative_earnings":
      return "Not meaningful (loss-making)";
    case "zero_earnings":
      return "Not meaningful (zero earnings)";
    case "missing":
      return "Data unavailable";
  }
}
