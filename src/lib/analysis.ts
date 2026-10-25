/**
 * Explainable analysis framework.
 *
 * Each category is evaluated with a small, documented rule set and produces a
 * descriptive label, never a numeric score. The `METHODOLOGY` export below is
 * rendered verbatim on /methodology, so the published rules and the code
 * cannot drift apart. GMP and subscription figures are deliberately NOT inputs.
 */
import { sharePct } from "./finance";
import { formatNumber } from "./format";
import { computeValuation, computeYearMetrics, describePe, revenueCagr } from "./metrics";
import type { Citation, Ipo } from "./types";

export type AssessmentLabel = "positive" | "mixed" | "attention" | "insufficient";

export const LABEL_TEXT: Record<AssessmentLabel, string> = {
  positive: "Positive evidence",
  mixed: "Mixed evidence",
  attention: "Needs attention",
  insufficient: "Insufficient data",
};

export type CategoryId = "business" | "financial" | "valuation" | "growth" | "risks" | "structure";

export interface Evidence {
  text: string;
  tone: "positive" | "negative" | "neutral";
  citation: Citation | null;
}

export interface Assessment {
  category: CategoryId;
  title: string;
  label: AssessmentLabel;
  /** One-sentence explanation of why this label was assigned. */
  reason: string;
  evaluated: string[];
  evidence: Evidence[];
  missing: string[];
  whyItMatters: string;
}

interface CategoryRule {
  id: CategoryId;
  title: string;
  evaluated: string[];
  whyItMatters: string;
  rules: Record<AssessmentLabel, string>;
}

export const METHODOLOGY: CategoryRule[] = [
  {
    id: "business",
    title: "Business quality",
    evaluated: [
      "What the company sells and how it earns money (from the offer document)",
      "Customer or product concentration disclosed as a risk",
      "Latest full-year profit margin",
    ],
    whyItMatters:
      "A business that depends on one customer or product, or earns thin margins, has less room for error when conditions change.",
    rules: {
      insufficient: "No business description from a cited source is available.",
      attention: "A material concentration or dependence risk is disclosed AND the latest profit margin is below 5% or negative.",
      positive: "No material concentration/dependence risk was found in the reviewed sections AND the latest profit margin is 10% or higher.",
      mixed: "Any other combination.",
    },
  },
  {
    id: "financial",
    title: "Financial health",
    evaluated: [
      "Profit after tax in each full financial year",
      "Change in profit margin from the first to the latest year",
      "Operating cash flow in the latest year",
      "Borrowings relative to net worth (debt-to-equity)",
    ],
    whyItMatters:
      "Profits on paper only help shareholders if the business also generates cash and is not overloaded with debt.",
    rules: {
      insufficient: "Fewer than two full financial years of revenue and profit are available.",
      attention:
        "The company made a loss in the latest year, OR debt-to-equity is above 2x, OR two or more of the checks below are negative.",
      positive:
        "Profitable in every year, operating cash flow positive in the latest year, margin did not fall by more than 2 percentage points, and debt-to-equity is below 1x.",
      mixed: "Any other combination.",
    },
  },
  {
    id: "valuation",
    title: "Valuation",
    evaluated: [
      "P/E at the upper price band, using latest full-year diluted EPS (pre-issue)",
      "Median P/E of listed peers named in the offer document",
      "Profit margin and revenue growth versus the same peers",
    ],
    whyItMatters:
      "The price you pay matters as much as the quality of the business. Paying much more than similar companies needs a clear reason, such as faster growth.",
    rules: {
      insufficient:
        "EPS is missing or negative (P/E is not meaningful), or fewer than two peers with a disclosed P/E are available.",
      attention:
        "The IPO P/E is more than 25% above the peer median AND the company is not growing revenue at least 5 percentage points faster than the peer median.",
      positive:
        "The IPO P/E is at least 15% below the peer median AND the company's margin is not more than 2 percentage points below the peer median.",
      mixed: "Any other combination (including a premium that is partly explained by faster growth).",
    },
  },
  {
    id: "growth",
    title: "Growth prospects",
    evaluated: [
      "Revenue compound annual growth rate (CAGR) across available full years",
      "Whether growth slowed sharply in the latest year",
      "Growth drivers described in the offer document",
    ],
    whyItMatters:
      "IPO prices often assume growth will continue. Past growth is not a guarantee, but slowing growth is a reason to ask harder questions.",
    rules: {
      insufficient: "Fewer than two full financial years of revenue are available.",
      attention: "Revenue CAGR is below 5%, or revenue shrank over the period.",
      positive: "Revenue CAGR is 15% or higher AND latest-year growth is not less than half of the prior year's growth.",
      mixed: "Any other combination.",
    },
  },
  {
    id: "risks",
    title: "Material risks",
    evaluated: [
      "Risk factors in the DRHP/RHP: concentration, litigation, related-party dealings, debt, dependence, regulation",
      "Whether each risk is described as material in the reviewed sections",
    ],
    whyItMatters:
      "Offer documents list risks the company itself considers important. Reading them is the single best way to avoid surprises.",
    rules: {
      insufficient: "No offer document has been reviewed for this IPO.",
      attention: "Three or more material risks were found in the reviewed sections.",
      positive: "No material risks were found in the reviewed sections (this does not mean the IPO is risk-free).",
      mixed: "One or two material risks were found.",
    },
  },
  {
    id: "structure",
    title: "IPO structure & use of proceeds",
    evaluated: [
      "Split between fresh issue (money to the company) and offer for sale (money to selling shareholders)",
      "Whether the uses of fresh-issue money are stated with amounts",
      "Change in promoter shareholding",
    ],
    whyItMatters:
      "In an offer for sale the company receives nothing; existing shareholders are cashing out. Knowing who gets the money tells you what the IPO is for.",
    rules: {
      insufficient: "Issue size, fresh issue or offer-for-sale amounts are unavailable.",
      attention:
        "75% or more of the issue is an offer for sale, OR promoter holding falls by 15 percentage points or more while shares are also being sold in an offer for sale.",
      positive:
        "At least half the issue is fresh capital, the uses of proceeds are stated with amounts, and neither attention trigger applies.",
      mixed: "Any other combination.",
    },
  },
];

