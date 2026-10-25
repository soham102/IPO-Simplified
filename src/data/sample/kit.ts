/**
 * Helpers for building the FICTIONAL sample dataset. Everything produced here
 * carries `status: "sample"` and cites a fictional sample source, so the UI
 * can always label it as such.
 */
import type {
  Citation,
  Claim,
  FinancialYear,
  PricePoint,
  Source,
  SourcedValue,
  Unit,
} from "@/lib/types";

export interface DateCtx {
  /** Today in IST, yyyy-mm-dd. */
  today: string;
  /** today ± n days, yyyy-mm-dd. */
  d: (n: number) => string;
  /** ISO timestamp used as "updatedAt" for sample values. */
  stamp: string;
}

export function dateCtx(today: string): DateCtx {
  const base = new Date(`${today}T00:00:00Z`).getTime();
  return {
    today,
    d: (n) => new Date(base + n * 86400000).toISOString().slice(0, 10),
    stamp: `${today}T00:00:00.000Z`,
  };
}

export function kit(slug: string, companyName: string, ctx: DateCtx, docDaysAgo: number, docType = "Red Herring Prospectus") {
  const sourceId = `${slug}-offer-doc`;
  const source: Source = {
    id: sourceId,
    title: `${companyName}: ${docType} (fictional sample)`,
    kind: "sample",
    publisher: "IPO Simplified sample dataset",
    url: `/sources/${slug}/${sourceId}`,
    documentDate: ctx.d(-docDaysAgo),
    accessedAt: ctx.stamp,
  };
  const cite = (locator?: string): Citation => ({ sourceId, locator });

  function v<T = number>(value: T | null, unit: Unit, period?: string, locator?: string): SourcedValue<T> {
    if (value == null) return na<T>(unit, period);
    return { value, unit, period, citation: cite(locator), status: "sample", updatedAt: ctx.stamp };
  }
  function na<T = number>(unit: Unit, period?: string): SourcedValue<T> {
    return { value: null, unit, period, citation: null, status: "unavailable", updatedAt: ctx.stamp };
  }
  const c = (text: string, locator?: string): Claim => ({ text, citation: cite(locator) });
  const h = (text: string): Claim => ({ text, citation: null, hypothesis: true });

  function fy(
    period: string,
    periodEnd: string,
    f: { rev: number | null; pat: number | null; debt: number | null; nw: number | null; ocf: number | null; eps: number | null },
    locator = "Restated Financial Information",
  ): FinancialYear {
    return {
      period,
      periodEnd,
      months: 12,
      revenue: v(f.rev, "INR_CRORE", period, locator),
      pat: v(f.pat, "INR_CRORE", period, locator),
      borrowings: v(f.debt, "INR_CRORE", period, locator),
      netWorth: v(f.nw, "INR_CRORE", period, locator),
      operatingCashFlow: v(f.ocf, "INR_CRORE", period, `${locator}: Cash Flow Statement`),
      dilutedEps: v(f.eps, "INR", period, "Basis for Offer Price"),
    };
  }

  return { source, sourceId, cite, v, na, c, h, fy };
}

/** Deterministic pseudo-random generator (mulberry32) so sample charts are stable. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fictional daily closes from listing day to `end`, drifting from `start` to
 * roughly `target`. Weekends are skipped. Used ONLY in sample mode.
 */
export function samplePriceSeries(
  startDate: string,
  endDate: string,
  start: number,
  target: number,
  seed: number,
): PricePoint[] {
  const rand = rng(seed);
  const days: string[] = [];
  for (let t = new Date(`${startDate}T00:00:00Z`); t.toISOString().slice(0, 10) <= endDate; t = new Date(t.getTime() + 86400000)) {
    const dow = t.getUTCDay();
    if (dow !== 0 && dow !== 6) days.push(t.toISOString().slice(0, 10));
  }
  const n = Math.max(days.length - 1, 1);
  let price = start;
  return days.map((date, i) => {
    if (i > 0) {
      const pull = (start + ((target - start) * i) / n - price) * 0.15;
      price = Math.max(1, price + pull + (rand() - 0.5) * start * 0.03);
    }
    return { date, close: Math.round(price * 100) / 100 };
  });
}
