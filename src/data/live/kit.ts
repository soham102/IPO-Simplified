/**
 * Helpers for the curated LIVE dataset. Every value carries a real source.
 * Values compiled from secondary sources are marked "unverified" until an
 * editor checks them against the offer document itself.
 */
import type { Citation, Claim, FinancialYear, Peer, Source, SourcedValue, Unit, VerificationStatus } from "@/lib/types";

/** When the dataset was compiled. */
export const COMPILED_AT = "2026-10-25T09:00:00.000+05:30";
const ACCESSED = COMPILED_AT;

export function liveKit(slug: string) {
  const sources: Source[] = [];

  function source(key: string, s: Omit<Source, "id" | "accessedAt">): string {
    const id = `${slug}-${key}`;
    sources.push({ id, accessedAt: ACCESSED, ...s });
    return id;
  }

  const cite = (sourceId: string, locator?: string): Citation => ({ sourceId, locator });

  function v<T = number>(
    value: T | null,
    unit: Unit,
    sourceId: string,
    locator?: string,
    period?: string,
    status: VerificationStatus = "unverified",
  ): SourcedValue<T> {
    if (value == null) return na<T>(unit, period);
    return { value, unit, period, citation: cite(sourceId, locator), status, updatedAt: ACCESSED };
  }
  function na<T = number>(unit: Unit, period?: string): SourcedValue<T> {
    return { value: null, unit, period, citation: null, status: "unavailable", updatedAt: ACCESSED };
  }
  const c = (text: string, sourceId: string, locator?: string): Claim => ({ text, citation: cite(sourceId, locator) });

  function fy(
    period: string,
    periodEnd: string,
    sourceId: string,
    f: { rev: number | null; pat: number | null; nw: number | null; debt: number | null; ocf?: number | null; eps?: number | null },
    opts: { ocfSource?: string; epsSource?: string; epsLocator?: string } = {},
  ): FinancialYear {
    const loc = "Financial information (restated)";
    return {
      period,
      periodEnd,
      months: 12,
      revenue: v(f.rev, "INR_CRORE", sourceId, loc, period),
      pat: v(f.pat, "INR_CRORE", sourceId, loc, period),
      netWorth: v(f.nw, "INR_CRORE", sourceId, loc, period),
      borrowings: v(f.debt, "INR_CRORE", sourceId, loc, period),
      operatingCashFlow: v(f.ocf ?? null, "INR_CRORE", opts.ocfSource ?? sourceId, "Cash flow from operations", period),
      dilutedEps: v(f.eps ?? null, "INR", opts.epsSource ?? sourceId, opts.epsLocator ?? "Peer comparison (from RHP Basis for Offer Price): diluted EPS", period),
    };
  }

  /** Listed peer with the P/E disclosed in the RHP's Basis for Offer Price table. */
  function peer(name: string, pe: number, sourceId: string, asOf: string): Peer {
    const loc = `Peer comparison (from RHP Basis for Offer Price); price as of ${asOf}`;
    return {
      name,
      exchange: "NSE",
      pe: v(pe, "RATIO", sourceId, loc, "FY2026"),
      revenue: na("INR_CRORE", "FY2026"),
      patMargin: na("PERCENT", "FY2026"),
      revenueGrowth: na("PERCENT", "FY2026"),
    };
  }

  return { sources, source, cite, v, na, c, fy, peer };
}
