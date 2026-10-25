/**
 * Runtime validation for IPO records coming from an external provider.
 * Mirrors `types.ts`. Invalid records are rejected, never "repaired".
 */
import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected yyyy-mm-dd");

export const verificationStatus = z.enum(["verified", "unverified", "sample", "unavailable"]);
const unit = z.enum(["INR", "INR_CRORE", "PERCENT", "SHARES", "COUNT", "RATIO", "DATE"]);

const citation = z.object({ sourceId: z.string().min(1), locator: z.string().optional() });

const svBase = {
  unit,
  period: z.string().optional(),
  citation: citation.nullable(),
  status: verificationStatus,
  updatedAt: z.string().min(1),
};

const svRules = (v: { value: unknown; status: string; citation: unknown }, ctx: z.RefinementCtx) => {
  if (v.value !== null && v.status === "unavailable")
    ctx.addIssue({ code: "custom", message: "A value marked 'unavailable' must be null" });
  if (v.value !== null && v.citation === null) ctx.addIssue({ code: "custom", message: "Every non-null value must cite a source" });
};

const num = z.object({ value: z.number().finite().nullable(), ...svBase }).superRefine(svRules);
const date = z.object({ value: isoDate.nullable(), ...svBase }).superRefine(svRules);

const claim = z
  .object({ text: z.string().min(1), citation: citation.nullable(), hypothesis: z.boolean().optional() })
  .refine((c) => c.citation !== null || c.hypothesis === true, {
    message: "A claim without a citation must be marked as a hypothesis",
  });

const source = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(["sebi_offer_document", "exchange", "company_filing", "data_provider", "sample"]),
  publisher: z.string().min(1),
  url: z.string().nullable(),
  documentDate: isoDate.nullable(),
  accessedAt: z.string().min(1),
});

const financialYear = z.object({
  period: z.string().min(1),
  periodEnd: isoDate,
  months: z.number().int().min(1).max(15),
  revenue: num,
  pat: num,
  borrowings: num,
  netWorth: num,
  operatingCashFlow: num,
  dilutedEps: num,
});

export const ipoSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    dataMode: z.enum(["sample", "live"]),
    company: z.object({
      name: z.string().min(1),
      tagline: z.string(),
      sector: z.string(),
      incorporated: z.string().optional(),
      headquarters: z.string().optional(),
      website: z.string().nullable().optional(),
    }),
    exchanges: z.array(z.enum(["NSE", "BSE"])).min(1),
    board: z.enum(["Mainboard", "SME"]),
    issueMethod: z.enum(["Book built", "Fixed price"]),
    coverage: z.enum(["complete", "partial", "basic"]),
    dates: z.object({ open: date, close: date, allotment: date, listing: date }),
    priceBand: z.object({ low: num, high: num }),
    faceValue: num,
    lotSize: num,
    issueSize: z.object({ total: num, fresh: num, ofs: num }),
    postIssueShares: num,
    promoterHolding: z.object({ pre: num, post: num }),
    proceedsUse: z.array(z.object({ label: z.string(), amount: num, explanation: z.string() })),
    ofsSellers: z.array(
      z.object({ name: z.string(), type: z.enum(["Promoter", "Promoter group", "Investor", "Other"]), amount: num }),
    ),
    lockIns: z.array(z.object({ description: z.string(), citation: citation.nullable(), status: verificationStatus })),
    documents: z.array(
      z.object({ type: z.enum(["DRHP", "RHP", "Prospectus", "Addendum", "Basis of Allotment"]), sourceId: z.string() }),
    ),
    business: z
      .object({
        whatItDoes: claim,
        products: z.array(claim),
        customers: claim.nullable(),
        revenueModel: claim.nullable(),
        growthDrivers: z.array(claim),
        challenges: z.array(claim),
        detail: z.string().optional(),
      })
      .nullable(),
    financials: z
      .object({
        basis: z.enum(["consolidated", "standalone"]),
        revenueBasis: z.enum(["operations", "total_income"]).optional(),
        note: z.string().optional(),
        years: z.array(financialYear),
      })
      .nullable(),
    peers: z.array(
      z.object({ name: z.string(), exchange: z.enum(["NSE", "BSE"]), pe: num, revenue: num, patMargin: num, revenueGrowth: num }),
    ),
    risks: z.array(
      z.object({
        id: z.string(),
        category: z.enum(["concentration", "litigation", "related_party", "promoter_ofs", "debt_cashflow", "dependence", "industry_regulatory"]),
        title: z.string(),
        summary: z.string(),
        whyItMatters: z.string(),
        severity: z.enum(["material", "caution"]),
        citation: citation.nullable(),
      }),
    ),
    bullCase: z.array(claim),
    bearCase: z.array(claim),
    listing: z
      .object({
        listingDate: date,
        listingOpen: num,
        listingClose: num,
        history: z.object({
          points: z.array(z.object({ date: isoDate, close: z.number().positive() })),
          citation: citation.nullable(),
          status: verificationStatus,
        }),
        latest: num,
      })
      .nullable(),
    gmp: num.nullable().optional(),
    sources: z.array(source),
    lastReviewed: z.string().min(1),
  })
  .superRefine((ipo, ctx) => {
    // Every citation must resolve to a declared source.
    const ids = new Set(ipo.sources.map((s) => s.id));
    const walk = (node: unknown, path: (string | number)[]) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach((n, i) => walk(n, [...path, i]));
      const obj = node as Record<string, unknown>;
      const c = obj.citation as { sourceId?: string } | null | undefined;
      if (c && typeof c.sourceId === "string" && !ids.has(c.sourceId)) {
        ctx.addIssue({ code: "custom", path: [...path, "citation"], message: `Unknown source "${c.sourceId}"` });
      }
      for (const [k, v] of Object.entries(obj)) if (k !== "citation") walk(v, [...path, k]);
    };
    walk(ipo, []);
    // Live data must never carry sample-status values.
    if (ipo.dataMode === "live" && JSON.stringify(ipo).includes('"status":"sample"')) {
      ctx.addIssue({ code: "custom", path: ["dataMode"], message: "Live record contains sample-status values" });
    }
  });
