/**
 * Provider-agnostic parts of the explanation layer: building a cited fact
 * pack, the deterministic (no-AI) explainer, and validation of AI output.
 * Pure functions, so they are unit-tested without network access.
 */
import { z } from "zod";
import { assessAll, LABEL_TEXT, type Assessment, type CategoryId } from "@/lib/analysis";
import { formatNumber, formatSignedPct } from "@/lib/format";
import { computeValuation, computeYearMetrics, describePe } from "@/lib/metrics";
import type { Citation, Ipo } from "@/lib/types";

import { TOPIC_LABEL, type ExplainItem, type Explanation, type Topic } from "./topics";

export { TOPICS, TOPIC_LABEL, type ExplainItem, type Explanation, type Topic } from "./topics";

export interface Fact {
  id: string;
  statement: string;
  citation: Citation | null;
  /** Interpretive label from our rules, not a source fact. */
  derived?: boolean;
}

/** Facts relevant to a topic, each with an id the model must cite. */
export function buildFactPack(ipo: Ipo, topic: Topic): Fact[] {
  const facts: Fact[] = [];
  const add = (statement: string, citation: Citation | null, derived = false) =>
    facts.push({ id: `F${facts.length + 1}`, statement, citation, derived });

  add(`Company: ${ipo.company.name}; sector: ${ipo.company.sector}; listing on ${ipo.exchanges.join(" and ")} (${ipo.board}).`, null, true);
  if (ipo.business) add(`Business: ${ipo.business.whatItDoes.text}`, ipo.business.whatItDoes.citation);

  const metrics = computeYearMetrics(ipo.financials);
  if (topic === "overview" || topic === "financials") {
    if (ipo.financials) add(`Financials are ${ipo.financials.basis}.`, metrics[0]?.source.revenue.citation ?? null);
    for (const m of metrics) {
      const cite = m.source.revenue.citation;
      add(
        `${m.period}: revenue ${formatNumber(m.revenue, "INR_CRORE")}, profit after tax ${formatNumber(m.pat, "INR_CRORE")}, operating cash flow ${formatNumber(m.operatingCashFlow, "INR_CRORE")}, borrowings ${formatNumber(m.borrowings, "INR_CRORE")}.`,
        cite,
      );
      if (m.revenueGrowth != null || m.patMargin != null)
        add(`${m.period} (calculated): revenue growth ${formatSignedPct(m.revenueGrowth)}, profit margin ${formatNumber(m.patMargin, "PERCENT")}, debt-to-equity ${formatNumber(m.debtToEquity, "RATIO", 2)}.`, cite);
    }
  }
  if (topic === "overview" || topic === "valuation") {
    const v = computeValuation(ipo);
    add(`Price band: ${formatNumber(v.priceLow, "INR")} to ${formatNumber(v.priceHigh, "INR")}.`, ipo.priceBand.high.citation);
    add(`P/E at upper band on ${v.epsPeriod ?? "latest"} diluted EPS: ${describePe(v.peUpper)}. Post-issue market cap: ${formatNumber(v.marketCap, "INR_CRORE", 0)}.`, ipo.priceBand.high.citation);
    if (v.peersWithPe > 0)
      add(`Peer median P/E ${formatNumber(v.peerMedianPe, "RATIO")} (${v.peersWithPe} peers); peer median margin ${formatNumber(v.peerMedianMargin, "PERCENT")}; peer median revenue growth ${formatNumber(v.peerMedianGrowth, "PERCENT")}.`, ipo.peers[0]?.pe.citation ?? null);
    else add("No listed peers with a disclosed P/E are available.", null, true);
  }
  if (topic === "overview" || topic === "risks") {
    for (const r of ipo.risks) add(`${r.severity === "material" ? "Material risk" : "Risk"}: ${r.title}. ${r.summary}`, r.citation);
    if (ipo.risks.length === 0) add("No risk factors have been summarised for this IPO.", null, true);
  }
  if (topic === "overview") {
    const { total, fresh, ofs } = ipo.issueSize;
    add(`Issue size ${formatNumber(total.value, "INR_CRORE")}: fresh issue ${formatNumber(fresh.value, "INR_CRORE")}, offer for sale ${formatNumber(ofs.value, "INR_CRORE")}.`, total.citation);
  }
  return facts;
}

const TOPIC_CATEGORIES: Record<Topic, CategoryId[]> = {
  overview: ["business", "financial", "valuation", "growth", "risks", "structure"],
  financials: ["financial", "growth"],
  valuation: ["valuation"],
  risks: ["risks", "business"],
};

