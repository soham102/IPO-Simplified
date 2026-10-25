import { describe, expect, it } from "vitest";
import { SAMPLE_COMPANIES } from "@/data/sample/companies";
import { dateCtx } from "@/data/sample/kit";
import { assessAll, assessFinancial, assessStructure, assessValuation, METHODOLOGY } from "./analysis";
import { deriveStatus } from "./format";
import { computeValuation, computeYearMetrics, revenueCagr } from "./metrics";
import { ipoSchema } from "./schema";
import type { Ipo } from "./types";

const TODAY = "2026-10-25";
const ctx = dateCtx(TODAY);
const all = SAMPLE_COMPANIES.map((f) => f(ctx));
const bySlug = (s: string) => {
  const ipo = all.find((i) => i.slug === s);
  if (!ipo) throw new Error(`missing ${s}`);
  return structuredClone(ipo) as Ipo;
};
const label = (ipo: Ipo, cat: string) => assessAll(ipo).find((a) => a.category === cat)!.label;

describe("sample dataset integrity", () => {
  it.each(all.map((i) => [i.slug, i]))("%s passes schema validation", (_slug, ipo) => {
    const r = ipoSchema.safeParse(ipo);
    if (!r.success) throw new Error(JSON.stringify(r.error.issues.slice(0, 3), null, 2));
  });

  it("every record is marked as sample data", () => {
    for (const ipo of all) {
      expect(ipo.dataMode).toBe("sample");
      expect(ipo.sources.every((s) => s.kind === "sample")).toBe(true);
    }
  });

  it("covers every status tab", () => {
    const statuses = new Set(all.map((i) => deriveStatus(i.dates, TODAY)));
    expect([...statuses].sort()).toEqual(["closed", "listed", "open", "upcoming"]);
  });
});

describe("schema guards source integrity", () => {
  it("rejects a value without a citation", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.priceBand.high.citation = null;
    expect(ipoSchema.safeParse(ipo).success).toBe(false);
  });
  it("rejects a citation to an unknown source", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.lotSize.citation = { sourceId: "nope" };
    expect(ipoSchema.safeParse(ipo).success).toBe(false);
  });
  it("rejects a non-null value marked unavailable", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.lotSize.status = "unavailable";
    expect(ipoSchema.safeParse(ipo).success).toBe(false);
  });
  it("rejects an uncited claim not flagged as hypothesis", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.bullCase[0]!.citation = null;
    expect(ipoSchema.safeParse(ipo).success).toBe(false);
  });
  it("rejects live records that contain sample values", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.dataMode = "live";
    expect(ipoSchema.safeParse(ipo).success).toBe(false);
  });
  it("rejects malformed dates", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.dates.open.value = "25/10/2026";
    expect(ipoSchema.safeParse(ipo).success).toBe(false);
  });
});

describe("deriveStatus", () => {
  const d = (open: string | null, close: string | null, listing: string | null) => {
    const sv = (v: string | null) => ({ value: v, unit: "DATE" as const, citation: null, status: "sample" as const, updatedAt: "" });
    return { open: sv(open), close: sv(close), allotment: sv(null), listing: sv(listing) };
  };
  it("upcoming when dates are unknown", () => expect(deriveStatus(d(null, null, null), TODAY)).toBe("upcoming"));
  it("upcoming before open", () => expect(deriveStatus(d("2026-11-01", "2026-11-03", null), TODAY)).toBe("upcoming"));
  it("open on the opening day", () => expect(deriveStatus(d(TODAY, "2026-10-27", null), TODAY)).toBe("open"));
  it("open on the closing day", () => expect(deriveStatus(d("2026-10-23", TODAY, null), TODAY)).toBe("open"));
  it("closed after close, before listing", () => expect(deriveStatus(d("2026-10-20", "2026-10-22", "2026-10-28"), TODAY)).toBe("closed"));
  it("listed on listing day", () => expect(deriveStatus(d("2026-10-20", "2026-10-22", TODAY), TODAY)).toBe("listed"));
});

