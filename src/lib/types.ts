/**
 * Domain model for IPO Simplified.
 *
 * Design rule: every factual number or date is a `SourcedValue`, carrying its
 * unit, period, citation, verification status and update time. UI components
 * render the value AND its provenance; a missing value is `null`, never a
 * guessed default.
 */

/** How much we trust a value. */
export type VerificationStatus =
  /** Checked against a primary source (offer document, exchange filing). */
  | "verified"
  /** From a secondary source, not yet checked against a primary source. */
  | "unverified"
  /** Fictional value used in sample-data mode. Never real. */
  | "sample"
  /** We looked and could not find / do not have this value. */
  | "unavailable";

export type Unit =
  | "INR" // rupees (prices, per-share values)
  | "INR_CRORE" // ₹ crore (1 crore = 10 million)
  | "PERCENT"
  | "SHARES"
  | "COUNT"
  | "RATIO"
  | "DATE";

export type SourceKind =
  | "sebi_offer_document" // DRHP / RHP / Prospectus filed with SEBI
  | "exchange" // NSE / BSE announcements, IPO pages
  | "company_filing" // annual reports, company disclosures
  | "data_provider" // licensed third-party market data
  | "sample"; // fictional placeholder in sample mode

export interface Source {
  id: string;
  title: string;
  kind: SourceKind;
  publisher: string;
  /** Absolute URL for external docs, or an internal path for sample docs. */
  url: string | null;
  /** Date printed on the document (ISO yyyy-mm-dd). */
  documentDate: string | null;
  /** When we retrieved / last checked it (ISO timestamp). */
  accessedAt: string;
}

/** Pointer from a fact to a source, optionally to a page or section. */
export interface Citation {
  sourceId: string;
  /** e.g. "Risk Factors, p. 34" or "Restated financial information". */
  locator?: string;
}

export interface SourcedValue<T = number> {
  value: T | null;
  unit: Unit;
  /** Financial period (e.g. "FY2025") or as-of date for point-in-time values. */
  period?: string;
  citation: Citation | null;
  status: VerificationStatus;
  /** ISO timestamp of the last update to this field. */
  updatedAt: string;
}

/** A sentence-level claim that must be cited or flagged as a hypothesis. */
export interface Claim {
  text: string;
  citation: Citation | null;
  /** True when the point is an interpretation that still needs verification. */
  hypothesis?: boolean;
}

export type IpoStatus = "upcoming" | "open" | "closed" | "listed";
export type Exchange = "NSE" | "BSE";
export type Board = "Mainboard" | "SME";
export type IssueMethod = "Book built" | "Fixed price";
export type AnalysisCoverage = "complete" | "partial" | "basic";
export type DataMode = "sample" | "live";

export interface Company {
  name: string;
  /** One-line description used on cards. */
  tagline: string;
  sector: string;
  incorporated?: string;
  headquarters?: string;
  website?: string | null;
}

export interface IssueDates {
  open: SourcedValue<string>;
  close: SourcedValue<string>;
  allotment: SourcedValue<string>;
  listing: SourcedValue<string>;
}

export interface FinancialYear {
  /** Label such as "FY2025" (Indian FY ends 31 March). */
  period: string;
  periodEnd: string;
  /** Months covered; partial periods (e.g. 6M) must not be compared to full years. */
  months: number;
  revenue: SourcedValue; // revenue from operations, ₹ crore
  pat: SourcedValue; // profit after tax, ₹ crore
  borrowings: SourcedValue; // total borrowings, ₹ crore
  netWorth: SourcedValue; // ₹ crore
  operatingCashFlow: SourcedValue; // ₹ crore
  dilutedEps: SourcedValue; // ₹ per share
}

export interface FinancialStatements {
  basis: "consolidated" | "standalone";
  /** What the revenue line represents. Defaults to revenue from operations. */
  revenueBasis?: "operations" | "total_income";
  /** Notes such as "Restated, as per RHP". */
  note?: string;
  years: FinancialYear[];
}

