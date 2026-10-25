import { describe, expect, it } from "vitest";
import { assessAll } from "@/lib/analysis";
import { deriveStatus } from "@/lib/format";
import { computeValuation } from "@/lib/metrics";
import { ipoSchema } from "@/lib/schema";
import { LIVE_IPOS } from "./ipos";

describe("curated live dataset", () => {
  it.each(LIVE_IPOS.map((i) => [i.slug, i]))("%s passes schema validation", (_s, ipo) => {
    const r = ipoSchema.safeParse(ipo);
    if (!r.success) throw new Error(JSON.stringify(r.error.issues.slice(0, 3), null, 2));
  });

  it("contains no sample values and every source has a real URL", () => {
    for (const ipo of LIVE_IPOS) {
      expect(ipo.dataMode).toBe("live");
      expect(JSON.stringify(ipo)).not.toContain('"status":"sample"');
      for (const s of ipo.sources) expect(s.url).toMatch(/^https:\/\//);
      expect(ipo.documents.length).toBeGreaterThan(0);
    }
  });

  it("issue size equals fresh + OFS", () => {
    for (const ipo of LIVE_IPOS) {
      const { total, fresh, ofs } = ipo.issueSize;
      expect(Math.abs(total.value! - fresh.value! - ofs.value!)).toBeLessThan(1);
    }
  });

  it("statuses as of 25 Oct 2026 match the published timelines", () => {
    const status = Object.fromEntries(LIVE_IPOS.map((i) => [i.slug, deriveStatus(i.dates, "2026-10-25")]));
    expect(status).toMatchObject({
      "jio-platforms": "closed",
      "paras-healthcare": "closed",
      "tonbo-imaging-india": "listed",
      "sahajanand-medical-technologies": "listed",
      zetwerk: "listed",
      "eaaa-india-alternatives": "upcoming",
      "sfc-environmental-technologies": "upcoming",
      "bls-polymers": "upcoming",
    });
  });

  it("P/E at upper band matches the source's own KPI where given", () => {
    const pe = (slug: string) => {
      const v = computeValuation(LIVE_IPOS.find((i) => i.slug === slug)!).peUpper;
      return v.kind === "ok" ? v.value : null;
    };
    expect(pe("paras-healthcare")).toBeCloseTo(159.68, 0); // source: 159.68x pre-IPO
    expect(pe("tonbo-imaging-india")).toBeCloseTo(78.83, 0); // source: 78.83x
    expect(pe("bls-polymers")).toBeCloseTo(25.04, 0); // source: 25x on basic EPS 6.00
    expect(computeValuation(LIVE_IPOS.find((i) => i.slug === "zetwerk")!).peUpper.kind).toBe("negative_earnings");
  });

  it("assessments never crash on partial real data", () => {
    for (const ipo of LIVE_IPOS) expect(assessAll(ipo)).toHaveLength(6);
  });

  it("GMP never changes any assessment label", () => {
    for (const ipo of LIVE_IPOS) {
      const base = assessAll(ipo).map((a) => a.label);
      const tweaked = { ...ipo, gmp: ipo.gmp ? { ...ipo.gmp, value: (ipo.gmp.value ?? 0) * 100 } : null };
      expect(assessAll(tweaked).map((a) => a.label)).toEqual(base);
    }
  });

  it("every pre-listing IPO has a timestamped, cited GMP; listed ones have none", () => {
    for (const ipo of LIVE_IPOS) {
      const listed = deriveStatus(ipo.dates, "2026-10-25") === "listed";
      if (listed) expect(ipo.gmp ?? null).toBeNull();
      else {
        expect(ipo.gmp?.citation).toBeTruthy();
        expect(ipo.gmp?.period).toMatch(/^2026-10-25T/);
      }
    }
  });
});
