/**
 * FICTIONAL SAMPLE COMPANIES.
 *
 * Every company, person, peer, figure and document below is invented for
 * demonstration. Names were chosen to sound plausible but do not refer to any
 * real entity. Issue dates are generated relative to "today" so the
 * Upcoming / Open / Closed / Listed tabs always have content.
 */
import type { Ipo, ListingPerformance, Peer } from "@/lib/types";
import { kit, samplePriceSeries, type DateCtx } from "./kit";

type Kit = ReturnType<typeof kit>;

function peer(k: Kit, name: string, pe: number | null, revenue: number, margin: number, growth: number): Peer {
  const loc = "Basis for Offer Price: Comparison with listed industry peers";
  return {
    name,
    exchange: "NSE",
    pe: k.v(pe, "RATIO", "FY2026", loc),
    revenue: k.v(revenue, "INR_CRORE", "FY2026", loc),
    patMargin: k.v(margin, "PERCENT", "FY2026", loc),
    revenueGrowth: k.v(growth, "PERCENT", "FY2026", loc),
  };
}

function listed(
  k: Kit,
  ctx: DateCtx,
  listingDay: number,
  open: number,
  close: number,
  target: number,
  seed: number,
): ListingPerformance {
  const listingDate = ctx.d(listingDay);
  const points = samplePriceSeries(listingDate, ctx.d(-1), close, target, seed);
  const last = points[points.length - 1];
  return {
    listingDate: k.v(listingDate, "DATE", undefined, "Exchange listing notice (fictional)"),
    listingOpen: k.v(open, "INR", listingDate, "Exchange listing notice (fictional)"),
    listingClose: k.v(close, "INR", listingDate, "Exchange bhavcopy (fictional)"),
    history: { points, citation: k.cite("Sample price series"), status: "sample" },
    latest: last ? k.v(last.close, "INR", last.date, "Sample price series") : k.na("INR"),
  };
}

const PROMOTER_LOCKIN = "Minimum promoter contribution (20% of post-issue capital) locked in for 18 months from allotment; excess promoter holding locked in for 6 months.";
const ANCHOR_LOCKIN = "Anchor investors: 50% of shares locked in for 30 days and the remaining 50% for 90 days from allotment.";

// ---------------------------------------------------------------------------