export interface Peer {
  name: string;
  exchange: Exchange;
  /** P/E as disclosed in the offer document's "Basis for Offer Price". */
  pe: SourcedValue;
  revenue: SourcedValue;
  patMargin: SourcedValue;
  revenueGrowth: SourcedValue;
}

export interface ProceedsUse {
  label: string;
  amount: SourcedValue;
  explanation: string;
}

export interface OfsSeller {
  name: string;
  type: "Promoter" | "Promoter group" | "Investor" | "Other";
  amount: SourcedValue; // ₹ crore at upper band
}

export interface LockIn {
  description: string;
  citation: Citation | null;
  status: VerificationStatus;
}

export type DocumentType = "DRHP" | "RHP" | "Prospectus" | "Addendum" | "Basis of Allotment";

export interface OfferDocument {
  type: DocumentType;
  sourceId: string;
}

export type RiskCategory =
  | "concentration"
  | "litigation"
  | "related_party"
  | "promoter_ofs"
  | "debt_cashflow"
  | "dependence"
  | "industry_regulatory";

export interface RiskFinding {
  id: string;
  category: RiskCategory;
  title: string;
  summary: string;
  whyItMatters: string;
  /** "material" = disclosed as significant; "caution" = worth knowing. */
  severity: "material" | "caution";
  citation: Citation | null;
}

export interface BusinessProfile {
  whatItDoes: Claim;
  products: Claim[];
  /** Null when not yet summarised from a source. */
  customers: Claim | null;
  revenueModel: Claim | null;
  growthDrivers: Claim[];
  challenges: Claim[];
  /** Longer explanation shown in "Detailed" mode. */
  detail?: string;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface ListingPerformance {
  listingDate: SourcedValue<string>;
  listingOpen: SourcedValue; // ₹, first traded price
  listingClose: SourcedValue; // ₹, listing-day close
  /** Daily closes since listing, with a single source for the series. */
  history: { points: PricePoint[]; citation: Citation | null; status: VerificationStatus };
  latest: SourcedValue; // ₹, latest available close (period = as-of date)
}

export interface Ipo {
  id: string;
  slug: string;
  dataMode: DataMode;
  company: Company;
  exchanges: Exchange[];
  board: Board;
  issueMethod: IssueMethod;
  coverage: AnalysisCoverage;
  dates: IssueDates;
  priceBand: { low: SourcedValue; high: SourcedValue };
  faceValue: SourcedValue;
  lotSize: SourcedValue;
  issueSize: { total: SourcedValue; fresh: SourcedValue; ofs: SourcedValue };
  /** Shares outstanding after the issue (for market cap). */
  postIssueShares: SourcedValue;
  promoterHolding: { pre: SourcedValue; post: SourcedValue };
  proceedsUse: ProceedsUse[];
  ofsSellers: OfsSeller[];
  lockIns: LockIn[];
  documents: OfferDocument[];
  business: BusinessProfile | null;
  financials: FinancialStatements | null;
  peers: Peer[];
  risks: RiskFinding[];
  bullCase: Claim[];
  bearCase: Claim[];
  listing: ListingPerformance | null;
  /**
   * Grey market premium (₹ per share, `period` = as-of timestamp). Unofficial
   * and unregulated: shown for reference only, never used in any assessment.
   */
  gmp?: SourcedValue | null;
  sources: Source[];
  /** ISO timestamp of the last editorial review of this IPO. */
  lastReviewed: string;
}

/** Card-sized projection used on listing pages. */
export interface IpoSummary {
  id: string;
  slug: string;
  dataMode: DataMode;
  name: string;
  tagline: string;
  sector: string;
  exchanges: Exchange[];
  board: Board;
  issueMethod: IssueMethod;
  status: IpoStatus;
  coverage: AnalysisCoverage;
  openDate: SourcedValue<string>;
  closeDate: SourcedValue<string>;
  listingDate: SourcedValue<string>;
  priceLow: SourcedValue;
  priceHigh: SourcedValue;
  minInvestment: SourcedValue;
  issueSize: SourcedValue;
  /** Only populated before listing. */
  gmp: SourcedValue | null;
  gmpPublisher: string | null;
  lastReviewed: string;
}