const ruleFor = (id: CategoryId) => METHODOLOGY.find((m) => m.id === id)!;

function build(
  id: CategoryId,
  label: AssessmentLabel,
  evidence: Evidence[],
  missing: string[],
  reasonOverride?: string,
): Assessment {
  const rule = ruleFor(id);
  return {
    category: id,
    title: rule.title,
    label,
    reason: reasonOverride ?? rule.rules[label],
    evaluated: rule.evaluated,
    evidence,
    missing,
    whyItMatters: rule.whyItMatters,
  };
}

const finCite = (ipo: Ipo): Citation | null =>
  ipo.financials?.years[0]?.revenue.citation ?? null;

export function assessBusiness(ipo: Ipo): Assessment {
  if (!ipo.business || !ipo.business.whatItDoes.citation) {
    return build("business", "insufficient", [], ["Business description from the offer document"]);
  }
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const concentration = ipo.risks.filter(
    (r) => r.severity === "material" && (r.category === "concentration" || r.category === "dependence"),
  );
  for (const r of concentration) ev.push({ text: r.title, tone: "negative", citation: r.citation });
  const metrics = computeYearMetrics(ipo.financials);
  const margin = metrics[metrics.length - 1]?.patMargin ?? null;
  if (margin == null) missing.push("Latest full-year profit margin");
  else
    ev.push({
      text: `Latest full-year profit margin: ${formatNumber(margin, "PERCENT")}`,
      tone: margin >= 10 ? "positive" : margin < 5 ? "negative" : "neutral",
      citation: finCite(ipo),
    });
  const hypotheses = [...ipo.business.growthDrivers, ...ipo.business.challenges].filter((c) => c.hypothesis).length;
  if (hypotheses > 0) missing.push(`${hypotheses} business point(s) are hypotheses that still need verification`);
  if (ipo.documents.length === 0) missing.push("Risk factors from an offer document");

  let label: AssessmentLabel = "mixed";
  if (concentration.length > 0 && margin != null && margin < 5) label = "attention";
  else if (concentration.length === 0 && ipo.documents.length > 0 && margin != null && margin >= 10) label = "positive";
  return build("business", label, ev, missing);
}

