import "server-only";
import { cache } from "react";
import { minInvestment } from "@/lib/finance";
import { deriveStatus, todayIST } from "@/lib/format";
import type { Ipo, IpoSummary, Source, SourcedValue } from "@/lib/types";
import { CuratedProvider } from "./curated-provider";
import { MockProvider } from "./mock-provider";
import { DataProviderError, type IpoDataProvider } from "./provider";
import { SupabaseProvider } from "./supabase-provider";

export { DataProviderError };

let curated: CuratedProvider | null = null;

/** Picks the provider from env. Misconfiguration is an error, not a silent switch to mock data. */
export function getProvider(): IpoDataProvider {
  const mode = (process.env.DATA_PROVIDER ?? "curated").toLowerCase();
  if (mode === "curated") return (curated ??= new CuratedProvider());
  if (mode === "mock") return new MockProvider();
  if (mode === "supabase") {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new DataProviderError("DATA_PROVIDER=supabase but SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set", "Supabase");
    }
    return new SupabaseProvider(url, key);
  }
  throw new DataProviderError(`Unknown DATA_PROVIDER "${mode}"`, mode);
}

/** The configured mode, without constructing a provider (safe to call in layouts). */
export function configuredDataMode(): "sample" | "live" {
  return (process.env.DATA_PROVIDER ?? "curated").toLowerCase() === "mock" ? "sample" : "live";
}

export const listIpos = cache(async (): Promise<Ipo[]> => getProvider().listIpos());

export const getIpo = cache(async (slug: string): Promise<Ipo | null> => getProvider().getIpo(slug));

export function toSummary(ipo: Ipo, today = todayIST()): IpoSummary {
  const hi = ipo.priceBand.high;
  const lot = ipo.lotSize;
  const minAmt = minInvestment(lot.value, hi.value);
  // Derived value: only as verified as the weaker of its two inputs.
  const weaker = [hi.status, lot.status].includes("unavailable")
    ? "unavailable"
    : [hi.status, lot.status].includes("sample")
      ? "sample"
      : [hi.status, lot.status].includes("unverified")
        ? "unverified"
        : "verified";
  const minInvestmentValue: SourcedValue = {
    value: minAmt,
    unit: "INR",
    citation: minAmt == null ? null : hi.citation,
    status: minAmt == null ? "unavailable" : weaker,
    updatedAt: hi.updatedAt,
  };
  const status = deriveStatus(ipo.dates, today);
  return {
    id: ipo.id,
    slug: ipo.slug,
    dataMode: ipo.dataMode,
    name: ipo.company.name,
    tagline: ipo.company.tagline,
    sector: ipo.company.sector,
    exchanges: ipo.exchanges,
    board: ipo.board,
    issueMethod: ipo.issueMethod,
    status,
    coverage: ipo.coverage,
    openDate: ipo.dates.open,
    closeDate: ipo.dates.close,
    listingDate: ipo.dates.listing,
    priceLow: ipo.priceBand.low,
    priceHigh: hi,
    minInvestment: minInvestmentValue,
    issueSize: ipo.issueSize.total,
    // GMP stops being meaningful once real trading starts.
    gmp: status === "listed" ? null : (ipo.gmp ?? null),
    gmpPublisher: ipo.sources.find((s) => s.id === ipo.gmp?.citation?.sourceId)?.publisher ?? null,
    lastReviewed: ipo.lastReviewed,
  };
}

export async function listSummaries(): Promise<IpoSummary[]> {
  const today = todayIST();
  return (await listIpos()).map((i) => toSummary(i, today));
}

export async function getSource(slug: string, sourceId: string): Promise<{ ipo: Ipo; source: Source } | null> {
  const ipo = await getIpo(slug);
  const source = ipo?.sources.find((s) => s.id === sourceId);
  return ipo && source ? { ipo, source } : null;
}