describe("metrics", () => {
  it("excludes partial periods from trends", () => {
    const ipo = bySlug("kaveri-kitchenware");
    ipo.financials!.years.push({ ...ipo.financials!.years[2]!, period: "Q1FY2027", periodEnd: "2026-06-30", months: 3 });
    expect(computeYearMetrics(ipo.financials).map((m) => m.period)).toEqual(["FY2024", "FY2025", "FY2026"]);
  });
  it("first year has no growth figure", () => {
    const m = computeYearMetrics(bySlug("kaveri-kitchenware").financials);
    expect(m[0]!.revenueGrowth).toBeNull();
    expect(m[1]!.revenueGrowth).toBeCloseTo(21.57, 1);
  });
  it("handles null financials", () => {
    expect(computeYearMetrics(null)).toEqual([]);
    expect(revenueCagr([])).toBeNull();
  });
  it("valuation uses the upper band and latest EPS", () => {
    const v = computeValuation(bySlug("kaveri-kitchenware"));
    expect(v.peUpper.kind === "ok" && v.peUpper.value).toBeCloseTo(27.78, 1);
    expect(v.peerMedianPe).toBe(38.2);
    expect(v.marketCap).toBeCloseTo(3120);
    expect(v.premiumToPeersPct).toBeCloseTo(-27.3, 1);
  });
  it("loss-making company has no meaningful P/E", () => {
    const v = computeValuation(bySlug("saffron-ledger-payments"));
    expect(v.peUpper.kind).toBe("negative_earnings");
    expect(v.postIssuePe.kind).toBe("negative_earnings");
    expect(v.premiumToPeersPct).toBeNull();
  });
  it("missing price band yields missing valuation, not zero", () => {
    const v = computeValuation(bySlug("malabar-solar-glass"));
    expect(v.peUpper.kind).toBe("missing");
    expect(v.marketCap).toBeNull();
  });
});

describe("assessment labels follow the documented rules", () => {
  it("methodology documents every label for every category", () => {
    expect(METHODOLOGY).toHaveLength(6);
    for (const m of METHODOLOGY) expect(Object.keys(m.rules).sort()).toEqual(["attention", "insufficient", "mixed", "positive"]);
  });

  it("Kaveri: healthy financials, valuation below peers", () => {
    const ipo = bySlug("kaveri-kitchenware");
    expect(label(ipo, "financial")).toBe("positive");
    expect(label(ipo, "valuation")).toBe("positive");
    expect(label(ipo, "growth")).toBe("positive");
    expect(label(ipo, "risks")).toBe("mixed");
  });

  it("Saffron: loss-making → financial attention, valuation insufficient", () => {
    const ipo = bySlug("saffron-ledger-payments");
    expect(label(ipo, "financial")).toBe("attention");
    expect(label(ipo, "valuation")).toBe("insufficient");
    expect(label(ipo, "risks")).toBe("attention");
  });

  it("Nilgiri: 100% OFS + premium valuation + low growth → attention", () => {
    const ipo = bySlug("nilgiri-specialty-chemicals");
    expect(label(ipo, "structure")).toBe("attention");
    expect(label(ipo, "valuation")).toBe("attention");
    expect(label(ipo, "growth")).toBe("attention");
  });

  it("Deccan: high debt → financial attention even with strong growth", () => {
    const ipo = bySlug("deccan-rail-components");
    expect(label(ipo, "financial")).toBe("attention");
    expect(label(ipo, "growth")).toBe("positive");
    expect(label(ipo, "valuation")).toBe("mixed"); // cheap vs peers, but margins lag
  });

  it("Brahmaputra: no peers → valuation insufficient; OCF missing is reported", () => {
    const ipo = bySlug("brahmaputra-agro-foods");
    expect(label(ipo, "valuation")).toBe("insufficient");
    const fin = assessFinancial(ipo);
    expect(fin.missing.some((m) => m.includes("Operating cash flow"))).toBe(true);
  });

  it("Malabar: DRHP-only → most categories insufficient", () => {
    const ipo = bySlug("malabar-solar-glass");
    for (const cat of ["financial", "valuation", "growth", "structure"]) expect(label(ipo, cat)).toBe("insufficient");
  });

  it("valuation premium explained by faster growth is mixed, not attention", () => {
    const ipo = bySlug("nilgiri-specialty-chemicals");
    // Make the company grow much faster than peers.
    ipo.financials!.years[2]!.revenue.value = 900;
    expect(assessValuation(ipo).label).toBe("mixed");
  });

  it("structure: promoter stake drop ≥ 15pp triggers attention", () => {
    const ipo = bySlug("aravalli-health-diagnostics");
    expect(assessStructure(ipo).label).toBe("mixed");
    ipo.promoterHolding.post.value = 45;
    expect(assessStructure(ipo).label).toBe("attention");
  });

  it("never uses GMP or subscription data (not in the model)", () => {
    const text = JSON.stringify(METHODOLOGY).toLowerCase();
    expect(text).not.toContain("gmp");
    expect(text).not.toContain("subscription");
  });
});