export function assessFinancial(ipo: Ipo): Assessment {
  const m = computeYearMetrics(ipo.financials).filter((y) => y.revenue != null && y.pat != null);
  if (m.length < 2) {
    return build("financial", "insufficient", [], ["At least two full financial years of revenue and profit"]);
  }
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const cite = finCite(ipo);
  const first = m[0]!;
  const last = m[m.length - 1]!;
  let negatives = 0;

  const lossYears = m.filter((y) => (y.pat ?? 0) < 0).map((y) => y.period);
  const allProfitable = lossYears.length === 0;
  ev.push({
    text: allProfitable
      ? `Profitable in all ${m.length} full years reviewed`
      : `Loss-making in ${lossYears.join(", ")}`,
    tone: allProfitable ? "positive" : "negative",
    citation: cite,
  });
  const latestLoss = (last.pat ?? 0) < 0;
  if (!allProfitable) negatives++;

  const marginDelta =
    first.patMargin != null && last.patMargin != null ? last.patMargin - first.patMargin : null;
  if (marginDelta == null) missing.push("Profit margin change (needs positive revenue in first and last year)");
  else {
    const tone = marginDelta >= 1 ? "positive" : marginDelta <= -2 ? "negative" : "neutral";
    if (tone === "negative") negatives++;
    ev.push({
      text: `Profit margin moved from ${formatNumber(first.patMargin, "PERCENT")} (${first.period}) to ${formatNumber(last.patMargin, "PERCENT")} (${last.period})`,
      tone,
      citation: cite,
    });
  }

  const ocf = last.operatingCashFlow;
  if (ocf == null) missing.push(`Operating cash flow for ${last.period}`);
  else {
    if (ocf < 0) negatives++;
    ev.push({
      text: `Operating cash flow in ${last.period}: ${formatNumber(ocf, "INR_CRORE")}`,
      tone: ocf > 0 ? "positive" : "negative",
      citation: last.source.operatingCashFlow.citation,
    });
  }

  const de = last.debtToEquity;
  if (de == null) missing.push(`Debt-to-equity for ${last.period} (borrowings or net worth unavailable, or net worth ≤ 0)`);
  else {
    if (de > 1) negatives++;
    ev.push({
      text: `Debt-to-equity in ${last.period}: ${formatNumber(de, "RATIO", 2)}`,
      tone: de < 1 ? (de < 0.5 ? "positive" : "neutral") : "negative",
      citation: last.source.borrowings.citation,
    });
  }

  let label: AssessmentLabel = "mixed";
  if (latestLoss || (de != null && de > 2) || negatives >= 2) label = "attention";
  else if (allProfitable && ocf != null && ocf > 0 && marginDelta != null && marginDelta > -2 && de != null && de < 1)
    label = "positive";
  return build("financial", label, ev, missing);
}

export function assessValuation(ipo: Ipo): Assessment {
  const v = computeValuation(ipo);
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const peerCite = ipo.peers[0]?.pe.citation ?? null;

  if (v.peUpper.kind !== "ok") {
    missing.push(
      v.peUpper.kind === "negative_earnings"
        ? "Meaningful P/E: the company is loss-making, so earnings-based comparison is not possible"
        : "Earnings per share for the latest full year",
    );
  } else {
    ev.push({
      text: `P/E at upper band: ${describePe(v.peUpper)} (₹${v.priceHigh} ÷ ${v.epsPeriod} diluted EPS ₹${v.latestEps})`,
      tone: "neutral",
      citation: ipo.priceBand.high.citation,
    });
  }
  if (v.peersWithPe < 2) missing.push("At least two listed peers with a disclosed P/E");
  if (v.peUpper.kind !== "ok" || v.peersWithPe < 2) {
    return build("valuation", "insufficient", ev, missing);
  }

  const premium = v.premiumToPeersPct ?? 0;
  ev.push({
    text: `Peer median P/E: ${formatNumber(v.peerMedianPe, "RATIO")} across ${v.peersWithPe} peers. The IPO is ${Math.abs(premium).toFixed(0)}% ${premium >= 0 ? "above" : "below"} the median`,
    tone: premium > 25 ? "negative" : premium < -15 ? "positive" : "neutral",
    citation: peerCite,
  });
  const growthGap =
    v.latestGrowth != null && v.peerMedianGrowth != null ? v.latestGrowth - v.peerMedianGrowth : null;
  if (growthGap == null) missing.push("Revenue growth comparison with peers");
  else
    ev.push({
      text: `Latest revenue growth ${formatNumber(v.latestGrowth, "PERCENT")} vs peer median ${formatNumber(v.peerMedianGrowth, "PERCENT")}`,
      tone: growthGap >= 5 ? "positive" : growthGap <= -5 ? "negative" : "neutral",
      citation: peerCite,
    });
  const marginGap =
    v.latestMargin != null && v.peerMedianMargin != null ? v.latestMargin - v.peerMedianMargin : null;
  if (marginGap == null) missing.push("Profit margin comparison with peers");
  else
    ev.push({
      text: `Latest profit margin ${formatNumber(v.latestMargin, "PERCENT")} vs peer median ${formatNumber(v.peerMedianMargin, "PERCENT")}`,
      tone: marginGap >= 2 ? "positive" : marginGap <= -2 ? "negative" : "neutral",
      citation: peerCite,
    });

  let label: AssessmentLabel = "mixed";
  if (premium > 25 && !(growthGap != null && growthGap >= 5)) label = "attention";
  else if (premium <= -15 && marginGap != null && marginGap >= -2) label = "positive";
  return build("valuation", label, ev, missing);
}