function kaveri(ctx: DateCtx): Ipo {
  const slug = "kaveri-kitchenware";
  const name = "Kaveri Kitchenware Ltd";
  const k = kit(slug, name, ctx, 52);
  return {
    id: "smp-001",
    slug,
    dataMode: "sample",
    company: {
      name,
      tagline: "Pressure cookers, cookware and small kitchen appliances sold through dealers across South and West India.",
      sector: "Consumer durables",
      incorporated: "1998",
      headquarters: "Coimbatore, Tamil Nadu",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "complete",
    dates: {
      open: k.v(ctx.d(-40), "DATE", undefined, "Offer Programme"),
      close: k.v(ctx.d(-38), "DATE", undefined, "Offer Programme"),
      allotment: k.v(ctx.d(-37), "DATE", undefined, "Indicative timetable"),
      listing: k.v(ctx.d(-35), "DATE", undefined, "Indicative timetable"),
    },
    priceBand: { low: k.v(285, "INR", undefined, "Price Band Advertisement"), high: k.v(300, "INR", undefined, "Price Band Advertisement") },
    faceValue: k.v(2, "INR", undefined, "The Offer"),
    lotSize: k.v(50, "SHARES", undefined, "Price Band Advertisement"),
    issueSize: {
      total: k.v(720, "INR_CRORE", undefined, "The Offer"),
      fresh: k.v(400, "INR_CRORE", undefined, "The Offer"),
      ofs: k.v(320, "INR_CRORE", undefined, "The Offer"),
    },
    postIssueShares: k.v(104_000_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: {
      pre: k.v(78.4, "PERCENT", undefined, "Capital Structure: Shareholding pattern"),
      post: k.v(66.1, "PERCENT", undefined, "Capital Structure: Shareholding pattern"),
    },
    proceedsUse: [
      { label: "New manufacturing line at Hosur", amount: k.v(210, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Adds capacity for non-stick cookware, which the company says it currently partly outsources." },
      { label: "Repay borrowings", amount: k.v(110, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Lower debt means lower interest costs, which can lift profit." },
      { label: "General corporate purposes", amount: k.v(80, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Flexible money the company can use as it sees fit, capped by SEBI rules at 25% of the fresh issue." },
    ],
    ofsSellers: [
      { name: "Founding family trust (fictional)", type: "Promoter group", amount: k.v(180, "INR_CRORE", undefined, "The Offer") },
      { name: "Western Ghats Growth Fund I (fictional)", type: "Investor", amount: k.v(140, "INR_CRORE", undefined, "The Offer") },
    ],
    lockIns: [
      { description: PROMOTER_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
      { description: ANCHOR_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
    ],
    documents: [{ type: "RHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Kaveri designs, makes and sells pressure cookers, cookware and small appliances such as mixer-grinders under its own brand.", "Our Business: Overview"),
      products: [
        k.c("Pressure cookers (about 46% of FY2026 revenue)", "Our Business: Revenue by product"),
        k.c("Cookware such as kadhais, tawas and non-stick pans (about 34%)", "Our Business: Revenue by product"),
        k.c("Small appliances including mixer-grinders and induction cooktops (about 20%)", "Our Business: Revenue by product"),
      ],
      customers: k.c("Households, reached mainly through about 6,200 independent dealers; online marketplaces were about 11% of revenue.", "Our Business: Distribution"),
      revenueModel: k.c("Sells products to dealers and online platforms at a margin over manufacturing cost; most products are made in its own two factories.", "Our Business: Manufacturing"),
      growthDrivers: [
        k.c("Expanding dealer network into North and East India, where it has low presence today.", "Our Strategies"),
        k.c("New non-stick capacity funded by the IPO to reduce outsourcing.", "Objects of the Offer"),
        k.h("Rising household incomes may increase demand for branded cookware over unbranded products."),
      ],
      challenges: [
        k.c("Steel and aluminium prices move sharply, and the company cannot always pass increases on quickly.", "Risk Factors: 3"),
        k.c("Strong national brands and low-cost unbranded products compete on price.", "Industry Overview"),
      ],
      detail:
        "Kaveri is a regional consumer brand in a crowded category. Its advantage, per the offer document, is a dense dealer network in the South and in-house manufacturing, which helps control costs. The main questions for an investor are whether it can replicate that distribution in new regions, and how well margins hold when metal prices rise.",
    },
    financials: {
      basis: "consolidated",
      note: "Restated consolidated financial information as presented in the RHP.",
      years: [
        k.fy("FY2024", "2024-03-31", { rev: 1020, pat: 61, debt: 210, nw: 420, ocf: 70, eps: 6.1 }),
        k.fy("FY2025", "2025-03-31", { rev: 1240, pat: 82, debt: 190, nw: 500, ocf: 95, eps: 8.2 }),
        k.fy("FY2026", "2026-03-31", { rev: 1510, pat: 108, debt: 150, nw: 610, ocf: 121, eps: 10.8 }),
      ],
    },
    peers: [
      peer(k, "Vindhya Home Appliances Ltd (fictional)", 38.2, 2840, 8.5, 14.2),
      peer(k, "Sahyadri Cookware Ltd (fictional)", 42.0, 1960, 9.1, 11.8),
      peer(k, "Narmada Kitchen Products Ltd (fictional)", 31.4, 1310, 6.9, 16.5),
    ],
    risks: [
      { id: "r1", category: "dependence", title: "Profitability depends on steel and aluminium prices", summary: "Raw materials were about 58% of revenue in FY2026. A sharp rise in metal prices squeezed margins in FY2023.", whyItMatters: "If costs jump and prices can't be raised quickly, profit can fall even while sales grow.", severity: "material", citation: k.cite("Risk Factors: 3") },
      { id: "r2", category: "concentration", title: "Sales concentrated in four southern states", summary: "Tamil Nadu, Karnataka, Kerala and Andhra Pradesh contributed about 71% of revenue.", whyItMatters: "A slowdown or new competitor in one region can hit a large part of the business.", severity: "material", citation: k.cite("Risk Factors: 5") },
      { id: "r3", category: "litigation", title: "Pending tax disputes of about ₹14 crore", summary: "Indirect tax demands are under appeal.", whyItMatters: "Small relative to profit, but an adverse outcome would be a one-time cost.", severity: "caution", citation: k.cite("Outstanding Litigation") },
    ],
    bullCase: [
      k.c("Revenue grew every year, from ₹1,020 cr in FY2024 to ₹1,510 cr in FY2026.", "Restated Financial Information"),
      k.c("Profit margin improved from 6.0% to 7.2% over the same period.", "Restated Financial Information"),
      k.c("Borrowings fell while the business grew, and the IPO repays a further ₹110 cr.", "Objects of the Offer"),
      k.h("Expansion into North India could extend the growth runway, if the dealer model travels well."),
    ],
    bearCase: [
      k.c("About 71% of revenue comes from four states.", "Risk Factors: 5"),
      k.c("Margins are exposed to volatile metal prices.", "Risk Factors: 3"),
      k.c("44% of the issue is an offer for sale, so that portion goes to existing shareholders, not the company.", "The Offer"),
      k.h("National brands could respond aggressively to Kaveri's entry into their stronghold regions."),
    ],
    listing: listed(k, ctx, -35, 342, 351, 318, 11),
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function saffron(ctx: DateCtx): Ipo {
  const slug = "saffron-ledger-payments";
  const name = "Saffron Ledger Payments Ltd";
  const k = kit(slug, name, ctx, 21);
  return {
    id: "smp-002",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Payment gateway and billing software for small online merchants; loss-making but narrowing losses.", sector: "Financial technology", incorporated: "2015", headquarters: "Bengaluru, Karnataka" },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "complete",
    dates: {
      open: k.v(ctx.d(12), "DATE", undefined, "Offer Programme"),
      close: k.v(ctx.d(14), "DATE", undefined, "Offer Programme"),
      allotment: k.v(ctx.d(15), "DATE", undefined, "Indicative timetable"),
      listing: k.v(ctx.d(19), "DATE", undefined, "Indicative timetable"),
    },
    priceBand: { low: k.v(410, "INR", undefined, "Price Band Advertisement"), high: k.v(432, "INR", undefined, "Price Band Advertisement") },
    faceValue: k.v(1, "INR", undefined, "The Offer"),
    lotSize: k.v(34, "SHARES", undefined, "Price Band Advertisement"),
    issueSize: {
      total: k.v(1850, "INR_CRORE", undefined, "The Offer"),
      fresh: k.v(850, "INR_CRORE", undefined, "The Offer"),
      ofs: k.v(1000, "INR_CRORE", undefined, "The Offer"),
    },
    postIssueShares: k.v(412_000_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: {
      pre: k.v(17.8, "PERCENT", undefined, "Capital Structure"),
      post: k.v(14.2, "PERCENT", undefined, "Capital Structure"),
    },
    proceedsUse: [
      { label: "Technology and product development", amount: k.v(380, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Spending on engineers and infrastructure. Useful if it produces products customers pay for, but returns are hard to measure." },
      { label: "Customer acquisition and marketing", amount: k.v(260, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Money to win new merchants. In loss-making companies this can keep losses high for longer." },
      { label: "General corporate purposes", amount: k.v(210, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Unallocated funds the company can deploy at its discretion." },
    ],
    ofsSellers: [
      { name: "Monsoon Ventures II (fictional)", type: "Investor", amount: k.v(620, "INR_CRORE", undefined, "The Offer") },
      { name: "Deccan Crossover Fund (fictional)", type: "Investor", amount: k.v(380, "INR_CRORE", undefined, "The Offer") },
    ],
    lockIns: [
      { description: "Pre-IPO investors' shares locked in for 6 months from allotment (company has no identifiable promoter holding above 20%).", citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
      { description: ANCHOR_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
    ],
    documents: [{ type: "RHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Saffron Ledger lets small online businesses accept card, UPI and wallet payments, and sells invoicing and subscription-billing software on top.", "Our Business: Overview"),
      products: [
        k.c("Payment gateway (about 72% of revenue)", "Our Business: Revenue mix"),
        k.c("Billing and invoicing software subscriptions (about 21%)", "Our Business: Revenue mix"),
        k.c("Working-capital loans to merchants in partnership with NBFCs (about 7%)", "Our Business: Revenue mix"),
      ],
      customers: k.c("About 3.1 lakh active merchants, mostly small e-commerce sellers and service providers.", "Our Business: Key metrics"),
      revenueModel: k.c("Earns a small fee on each payment processed, plus monthly software subscriptions. A large share of fees is paid out to banks and card networks.", "Our Business: Revenue model"),
      growthDrivers: [
        k.c("More small businesses moving online and accepting digital payments.", "Industry Overview"),
        k.c("Selling software subscriptions to existing payment customers, which carry higher margins.", "Our Strategies"),
      ],
      challenges: [
        k.c("UPI payments carry zero or very low merchant fees by regulation, limiting revenue per transaction.", "Risk Factors: 2"),
        k.c("Payment aggregators require RBI authorisation and must meet ongoing compliance rules.", "Key Regulations"),
        k.h("Larger, well-funded competitors could cut prices to win the same small merchants."),
      ],
      detail:
        "Saffron Ledger is growing quickly but has not yet made a profit. Losses have narrowed each year. The investment case rests on the company reaching profitability before it needs to raise more money, and on software revenue growing faster than low-margin payment revenue.",
    },
    financials: {
      basis: "consolidated",
      note: "Restated consolidated financial information.",
      years: [
        k.fy("FY2024", "2024-03-31", { rev: 380, pat: -210, debt: 40, nw: 900, ocf: -180, eps: -5.2 }),
        k.fy("FY2025", "2025-03-31", { rev: 590, pat: -145, debt: 55, nw: 760, ocf: -90, eps: -3.6 }),
        k.fy("FY2026", "2026-03-31", { rev: 820, pat: -62, debt: 70, nw: 700, ocf: -25, eps: -1.5 }),
      ],
    },
    peers: [
      peer(k, "Indus PayStack Ltd (fictional)", 85.0, 2350, 6.2, 24.0),
      peer(k, "Coromandel Fintech Ltd (fictional)", 120.4, 1180, 3.8, 31.5),
    ],
    risks: [
      { id: "r1", category: "debt_cashflow", title: "History of losses and negative operating cash flow", summary: "The company has made losses in every year shown and burned cash from operations.", whyItMatters: "Loss-making companies may need to raise more money later, which can dilute existing shareholders.", severity: "material", citation: k.cite("Risk Factors: 1") },
      { id: "r2", category: "industry_regulatory", title: "Dependence on RBI payment-aggregator authorisation", summary: "Losing or failing to renew authorisation would stop the core business.", whyItMatters: "A regulatory decision outside the company's control could shut down its main revenue source.", severity: "material", citation: k.cite("Risk Factors: 4") },
      { id: "r3", category: "industry_regulatory", title: "Fee caps on UPI and debit-card payments", summary: "Regulated low or zero fees on popular payment methods limit pricing power.", whyItMatters: "Revenue may not grow as fast as payment volumes.", severity: "material", citation: k.cite("Risk Factors: 2") },
      { id: "r4", category: "promoter_ofs", title: "Majority of the issue is an offer for sale by investors", summary: "₹1,000 cr of the ₹1,850 cr issue goes to venture investors selling shares.", whyItMatters: "Early investors are partly exiting; the company only receives the fresh-issue portion.", severity: "material", citation: k.cite("The Offer") },
    ],
    bullCase: [
      k.c("Revenue more than doubled from ₹380 cr (FY2024) to ₹820 cr (FY2026).", "Restated Financial Information"),
      k.c("Net loss narrowed from ₹210 cr to ₹62 cr over the same period.", "Restated Financial Information"),
      k.c("Low borrowings relative to net worth.", "Restated Financial Information"),
      k.h("Software subscriptions could lift margins if adoption keeps rising."),
    ],
    bearCase: [
      k.c("Still loss-making with negative operating cash flow.", "Restated Financial Information"),
      k.c("Core business depends on regulatory authorisation and regulated fee levels.", "Risk Factors: 2, 4"),
      k.c("54% of the issue is an offer for sale by existing investors.", "The Offer"),
      k.h("Valuation cannot be checked with P/E because there are no earnings; other measures such as price-to-sales would be needed."),
    ],
    listing: null,
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function nilgiri(ctx: DateCtx): Ipo {
  const slug = "nilgiri-specialty-chemicals";
  const name = "Nilgiri Specialty Chemicals Ltd";
  const k = kit(slug, name, ctx, 14);
  return {
    id: "smp-003",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Specialty chemical intermediates for pharma and agrochemical makers; entire issue is an offer for sale.", sector: "Chemicals", incorporated: "2004", headquarters: "Vapi, Gujarat" },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "complete",
    dates: {
      open: k.v(ctx.d(-1), "DATE", undefined, "Offer Programme"),
      close: k.v(ctx.d(1), "DATE", undefined, "Offer Programme"),
      allotment: k.v(ctx.d(2), "DATE", undefined, "Indicative timetable"),
      listing: k.v(ctx.d(5), "DATE", undefined, "Indicative timetable"),
    },
    priceBand: { low: k.v(540, "INR", undefined, "Price Band Advertisement"), high: k.v(568, "INR", undefined, "Price Band Advertisement") },
    faceValue: k.v(10, "INR", undefined, "The Offer"),
    lotSize: k.v(26, "SHARES", undefined, "Price Band Advertisement"),
    issueSize: {
      total: k.v(960, "INR_CRORE", undefined, "The Offer"),
      fresh: k.v(0, "INR_CRORE", undefined, "The Offer"),
      ofs: k.v(960, "INR_CRORE", undefined, "The Offer"),
    },
    postIssueShares: k.v(51_400_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: { pre: k.v(100, "PERCENT", undefined, "Capital Structure"), post: k.v(75, "PERCENT", undefined, "Capital Structure") },
    proceedsUse: [],
    ofsSellers: [
      { name: "Promoter A (fictional)", type: "Promoter", amount: k.v(560, "INR_CRORE", undefined, "The Offer") },
      { name: "Promoter B (fictional)", type: "Promoter", amount: k.v(400, "INR_CRORE", undefined, "The Offer") },
    ],
    lockIns: [
      { description: PROMOTER_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
      { description: ANCHOR_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
    ],
    documents: [{ type: "RHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Nilgiri makes chemical building blocks ('intermediates') that pharmaceutical and crop-protection companies use to manufacture their final products.", "Our Business: Overview"),
      products: [
        k.c("Pharma intermediates (about 64% of revenue)", "Our Business: Product portfolio"),
        k.c("Agrochemical intermediates (about 31%)", "Our Business: Product portfolio"),
        k.c("Custom synthesis projects (about 5%)", "Our Business: Product portfolio"),
      ],
      customers: k.c("Around 140 customers, but the top five contributed about 61% of FY2026 revenue; exports were about 48% of revenue.", "Our Business: Customers"),
      revenueModel: k.c("Sells chemicals under purchase orders and multi-year supply contracts, priced partly on raw-material costs.", "Our Business: Contracts"),
      growthDrivers: [
        k.c("Global customers diversifying supply away from a single country ('China plus one').", "Industry Overview"),
        k.h("New product approvals with existing customers could restart growth, but timing is uncertain."),
      ],
      challenges: [
        k.c("Revenue fell in FY2026 as agrochemical customers cut inventory.", "Management's Discussion and Analysis"),
        k.c("Chemical plants face strict pollution-control rules and inspections.", "Risk Factors: 6"),
      ],
      detail:
        "This is an established, profitable manufacturer going through a down-cycle. Because the entire IPO is an offer for sale, the company itself receives no money; the promoters are selling a quarter of their holding. The key questions are whether demand recovers and whether the price asked already assumes it will.",
    },
    financials: {
      basis: "consolidated",
      note: "Restated consolidated financial information.",
      years: [
        k.fy("FY2024", "2024-03-31", { rev: 640, pat: 92, debt: 120, nw: 520, ocf: 88, eps: 17.9 }),
        k.fy("FY2025", "2025-03-31", { rev: 710, pat: 96, debt: 110, nw: 600, ocf: 70, eps: 18.7 }),
        k.fy("FY2026", "2026-03-31", { rev: 690, pat: 71, debt: 140, nw: 660, ocf: 45, eps: 13.8 }),
      ],
    },
    peers: [
      peer(k, "Sabarmati Fine Chem Ltd (fictional)", 32.1, 1420, 13.2, 4.1),
      peer(k, "Tapi Intermediates Ltd (fictional)", 35.4, 980, 11.6, -2.3),
      peer(k, "Mahi Organics Ltd (fictional)", 29.0, 2210, 12.4, 6.8),
    ],
    risks: [
      { id: "r1", category: "concentration", title: "Top five customers are about 61% of revenue", summary: "Losing or renegotiating with one large customer could materially reduce revenue.", whyItMatters: "When a few customers dominate, they have strong bargaining power over price.", severity: "material", citation: k.cite("Risk Factors: 1") },
      { id: "r2", category: "promoter_ofs", title: "100% offer for sale by promoters", summary: "The company receives no proceeds; promoters' stake falls from 100% to 75%.", whyItMatters: "The IPO funds the sellers, not the business's growth.", severity: "material", citation: k.cite("The Offer") },
      { id: "r3", category: "industry_regulatory", title: "Environmental compliance", summary: "A show-cause notice from the state pollution control board was resolved in FY2025.", whyItMatters: "Regulators can halt production at chemical plants, stopping revenue temporarily.", severity: "material", citation: k.cite("Risk Factors: 6") },
      { id: "r4", category: "related_party", title: "Leases plant land from a promoter entity", summary: "Annual lease payments of about ₹3 crore to a promoter-owned company.", whyItMatters: "Related-party deals need scrutiny to ensure they are on fair terms.", severity: "caution", citation: k.cite("Related Party Transactions") },
    ],
    bullCase: [
      k.c("Consistently profitable with double-digit profit margins in all three years.", "Restated Financial Information"),
      k.c("Positive operating cash flow every year and moderate debt.", "Restated Financial Information"),
      k.h("A recovery in agrochemical demand could restore growth."),
    ],
    bearCase: [
      k.c("Revenue declined in FY2026 and profit fell about 26%.", "Restated Financial Information"),
      k.c("Top five customers account for about 61% of revenue.", "Risk Factors: 1"),
      k.c("Entire issue is an offer for sale; no money goes to the company.", "The Offer"),
      k.c("P/E at the upper band is above the median of the peers listed in the RHP.", "Basis for Offer Price"),
    ],
    listing: null,
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function deccan(ctx: DateCtx): Ipo {
  const slug = "deccan-rail-components";
  const name = "Deccan Rail Components Ltd";
  const k = kit(slug, name, ctx, 24);
  return {
    id: "smp-004",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Bogie parts and brake systems for Indian Railways; fast growth funded with significant borrowing.", sector: "Capital goods", incorporated: "2009", headquarters: "Hyderabad, Telangana" },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "complete",
    dates: {
      open: k.v(ctx.d(-6), "DATE", undefined, "Offer Programme"),
      close: k.v(ctx.d(-4), "DATE", undefined, "Offer Programme"),
      allotment: k.v(ctx.d(-1), "DATE", undefined, "Indicative timetable"),
      listing: k.v(ctx.d(2), "DATE", undefined, "Indicative timetable"),
    },
    priceBand: { low: k.v(112, "INR", undefined, "Price Band Advertisement"), high: k.v(118, "INR", undefined, "Price Band Advertisement") },
    faceValue: k.v(10, "INR", undefined, "The Offer"),
    lotSize: k.v(127, "SHARES", undefined, "Price Band Advertisement"),
    issueSize: {
      total: k.v(400, "INR_CRORE", undefined, "The Offer"),
      fresh: k.v(300, "INR_CRORE", undefined, "The Offer"),
      ofs: k.v(100, "INR_CRORE", undefined, "The Offer"),
    },
    postIssueShares: k.v(112_000_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: { pre: k.v(91.2, "PERCENT", undefined, "Capital Structure"), post: k.v(68.0, "PERCENT", undefined, "Capital Structure") },
    proceedsUse: [
      { label: "Repay borrowings", amount: k.v(190, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Reduces interest costs. Debt is high relative to equity, so this matters." },
      { label: "Working capital", amount: k.v(70, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Railway customers often pay slowly; this funds inventory and receivables." },
      { label: "General corporate purposes", amount: k.v(40, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Discretionary funds." },
    ],
    ofsSellers: [{ name: "Promoter (fictional)", type: "Promoter", amount: k.v(100, "INR_CRORE", undefined, "The Offer") }],
    lockIns: [
      { description: PROMOTER_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
      { description: ANCHOR_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
    ],
    documents: [{ type: "RHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Deccan Rail manufactures bogie frames, couplers and air-brake assemblies used in railway wagons and coaches.", "Our Business: Overview"),
      products: [
        k.c("Bogie frames and castings (about 55% of revenue)", "Our Business: Products"),
        k.c("Air-brake systems (about 30%)", "Our Business: Products"),
        k.c("Couplers and spares (about 15%)", "Our Business: Products"),
      ],
      customers: k.c("Indian Railways and its production units account for about 78% of revenue; the rest is private wagon builders.", "Our Business: Customers"),
      revenueModel: k.c("Wins contracts through government tenders and supplies against long-term orders; order book was ₹1,450 crore at the RHP date.", "Our Business: Order book"),
      growthDrivers: [
        k.c("Government spending on new wagons and dedicated freight corridors.", "Industry Overview"),
        k.c("Order book of about 2.1 times FY2026 revenue.", "Our Business: Order book"),
      ],
      challenges: [
        k.c("Tender-based business: prices are competitive and contracts can be lost.", "Risk Factors: 2"),
        k.c("Long payment cycles mean cash is tied up, which has been funded with debt.", "Risk Factors: 4"),
      ],
      detail:
        "Deccan Rail is growing fast on the back of railway spending, but that growth has consumed cash and been funded with borrowings. Operating cash flow was negative in two of three years. The IPO repays part of the debt. Investors should weigh the strong order book against heavy dependence on a single government customer.",
    },
    financials: {
      basis: "consolidated",
      years: [
        k.fy("FY2024", "2024-03-31", { rev: 410, pat: 18, debt: 520, nw: 240, ocf: -30, eps: 2.1 }),
        k.fy("FY2025", "2025-03-31", { rev: 520, pat: 27, debt: 610, nw: 270, ocf: 12, eps: 3.1 }),
        k.fy("FY2026", "2026-03-31", { rev: 690, pat: 41, debt: 700, nw: 315, ocf: -18, eps: 4.7 }),
      ],
    },
    peers: [
      peer(k, "Godavari Wagon Works Ltd (fictional)", 44.0, 3100, 9.0, 21.0),
      peer(k, "Krishna Railtech Ltd (fictional)", 51.2, 1650, 11.2, 18.4),
      peer(k, "Bhima Castings Ltd (fictional)", 38.3, 920, 8.1, 12.5),
    ],
    risks: [
      { id: "r1", category: "concentration", title: "About 78% of revenue from Indian Railways", summary: "Any slowdown in railway procurement or change in tender policy would hit revenue.", whyItMatters: "One customer, and a government one, effectively sets the company's fortunes.", severity: "material", citation: k.cite("Risk Factors: 1") },
      { id: "r2", category: "debt_cashflow", title: "High borrowings and negative operating cash flow", summary: "Debt-to-equity was about 2.2x in FY2026; operating cash flow was negative in two of three years.", whyItMatters: "High debt increases interest costs and risk if business slows.", severity: "material", citation: k.cite("Risk Factors: 4") },
      { id: "r3", category: "related_party", title: "Purchases from promoter-group foundry", summary: "About 9% of raw material purchases are from a promoter-group company.", whyItMatters: "Can be fine, but investors should check that prices are at arm's length.", severity: "material", citation: k.cite("Related Party Transactions") },
      { id: "r4", category: "litigation", title: "Arbitration over delayed-delivery penalties", summary: "Claims of about ₹22 crore are under arbitration.", whyItMatters: "An adverse award would reduce profit in that year.", severity: "caution", citation: k.cite("Outstanding Litigation") },
    ],
    bullCase: [
      k.c("Revenue grew about 30% a year from FY2024 to FY2026.", "Restated Financial Information"),
      k.c("Order book of about ₹1,450 cr gives visibility for roughly two years of revenue.", "Our Business: Order book"),
      k.c("P/E at the upper band is below the median of peers named in the RHP.", "Basis for Offer Price"),
    ],
    bearCase: [
      k.c("Debt-to-equity of about 2.2x; operating cash flow negative in FY2024 and FY2026.", "Restated Financial Information"),
      k.c("About 78% of revenue from a single government customer.", "Risk Factors: 1"),
      k.c("Profit margin of about 5.9% is below the peer median.", "Basis for Offer Price"),
      k.h("A lower P/E than peers may reflect the higher debt and customer concentration rather than a bargain."),
    ],
    listing: null,
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function brahmaputra(ctx: DateCtx): Ipo {
  const slug = "brahmaputra-agro-foods";
  const name = "Brahmaputra Agro Foods Ltd";
  const k = kit(slug, name, ctx, 30, "Draft Red Herring Prospectus");
  return {
    id: "smp-005",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Small tea and spice processor from Assam raising money on the SME platform; limited data disclosed.", sector: "Food processing", incorporated: "2016", headquarters: "Guwahati, Assam" },
    exchanges: ["BSE"],
    board: "SME",
    issueMethod: "Fixed price",
    coverage: "partial",
    dates: {
      open: k.v(ctx.d(20), "DATE", undefined, "Issue Programme"),
      close: k.v(ctx.d(22), "DATE", undefined, "Issue Programme"),
      allotment: k.na("DATE"),
      listing: k.na("DATE"),
    },
    priceBand: { low: k.v(96, "INR", undefined, "The Issue"), high: k.v(96, "INR", undefined, "The Issue") },
    faceValue: k.v(10, "INR", undefined, "The Issue"),
    lotSize: k.v(1200, "SHARES", undefined, "The Issue"),
    issueSize: {
      total: k.v(24.6, "INR_CRORE", undefined, "The Issue"),
      fresh: k.v(24.6, "INR_CRORE", undefined, "The Issue"),
      ofs: k.v(0, "INR_CRORE", undefined, "The Issue"),
    },
    postIssueShares: k.v(9_400_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: { pre: k.v(96.5, "PERCENT", undefined, "Capital Structure"), post: k.na("PERCENT") },
    proceedsUse: [
      { label: "Packaging unit", amount: k.v(14.2, "INR_CRORE", undefined, "Objects of the Issue"), explanation: "Lets the company sell packaged branded tea rather than bulk tea." },
      { label: "Working capital", amount: k.v(6.5, "INR_CRORE", undefined, "Objects of the Issue"), explanation: "Funds inventory, important in a seasonal crop business." },
      { label: "General corporate purposes", amount: k.na("INR_CRORE"), explanation: "Amount not yet disclosed in the draft document." },
    ],
    ofsSellers: [],
    lockIns: [{ description: "Lock-in details to be confirmed in the final prospectus.", citation: null, status: "unavailable" }],
    documents: [{ type: "DRHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Brahmaputra buys green tea leaf and spices from small growers, processes them, and sells mostly in bulk to packers and traders.", "Our Business"),
      products: [k.c("Processed CTC and orthodox tea", "Our Business"), k.c("Dried ginger and turmeric", "Our Business")],
      customers: k.c("Tea auction buyers and regional traders; customer concentration not disclosed in the draft.", "Our Business"),
      revenueModel: k.c("Margin between leaf purchase price and processed-product selling price.", "Our Business"),
      growthDrivers: [k.h("Moving into branded packaged tea could raise margins, but the company has no track record in branded retail.")],
      challenges: [
        k.c("Crop output and tea auction prices vary with weather.", "Risk Factors"),
        k.h("Small scale may limit bargaining power with large buyers."),
      ],
    },
    financials: {
      basis: "standalone",
      note: "Only two full years disclosed in the draft document. FY2024 figures unavailable.",
      years: [
        k.fy("FY2025", "2025-03-31", { rev: 38.2, pat: 2.1, debt: 9.4, nw: 11.8, ocf: 1.6, eps: 3.1 }, "Financial Information"),
        k.fy("FY2026", "2026-03-31", { rev: 44.9, pat: 3.0, debt: 11.2, nw: 14.8, ocf: null, eps: 4.4 }, "Financial Information"),
      ],
    },
    peers: [],
    risks: [
      { id: "r1", category: "dependence", title: "Weather-dependent raw material supply", summary: "Poor rainfall or floods can reduce leaf availability and raise costs.", whyItMatters: "Revenue and margins can swing year to year for reasons outside the company's control.", severity: "material", citation: k.cite("Risk Factors") },
      { id: "r2", category: "industry_regulatory", title: "SME listing: lower liquidity", summary: "SME shares trade in large lots with fewer buyers and sellers.", whyItMatters: "It may be hard to sell shares quickly at a fair price.", severity: "caution", citation: k.cite("Risk Factors") },
    ],
    bullCase: [
      k.c("Revenue and profit both grew from FY2025 to FY2026.", "Financial Information"),
      k.c("Entire issue is fresh capital going to the company.", "The Issue"),
    ],
    bearCase: [
      k.c("Only two years of financials disclosed; operating cash flow for FY2026 not available.", "Financial Information"),
      k.c("No listed peers named in the draft document, so valuation cannot be compared.", "Basis for Issue Price"),
      k.c("SME shares typically have low trading liquidity.", "Risk Factors"),
    ],
    listing: null,
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function konkan(ctx: DateCtx): Ipo {
  const slug = "konkan-coastal-logistics";
  const name = "Konkan Coastal Logistics Ltd";
  const k = kit(slug, name, ctx, 105);
  return {
    id: "smp-006",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Port-side warehousing and container trucking on the west coast; listed below issue price.", sector: "Logistics", incorporated: "2007", headquarters: "Navi Mumbai, Maharashtra" },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "complete",
    dates: {
      open: k.v(ctx.d(-95), "DATE", undefined, "Offer Programme"),
      close: k.v(ctx.d(-93), "DATE", undefined, "Offer Programme"),
      allotment: k.v(ctx.d(-92), "DATE", undefined, "Basis of Allotment"),
      listing: k.v(ctx.d(-88), "DATE", undefined, "Exchange listing notice (fictional)"),
    },
    priceBand: { low: k.v(190, "INR", undefined, "Price Band Advertisement"), high: k.v(200, "INR", undefined, "Price Band Advertisement") },
    faceValue: k.v(5, "INR", undefined, "The Offer"),
    lotSize: k.v(75, "SHARES", undefined, "Price Band Advertisement"),
    issueSize: {
      total: k.v(540, "INR_CRORE", undefined, "The Offer"),
      fresh: k.v(220, "INR_CRORE", undefined, "The Offer"),
      ofs: k.v(320, "INR_CRORE", undefined, "The Offer"),
    },
    postIssueShares: k.v(61_000_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: { pre: k.v(72.0, "PERCENT", undefined, "Capital Structure"), post: k.v(58.3, "PERCENT", undefined, "Capital Structure") },
    proceedsUse: [
      { label: "Purchase of trailers and handling equipment", amount: k.v(140, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Expands the trucking fleet." },
      { label: "Repay borrowings", amount: k.v(50, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Reduces interest costs." },
      { label: "General corporate purposes", amount: k.v(30, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Discretionary funds." },
    ],
    ofsSellers: [
      { name: "Promoter (fictional)", type: "Promoter", amount: k.v(120, "INR_CRORE", undefined, "The Offer") },
      { name: "Arabian Sea Infra Fund (fictional)", type: "Investor", amount: k.v(200, "INR_CRORE", undefined, "The Offer") },
    ],
    lockIns: [
      { description: PROMOTER_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
      { description: ANCHOR_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
    ],
    documents: [
      { type: "RHP", sourceId: k.sourceId },
    ],
    business: {
      whatItDoes: k.c("Konkan operates container freight stations and warehouses near west-coast ports and trucks containers between ports and inland depots.", "Our Business: Overview"),
      products: [
        k.c("Container freight station services (about 52% of revenue)", "Our Business: Segments"),
        k.c("Trucking and transport (about 38%)", "Our Business: Segments"),
        k.c("Warehousing (about 10%)", "Our Business: Segments"),
      ],
      customers: k.c("Shipping lines, freight forwarders and importers/exporters; top ten customers about 34% of revenue.", "Our Business: Customers"),
      revenueModel: k.c("Charges per container handled, stored or moved.", "Our Business"),
      growthDrivers: [k.c("Growth in container traffic at west-coast ports.", "Industry Overview")],
      challenges: [
        k.c("Business volumes follow trade cycles and port congestion.", "Risk Factors: 2"),
        k.c("Fuel is a large cost for the trucking segment.", "Risk Factors: 5"),
      ],
      detail: "A steady but slow-growing business whose growth decelerated before the IPO, and whose margin fell in the latest year.",
    },
    financials: {
      basis: "consolidated",
      years: [
        k.fy("FY2023", "2023-03-31", { rev: 880, pat: 44, debt: 290, nw: 330, ocf: 92, eps: 8.0 }),
        k.fy("FY2024", "2024-03-31", { rev: 960, pat: 46, debt: 310, nw: 370, ocf: 101, eps: 8.4 }),
        k.fy("FY2025", "2025-03-31", { rev: 1010, pat: 39, debt: 330, nw: 400, ocf: 85, eps: 7.1 }),
      ],
    },
    peers: [
      peer(k, "Western Ports Logistics Ltd (fictional)", 22.4, 2400, 6.1, 9.8),
      peer(k, "Sindhu Freight Ltd (fictional)", 26.0, 1300, 5.0, 7.2),
      peer(k, "Tapti Containers Ltd (fictional)", 19.1, 860, 4.2, 5.5),
    ],
    risks: [
      { id: "r1", category: "dependence", title: "Volumes tied to trade cycles at two ports", summary: "About 80% of volumes come through two ports.", whyItMatters: "Port disruptions or a trade slowdown directly reduce revenue.", severity: "material", citation: k.cite("Risk Factors: 2") },
      { id: "r2", category: "debt_cashflow", title: "Fuel cost exposure", summary: "Fuel is about 22% of trucking costs.", whyItMatters: "Fuel price increases squeeze margins if contracts don't adjust.", severity: "caution", citation: k.cite("Risk Factors: 5") },
    ],
    bullCase: [
      k.c("Positive operating cash flow in all three years.", "Restated Financial Information"),
      k.c("Diversified customer base: top ten customers about 34% of revenue.", "Our Business: Customers"),
    ],
    bearCase: [
      k.c("Revenue growth slowed from 9.1% to 5.2%, and profit fell in FY2025.", "Restated Financial Information"),
      k.c("P/E at the upper band was above the median of the peers named in the RHP.", "Basis for Offer Price"),
      k.c("59% of the issue was an offer for sale.", "The Offer"),
    ],
    listing: listed(k, ctx, -88, 176, 168.4, 151, 29),
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function aravalli(ctx: DateCtx): Ipo {
  const slug = "aravalli-health-diagnostics";
  const name = "Aravalli Health Diagnostics Ltd";
  const k = kit(slug, name, ctx, 18);
  return {
    id: "smp-007",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Pathology labs and collection centres in Rajasthan and Gujarat; profitable with low debt.", sector: "Healthcare services", incorporated: "2011", headquarters: "Jaipur, Rajasthan" },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "complete",
    dates: {
      open: k.v(ctx.d(-2), "DATE", undefined, "Offer Programme"),
      close: k.v(ctx.d(1), "DATE", undefined, "Offer Programme"),
      allotment: k.v(ctx.d(2), "DATE", undefined, "Indicative timetable"),
      listing: k.v(ctx.d(4), "DATE", undefined, "Indicative timetable"),
    },
    priceBand: { low: k.v(470, "INR", undefined, "Price Band Advertisement"), high: k.v(495, "INR", undefined, "Price Band Advertisement") },
    faceValue: k.v(2, "INR", undefined, "The Offer"),
    lotSize: k.v(30, "SHARES", undefined, "Price Band Advertisement"),
    issueSize: {
      total: k.v(600, "INR_CRORE", undefined, "The Offer"),
      fresh: k.v(250, "INR_CRORE", undefined, "The Offer"),
      ofs: k.v(350, "INR_CRORE", undefined, "The Offer"),
    },
    postIssueShares: k.v(54_800_000, "SHARES", undefined, "Capital Structure"),
    promoterHolding: { pre: k.v(64.0, "PERCENT", undefined, "Capital Structure"), post: k.v(55.6, "PERCENT", undefined, "Capital Structure") },
    proceedsUse: [
      { label: "New regional reference lab in Ahmedabad", amount: k.v(150, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Supports expansion into Gujarat." },
      { label: "Equipment upgrades", amount: k.v(60, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Newer analysers to run more specialised tests." },
      { label: "General corporate purposes", amount: k.v(40, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Discretionary funds." },
    ],
    ofsSellers: [{ name: "Thar Healthcare Partners (fictional)", type: "Investor", amount: k.v(350, "INR_CRORE", undefined, "The Offer") }],
    lockIns: [
      { description: PROMOTER_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
      { description: ANCHOR_LOCKIN, citation: k.cite("Capital Structure: Lock-in"), status: "sample" },
    ],
    documents: [{ type: "RHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Aravalli runs diagnostic labs that test blood and other samples, collected through about 1,100 centres and home visits.", "Our Business: Overview"),
      products: [
        k.c("Routine pathology tests (about 61% of revenue)", "Our Business: Test mix"),
        k.c("Specialised tests such as genetics and oncology markers (about 24%)", "Our Business: Test mix"),
        k.c("Imaging services (about 15%)", "Our Business: Test mix"),
      ],
      customers: k.c("Individual patients (about 70% of revenue) and hospitals/clinics that outsource tests (about 30%).", "Our Business: Customers"),
      revenueModel: k.c("Fee per test; high fixed lab costs mean more tests per lab improves margins.", "Our Business"),
      growthDrivers: [
        k.c("Expansion from Rajasthan into Gujarat with a new reference lab.", "Objects of the Offer"),
        k.c("Growing share of higher-priced specialised tests.", "Our Strategies"),
      ],
      challenges: [
        k.c("National diagnostic chains and online test aggregators compete on price.", "Industry Overview"),
        k.c("About 74% of revenue comes from Rajasthan.", "Risk Factors: 3"),
      ],
      detail: "Aravalli is a profitable regional chain with low debt. Expansion into a new state is the main growth bet and the main execution risk.",
    },
    financials: {
      basis: "standalone",
      note: "Standalone figures: the company has no subsidiaries.",
      years: [
        k.fy("FY2024", "2024-03-31", { rev: 290, pat: 41, debt: 30, nw: 240, ocf: 62, eps: 8.2 }),
        k.fy("FY2025", "2025-03-31", { rev: 345, pat: 50, debt: 42, nw: 285, ocf: 71, eps: 10.0 }),
        k.fy("FY2026", "2026-03-31", { rev: 402, pat: 61, debt: 55, nw: 340, ocf: 84, eps: 12.2 }),
      ],
    },
    peers: [
      peer(k, "Malwa Diagnostics Ltd (fictional)", 58.0, 1480, 16.0, 13.1),
      peer(k, "Satpura Labs Ltd (fictional)", 62.3, 2100, 18.2, 11.4),
      peer(k, "Chambal Pathcare Ltd (fictional)", 49.5, 690, 14.1, 15.8),
    ],
    risks: [
      { id: "r1", category: "concentration", title: "About 74% of revenue from one state", summary: "The business is heavily concentrated in Rajasthan.", whyItMatters: "Regional competition or regulation could affect most of the business at once.", severity: "material", citation: k.cite("Risk Factors: 3") },
      { id: "r2", category: "industry_regulatory", title: "Lab accreditation and pricing regulation", summary: "Labs must maintain accreditation; state schemes may cap test prices.", whyItMatters: "Losing accreditation or price caps would directly hit revenue.", severity: "material", citation: k.cite("Risk Factors: 5") },
      { id: "r3", category: "related_party", title: "Office premises rented from promoter", summary: "Head office is leased from a promoter at about ₹0.6 crore a year.", whyItMatters: "Small, but related-party terms should be checked for fairness.", severity: "caution", citation: k.cite("Related Party Transactions") },
    ],
    bullCase: [
      k.c("Revenue grew about 18% a year and profit margin improved to about 15.2%.", "Restated Financial Information"),
      k.c("Low debt and positive operating cash flow every year.", "Restated Financial Information"),
      k.c("P/E at the upper band is below the median of peers named in the RHP.", "Basis for Offer Price"),
    ],
    bearCase: [
      k.c("About 74% of revenue from Rajasthan.", "Risk Factors: 3"),
      k.c("58% of the issue is an offer for sale by a financial investor.", "The Offer"),
      k.h("Entering Gujarat means competing with established chains; success is not yet proven."),
    ],
    listing: null,
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

// ---------------------------------------------------------------------------

function malabar(ctx: DateCtx): Ipo {
  const slug = "malabar-solar-glass";
  const name = "Malabar Solar Glass Ltd";
  const k = kit(slug, name, ctx, 9, "Draft Red Herring Prospectus");
  return {
    id: "smp-008",
    slug,
    dataMode: "sample",
    company: { name, tagline: "Maker of glass for solar panels that has filed a draft prospectus; dates and price not yet announced.", sector: "Renewable energy components", incorporated: "2019", headquarters: "Kochi, Kerala" },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "basic",
    dates: { open: k.na("DATE"), close: k.na("DATE"), allotment: k.na("DATE"), listing: k.na("DATE") },
    priceBand: { low: k.na("INR"), high: k.na("INR") },
    faceValue: k.v(10, "INR", undefined, "The Offer"),
    lotSize: k.na("SHARES"),
    issueSize: { total: k.na("INR_CRORE"), fresh: k.v(1100, "INR_CRORE", undefined, "The Offer"), ofs: k.na("INR_CRORE") },
    postIssueShares: k.na("SHARES"),
    promoterHolding: { pre: k.v(88.0, "PERCENT", undefined, "Capital Structure"), post: k.na("PERCENT") },
    proceedsUse: [
      { label: "New solar-glass furnace", amount: k.v(800, "INR_CRORE", undefined, "Objects of the Offer"), explanation: "Would roughly double production capacity." },
    ],
    ofsSellers: [],
    lockIns: [],
    documents: [{ type: "DRHP", sourceId: k.sourceId }],
    business: {
      whatItDoes: k.c("Malabar makes tempered, low-iron glass used as the front sheet of solar panels.", "Our Business"),
      products: [k.c("Solar glass sheets", "Our Business")],
      customers: k.c("Indian solar-panel manufacturers.", "Our Business"),
      revenueModel: k.c("Sells glass by the square metre under supply agreements.", "Our Business"),
      growthDrivers: [k.c("Government incentives for domestic solar manufacturing.", "Industry Overview")],
      challenges: [k.h("Imported solar glass competes on price; the impact of trade duties on this competition still needs verification.")],
    },
    financials: null,
    peers: [],
    risks: [],
    bullCase: [],
    bearCase: [],
    listing: null,
    sources: [k.source],
    lastReviewed: ctx.stamp,
  };
}

export const SAMPLE_COMPANIES: Array<(ctx: DateCtx) => Ipo> = [
  kaveri,
  aravalli,
  nilgiri,
  deccan,
  saffron,
  brahmaputra,
  malabar,
  konkan,
];