/** Rule-based explanation built only from our assessments. Always available. */
export function deterministicExplanation(ipo: Ipo, topic: Topic, notice?: string): Explanation {
  const cats = TOPIC_CATEGORIES[topic];
  const assessments = assessAll(ipo).filter((a) => cats.includes(a.category));
  const facts: ExplainItem[] = assessments.flatMap((a) =>
    a.evidence.map((e) => ({ text: e.text, citations: e.citation ? [e.citation] : [] })),
  );
  const interpretations: ExplainItem[] = assessments.map((a: Assessment) => ({
    text: `${a.title}: ${LABEL_TEXT[a.label]}. ${a.reason}`,
    citations: [],
  }));
  const unknowns = [...new Set(assessments.flatMap((a) => a.missing))];
  const counts = assessments.reduce<Record<string, number>>((acc, a) => ((acc[a.label] = (acc[a.label] ?? 0) + 1), acc), {});
  const summary =
    assessments.length === 1
      ? `${assessments[0]!.title} is labelled "${LABEL_TEXT[assessments[0]!.label]}" under our published rules.`
      : `Across ${assessments.length} areas reviewed: ${Object.entries(counts)
          .map(([k, n]) => `${n} ${LABEL_TEXT[k as keyof typeof LABEL_TEXT].toLowerCase()}`)
          .join(", ")}. These labels describe the evidence; they are not a recommendation.`;
  return { mode: "deterministic", topic, generatedAt: new Date().toISOString(), summary, facts, interpretations, unknowns, notice };
}

// --- AI output contract ----------------------------------------------------

export const aiOutputSchema = z.object({
  summary: z.string().describe("Two or three plain-English sentences for a beginner. No recommendation."),
  facts: z
    .array(z.object({ text: z.string(), fact_ids: z.array(z.string()) }))
    .describe("Restatements of facts from the fact pack, each citing the fact ids it is based on."),
  interpretations: z
    .array(z.object({ text: z.string(), fact_ids: z.array(z.string()) }))
    .describe("What the facts might mean for a beginner, each citing supporting fact ids."),
  unknowns: z.array(z.string()).describe("Important questions the fact pack cannot answer."),
});
export type AiOutput = z.infer<typeof aiOutputSchema>;

const VERDICT = /\b(you should (apply|invest|buy|sell|avoid|subscribe|skip)|(we|i) recommend|recommend(ed)? (applying|buying|avoiding|investing)|good (ipo|investment) to (buy|apply)|guaranteed (return|gain)s?|sure-?shot)\b/i;

/**
 * Map AI output back to citations and enforce the contract. Items citing
 * unknown fact ids are dropped; any investment verdict rejects the output.
 */
export function validateAiOutput(out: AiOutput, facts: Fact[]): { ok: true; facts: ExplainItem[]; interpretations: ExplainItem[] } | { ok: false; reason: string } {
  const all = [out.summary, ...out.facts.map((f) => f.text), ...out.interpretations.map((i) => i.text), ...out.unknowns].join(" \n ");
  if (VERDICT.test(all)) return { ok: false, reason: "Output contained an investment verdict" };
  const byId = new Map(facts.map((f) => [f.id, f]));
  const map = (items: { text: string; fact_ids: string[] }[], requireIds: boolean) =>
    items
      .filter((i) => i.fact_ids.length > 0 || !requireIds)
      .filter((i) => i.fact_ids.every((id) => byId.has(id)))
      .map((i) => ({
        text: i.text,
        citations: i.fact_ids.map((id) => byId.get(id)!.citation).filter((c): c is Citation => c !== null),
      }));
  return { ok: true, facts: map(out.facts, true), interpretations: map(out.interpretations, true) };
}

export const SYSTEM_PROMPT = `You explain Indian IPOs to first-time investors for an educational website called IPO Simplified.

You will receive a FACT PACK: numbered facts (F1, F2, ...) drawn from offer documents, plus a few derived calculations. It is the only information you may rely on.

Rules:
- Use only the fact pack. Do not add figures, dates, company details, market prices, peer names or events that are not in it. If something important is missing, list it under "unknowns".
- Every item in "facts" and "interpretations" must cite the fact ids it relies on in "fact_ids". Never cite an id that is not in the pack.
- Keep facts and interpretations separate. A fact restates the pack; an interpretation explains what it might mean and should use hedged language ("may", "suggests", "worth checking").
- Do not tell the reader whether to apply, invest, buy, sell, avoid or skip. Do not predict listing gains or returns. Do not call the IPO cheap, expensive, good or bad without pointing to the specific comparison in the pack.
- Never mention grey market premium (GMP) or subscription figures as evidence of quality.
- Write in plain English for someone with no finance background. Short sentences. Explain any jargon you use. Use ₹ and Indian number formats as given.
- If the evidence is insufficient to say anything meaningful about the topic, say so plainly in the summary.`;

export function buildUserMessage(ipo: Ipo, topic: Topic, facts: Fact[]): string {
  const lines = facts.map((f) => `${f.id}${f.derived ? " (context)" : ""}: ${f.statement}`);
  return `Topic: ${TOPIC_LABEL[topic]} for the ${ipo.company.name} IPO.\n\nFACT PACK\n${lines.join("\n")}\n\nExplain this topic for a beginner following the rules. Aim for 3-6 facts, 2-4 interpretations and 1-4 unknowns.`;
}