export function assessGrowth(ipo: Ipo): Assessment {
  const m = computeYearMetrics(ipo.financials).filter((y) => y.revenue != null);
  if (m.length < 2) return build("growth", "insufficient", [], ["At least two full financial years of revenue"]);
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const cagr = revenueCagr(m);
  const cite = finCite(ipo);
  if (cagr == null) {
    return build("growth", "insufficient", [], ["Revenue CAGR (first-year revenue must be positive)"]);
  }
  ev.push({
    text: `Revenue CAGR ${m[0]!.period}–${m[m.length - 1]!.period}: ${formatNumber(cagr, "PERCENT")}`,
    tone: cagr >= 15 ? "positive" : cagr < 5 ? "negative" : "neutral",
    citation: cite,
  });
  const latestG = m[m.length - 1]!.revenueGrowth;
  const prevG = m.length >= 3 ? m[m.length - 2]!.revenueGrowth : null;
  const sharpSlowdown = latestG != null && prevG != null && prevG > 0 && latestG < prevG / 2;
  if (latestG != null && prevG != null)
    ev.push({
      text: `Growth went from ${formatNumber(prevG, "PERCENT")} to ${formatNumber(latestG, "PERCENT")} in the latest year`,
      tone: sharpSlowdown ? "negative" : latestG >= prevG ? "positive" : "neutral",
      citation: cite,
    });
  else missing.push("Three years of revenue to check whether growth is slowing");
  for (const d of ipo.business?.growthDrivers ?? []) {
    ev.push({ text: `Stated driver: ${d.text}`, tone: "neutral", citation: d.citation });
  }

  let label: AssessmentLabel = "mixed";
  if (cagr < 5) label = "attention";
  else if (cagr >= 15 && !sharpSlowdown) label = "positive";
  return build("growth", label, ev, missing);
}

export function assessRisks(ipo: Ipo): Assessment {
  if (ipo.documents.length === 0) {
    return build("risks", "insufficient", [], ["An offer document (DRHP/RHP) to review"]);
  }
  const material = ipo.risks.filter((r) => r.severity === "material");
  const ev: Evidence[] = ipo.risks.map((r) => ({
    text: `${r.severity === "material" ? "Material" : "Caution"}: ${r.title}`,
    tone: r.severity === "material" ? "negative" : "neutral",
    citation: r.citation,
  }));
  const missing = ["Full risk-factor section has not been reviewed line by line; only summarised findings are shown"];
  const label: AssessmentLabel =
    material.length >= 3 ? "attention" : material.length === 0 ? "positive" : "mixed";
  return build("risks", label, ev, missing);
}

export function assessStructure(ipo: Ipo): Assessment {
  const { total, fresh, ofs } = ipo.issueSize;
  if (total.value == null || fresh.value == null || ofs.value == null) {
    return build("structure", "insufficient", [], ["Issue size split between fresh issue and offer for sale"]);
  }
  const ev: Evidence[] = [];
  const missing: string[] = [];
  const ofsShare = sharePct(ofs.value, total.value) ?? 0;
  const freshShare = 100 - ofsShare;
  ev.push({
    text: `${formatNumber(freshShare, "PERCENT", 0)} fresh issue (to the company), ${formatNumber(ofsShare, "PERCENT", 0)} offer for sale (to selling shareholders)`,
    tone: ofsShare >= 75 ? "negative" : freshShare >= 50 ? "positive" : "neutral",
    citation: total.citation,
  });
  const statedUses = ipo.proceedsUse.filter((u) => u.amount.value != null);
  if (fresh.value > 0) {
    if (statedUses.length === 0) missing.push("Uses of fresh-issue proceeds with amounts");
    else
      ev.push({
        text: `Uses of proceeds stated: ${statedUses.map((u) => u.label).join("; ")}`,
        tone: "neutral",
        citation: statedUses[0]!.amount.citation,
      });
  }
  const pre = ipo.promoterHolding.pre.value;
  const post = ipo.promoterHolding.post.value;
  const drop = pre != null && post != null ? pre - post : null;
  if (drop == null) missing.push("Promoter shareholding before and after the issue");
  else
    ev.push({
      text: `Promoter holding: ${formatNumber(pre, "PERCENT")} → ${formatNumber(post, "PERCENT")}`,
      tone: drop >= 15 && ofs.value > 0 ? "negative" : "neutral",
      citation: ipo.promoterHolding.post.citation,
    });

  let label: AssessmentLabel = "mixed";
  if (ofsShare >= 75 || (drop != null && drop >= 15 && ofs.value > 0)) label = "attention";
  else if (freshShare >= 50 && statedUses.length > 0) label = "positive";
  return build("structure", label, ev, missing);
}

export function assessAll(ipo: Ipo): Assessment[] {
  return [
    assessBusiness(ipo),
    assessFinancial(ipo),
    assessValuation(ipo),
    assessGrowth(ipo),
    assessRisks(ipo),
    assessStructure(ipo),
  ];
}
