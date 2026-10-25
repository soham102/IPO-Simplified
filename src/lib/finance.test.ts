import { describe, expect, it } from "vitest";
import {
  cagrPct,
  debtToEquity,
  growthPct,
  marginPct,
  marketCapCrore,
  median,
  minInvestment,
  peRatio,
  priceChangePct,
  safeDivide,
  sharePct,
} from "./finance";

describe("safeDivide", () => {
  it("divides normally", () => expect(safeDivide(10, 4)).toBe(2.5));
  it("returns null on zero denominator", () => expect(safeDivide(10, 0)).toBeNull());
  it("returns null on missing inputs", () => {
    expect(safeDivide(null, 2)).toBeNull();
    expect(safeDivide(2, undefined)).toBeNull();
    expect(safeDivide(NaN, 2)).toBeNull();
    expect(safeDivide(Infinity, 2)).toBeNull();
  });
});

describe("growthPct", () => {
  it("computes YoY growth", () => expect(growthPct(1240, 1020)).toBeCloseTo(21.57, 2));
  it("handles decline", () => expect(growthPct(690, 710)).toBeCloseTo(-2.82, 2));
  it("is null from a zero base", () => expect(growthPct(100, 0)).toBeNull());
  it("is null from a negative base (loss shrinking is not % growth)", () => expect(growthPct(-62, -145)).toBeNull());
  it("is null when previous is missing", () => expect(growthPct(100, null)).toBeNull());
});

describe("marginPct", () => {
  it("computes margin", () => expect(marginPct(108, 1510)).toBeCloseTo(7.15, 2));
  it("allows negative profit (loss margin)", () => expect(marginPct(-62, 820)).toBeCloseTo(-7.56, 2));
  it("is null on zero revenue", () => expect(marginPct(5, 0)).toBeNull());
  it("is null on negative revenue", () => expect(marginPct(5, -10)).toBeNull());
});

describe("cagrPct", () => {
  it("computes 2-year CAGR", () => expect(cagrPct(290, 402, 2)).toBeCloseTo(17.74, 2));
  it("returns 0 for flat values", () => expect(cagrPct(100, 100, 3)).toBeCloseTo(0));
  it("is null when start ≤ 0", () => {
    expect(cagrPct(0, 100, 2)).toBeNull();
    expect(cagrPct(-10, 100, 2)).toBeNull();
  });
  it("is null when end is negative", () => expect(cagrPct(100, -1, 2)).toBeNull());
  it("is null for zero years", () => expect(cagrPct(100, 120, 0)).toBeNull());
});

describe("peRatio", () => {
  it("computes P/E", () => {
    const r = peRatio(300, 10.8);
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") expect(r.value).toBeCloseTo(27.78, 2);
  });
  it("flags negative earnings instead of returning a negative P/E", () =>
    expect(peRatio(432, -1.5)).toEqual({ kind: "negative_earnings" }));
  it("flags zero earnings", () => expect(peRatio(100, 0)).toEqual({ kind: "zero_earnings" }));
  it("flags missing price or EPS", () => {
    expect(peRatio(null, 5)).toEqual({ kind: "missing" });
    expect(peRatio(100, null)).toEqual({ kind: "missing" });
    expect(peRatio(0, 5)).toEqual({ kind: "missing" });
  });
});

describe("marketCapCrore", () => {
  it("converts rupees to crore", () => expect(marketCapCrore(300, 104_000_000)).toBeCloseTo(3120));
  it("is null on missing shares", () => expect(marketCapCrore(300, null)).toBeNull());
  it("is null on non-positive inputs", () => expect(marketCapCrore(0, 100)).toBeNull());
});

describe("debtToEquity", () => {
  it("computes ratio", () => expect(debtToEquity(700, 315)).toBeCloseTo(2.22, 2));
  it("allows zero debt", () => expect(debtToEquity(0, 100)).toBe(0));
  it("is null when net worth ≤ 0", () => {
    expect(debtToEquity(100, 0)).toBeNull();
    expect(debtToEquity(100, -50)).toBeNull();
  });
  it("rejects negative borrowings as invalid", () => expect(debtToEquity(-1, 100)).toBeNull());
});

describe("minInvestment", () => {
  it("is lot × upper band", () => expect(minInvestment(50, 300)).toBe(15000));
  it("is null without a lot size", () => expect(minInvestment(null, 300)).toBeNull());
  it("is null without a price", () => expect(minInvestment(50, null)).toBeNull());
});

describe("priceChangePct", () => {
  it("computes listing gain", () => expect(priceChangePct(300, 342)).toBeCloseTo(14));
  it("computes listing loss", () => expect(priceChangePct(200, 176)).toBeCloseTo(-12));
  it("is null from zero", () => expect(priceChangePct(0, 10)).toBeNull());
});

describe("median", () => {
  it("odd count", () => expect(median([31.4, 42, 38.2])).toBe(38.2));
  it("even count", () => expect(median([85, 120.4])).toBeCloseTo(102.7));
  it("ignores nulls and NaN", () => expect(median([null, 10, undefined, NaN, 20])).toBe(15));
  it("is null when empty", () => expect(median([null, undefined])).toBeNull());
});

describe("sharePct", () => {
  it("computes share", () => expect(sharePct(320, 720)).toBeCloseTo(44.44, 2));
  it("is null on zero total", () => expect(sharePct(1, 0)).toBeNull());
});
