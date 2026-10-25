import { describe, expect, it } from "vitest";
import { SAMPLE_COMPANIES } from "@/data/sample/companies";
import { dateCtx } from "@/data/sample/kit";
import { buildFactPack, deterministicExplanation, validateAiOutput, type AiOutput } from "./explain-core";

const ipos = SAMPLE_COMPANIES.map((f) => f(dateCtx("2026-10-25")));
const kaveri = ipos.find((i) => i.slug === "kaveri-kitchenware")!;
const malabar = ipos.find((i) => i.slug === "malabar-solar-glass")!;

describe("fact pack", () => {
  it("numbers facts sequentially and keeps citations", () => {
    const facts = buildFactPack(kaveri, "financials");
    expect(facts[0]!.id).toBe("F1");
    expect(facts.every((f, i) => f.id === `F${i + 1}`)).toBe(true);
    expect(facts.some((f) => f.statement.includes("FY2026") && f.citation)).toBe(true);
  });
  it("states unavailable data rather than inventing it", () => {
    const facts = buildFactPack(malabar, "valuation");
    const text = facts.map((f) => f.statement).join(" ");
    expect(text).toContain("Data unavailable");
    expect(text).toContain("No listed peers");
  });
});

describe("deterministic explanation", () => {
  it("works without any API key and separates facts, interpretation and unknowns", () => {
    const e = deterministicExplanation(kaveri, "overview");
    expect(e.mode).toBe("deterministic");
    expect(e.facts.length).toBeGreaterThan(0);
    expect(e.interpretations).toHaveLength(6);
    expect(e.summary).toMatch(/not a recommendation/);
  });
  it("lists unknowns for sparse records", () => {
    expect(deterministicExplanation(malabar, "financials").unknowns.length).toBeGreaterThan(0);
  });
});

describe("AI output validation", () => {
  const facts = buildFactPack(kaveri, "financials");
  const base: AiOutput = {
    summary: "Revenue has grown each year.",
    facts: [{ text: "Revenue rose.", fact_ids: ["F3"] }],
    interpretations: [{ text: "Growth may reflect demand.", fact_ids: ["F3", "F4"] }],
    unknowns: ["Future demand"],
  };

  it("maps fact ids to source citations", () => {
    const r = validateAiOutput(base, facts);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.facts[0]!.citations[0]!.sourceId).toBe("kaveri-kitchenware-offer-doc");
  });
  it("drops items citing fact ids that don't exist (fabricated citations)", () => {
    const r = validateAiOutput({ ...base, facts: [...base.facts, { text: "Made-up", fact_ids: ["F999"] }] }, facts);
    expect(r.ok && r.facts.map((f) => f.text)).toEqual(["Revenue rose."]);
  });
  it("drops uncited facts", () => {
    const r = validateAiOutput({ ...base, facts: [{ text: "Uncited claim", fact_ids: [] }] }, facts);
    expect(r.ok && r.facts).toEqual([]);
  });
  it.each([
    "You should apply for this IPO.",
    "We recommend avoiding it.",
    "Guaranteed returns on listing.",
    "This is a sure-shot listing gain.",
  ])("rejects verdict language: %s", (summary) => {
    expect(validateAiOutput({ ...base, summary }, facts).ok).toBe(false);
  });
  it("allows neutral educational language", () => {
    expect(validateAiOutput({ ...base, summary: "Investors often check whether a company can apply its cash well." }, facts).ok).toBe(true);
  });
});
