/**
 * Curated live IPO records, compiled on 25 Oct 2026 from public sources:
 * Chittorgarh.com IPO pages (issue details, restated financials, KPIs,
 * listing-day prices) and Chittorgarh review pages (peer table reproduced
 * from each RHP's "Basis for Offer Price" section). Each record links its
 * RHP. All values are "unverified" until checked against the RHP itself.
 *
 * Deliberately NOT included (shown as unavailable instead): operating cash
 * flow where no source gave it, peer revenue/margins, RHP risk-factor text,
 * post-listing price history and subscription figures.
 *
 * GMP (grey market premium) is unofficial. It is recorded with its source and
 * timestamp for display on cards only and is never used in any assessment.
 */
import type { Ipo, ListingPerformance } from "@/lib/types";
import { COMPILED_AT, liveKit } from "./kit";

type Kit = ReturnType<typeof liveKit>;

const RHP_TITLE = "Red Herring Prospectus";

function stdSources(k: Kit, name: string, cgUrl: string, reviewUrl: string | null, rhpUrl: string, rhpPublisher = "SEBI") {
  const cg = k.source("cg", {
    title: `${name} IPO: issue details and restated financials`,
    kind: "data_provider",
    publisher: "Chittorgarh.com",
    url: cgUrl,
    documentDate: null,
  });
  const pr = reviewUrl
    ? k.source("peers", {
        title: `${name} IPO review: peer comparison reproduced from RHP`,
        kind: "data_provider",
        publisher: "Chittorgarh.com",
        url: reviewUrl,
        documentDate: null,
      })
    : null;
  const rhp = k.source("rhp", {
    title: `${name}: ${RHP_TITLE}`,
    kind: rhpPublisher === "SEBI" ? "sebi_offer_document" : "company_filing",
    publisher: rhpPublisher,
    url: rhpUrl,
    documentDate: null,
  });
  return { cg, pr, rhp };
}

const GMP_URL = "https://www.investorgain.com/report/live-ipo-gmp/331/";
const GMP_AS_OF = "2026-10-25T13:37:00+05:30";

/** Grey market premium snapshot from Investorgain (unofficial; reference only). */
function gmp(k: Kit, value: number) {
  const src = k.source("gmp", {
    title: "Live IPO GMP report (unofficial grey-market quotes)",
    kind: "data_provider",
    publisher: "Investorgain",
    url: GMP_URL,
    documentDate: "2026-10-25",
  });
  return k.v(value, "INR", src, "GMP as of 25 Oct 2026, 1:37 pm IST", GMP_AS_OF);
}

function dates(k: Kit, src: string, open: string, close: string, allot: string, listing: string, listed = false) {
  return {
    open: k.v(open, "DATE", src, "IPO timeline"),
    close: k.v(close, "DATE", src, "IPO timeline"),
    allotment: k.v(allot, "DATE", src, "IPO timeline"),
    listing: k.v(listing, "DATE", src, listed ? "IPO timeline (listed)" : "IPO timeline (tentative)"),
  };
}

function listing(k: Kit, src: string, date: string, open: number, close: number): ListingPerformance {
  return {
    listingDate: k.v(date, "DATE", src, "Listing day trading information"),
    listingOpen: k.v(open, "INR", src, "Listing day trading information (NSE open)", date),
    listingClose: k.v(close, "INR", src, "Listing day trading information (NSE close)", date),
    history: { points: [], citation: null, status: "unavailable" },
    // 23 Oct 2026 was a Friday; it is the latest trading day before this dataset was compiled.
    latest: k.v(close, "INR", src, "NSE close on listing day (latest trading day before 25 Oct 2026)", date),
  };
}

const LOCKIN_NOTE = "Lock-in details are in the RHP's Capital Structure section and have not yet been summarised here.";

// ---------------------------------------------------------------------------

function jio(): Ipo {
  const slug = "jio-platforms";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "Jio Platforms",
    "https://www.chittorgarh.com/ipo/jio-platforms-ipo/3152/",
    "https://www.chittorgarh.com/ipo-recommendation/jio-platforms-ipo/3152/",
    "https://www.sebi.gov.in/filings/public-issues/oct-2026/jio-platforms-limited-rhp_105274.html",
  );
  const fp = k.source("5paisa", {
    title: "Jio Platforms IPO financials: FY26 revenue and profit",
    kind: "data_provider",
    publisher: "5paisa",
    url: "https://www.5paisa.com/index.php/blog/jio-platforms-fy26-financials-revenue-profit",
    documentDate: null,
  });
  return {
    id: "live-jio-platforms",
    slug,
    dataMode: "live",
    company: {
      name: "Jio Platforms Ltd",
      tagline: "Reliance's digital and telecom arm: mobile and fibre connectivity, apps, enterprise, cloud and AI services.",
      sector: "Telecom & digital services",
      incorporated: "2019",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-21", "2026-10-23", "2026-10-26", "2026-10-28"),
    priceBand: { low: k.v(1065, "INR", cg, "Price band"), high: k.v(1119, "INR", cg, "Price band") },
    faceValue: k.v(10, "INR", cg, "Issue details"),
    lotSize: k.v(12, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(30213, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(30213, "INR_CRORE", cg, "Issue details"),
      ofs: k.v(0, "INR_CRORE", cg, "Issue details (entirely fresh issue)"),
    },
    postIssueShares: k.v(9209030830, "SHARES", cg, "Share holding post issue"),
    promoterHolding: {
      pre: k.v(66.43, "PERCENT", cg, "Promoter holding"),
      post: k.v(64.48, "PERCENT", cg, "Promoter holding"),
    },
    proceedsUse: [
      { label: "Prepay borrowings of Reliance Jio Infocomm", amount: k.v(27500, "INR_CRORE", cg, "Objects of the issue"), explanation: "Most of the money repays debt in the main operating subsidiary, which reduces interest costs." },
      { label: "General corporate purposes", amount: k.na("INR_CRORE"), explanation: "Amount not stated in the source we used." },
    ],
    ofsSellers: [],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("Jio Platforms operates digital connectivity, consumer applications, enterprise solutions, cloud services, IoT and AI, with pan-India 4G/5G and fibre networks.", cg, "About the company"),
      products: [
        k.c("Mobile connectivity (4G/5G) through its subsidiary Reliance Jio", cg, "About the company"),
        k.c("Fixed-line fibre broadband", cg, "About the company"),
        k.c("Consumer apps, enterprise solutions, cloud, IoT and AI services", cg, "About the company"),
      ],
      customers: k.c("Its subsidiary Reliance Jio served 533.3 million customers as of 30 June 2026.", cg, "About the company"),
      revenueModel: null,
      growthDrivers: [],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income. A separate source reports FY2026 revenue from operations of ₹1,46,885.3 crore.",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 110175.4, pat: 21434.0, nw: 277866.1, debt: 54348.9 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 129333.0, pat: 26120.3, nw: 304022.4, debt: 73060.3 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 149759.1, pat: 30052.7, nw: 334013.4, debt: 70781.0, ocf: 77556.3, eps: 33.59 }, { ocfSource: fp, epsSource: pr! }),
      ],
    },
    peers: [k.peer("Bharti Airtel Ltd", 40.71, pr!, "the RHP's reference date"), k.peer("Vodafone Idea Ltd", 3.99, pr!, "the RHP's reference date")],
    risks: [
      { id: "r1", category: "debt_cashflow", title: "Large borrowings, though falling", summary: "Total borrowings were ₹70,781 crore at 31 March 2026, down from ₹73,060 crore a year earlier. The IPO is mainly being used to prepay ₹27,500 crore of debt.", whyItMatters: "Debt carries interest costs. Repaying it can lift future profit, but the remaining debt is still large in absolute terms.", severity: "caution", citation: k.cite(cg, "Financial information; Objects of the issue") },
      { id: "r2", category: "promoter_ofs", title: "Controlled by a single promoter", summary: "Reliance Industries will hold 64.48% after the IPO.", whyItMatters: "Minority shareholders have limited say; group-level decisions (pricing, related-party dealings) can affect the company.", severity: "caution", citation: k.cite(cg, "Promoter holding") },
    ],
    bullCase: [
      k.c("Total income grew from ₹1,10,175 crore (FY2024) to ₹1,49,759 crore (FY2026).", cg, "Financial information (restated)"),
      k.c("Profit after tax rose from ₹21,434 crore to ₹30,053 crore over the same period.", cg, "Financial information (restated)"),
      k.c("The entire issue is fresh capital; the main use is repaying debt.", cg, "Issue details; Objects of the issue"),
      k.c("Operating cash flow of ₹77,556 crore in FY2026, well above profit.", fp),
    ],
    bearCase: [
      k.c("Post-issue market capitalisation at the upper band is about ₹10.3 lakh crore, a very large valuation to grow into.", cg, "KPIs: market capitalisation"),
      k.c("Only two listed telecom peers are available for comparison, and one of them (Vodafone Idea) shows a negative net asset value per share in the RHP table.", pr!, "Peer comparison"),
      k.c("Borrowings were still ₹70,781 crore at FY2026.", cg, "Financial information (restated)"),
    ],
    listing: null,
    gmp: gmp(k, 250),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function paras(): Ipo {
  const slug = "paras-healthcare";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "Paras Healthcare",
    "https://www.chittorgarh.com/ipo/paras-healthcare-ipo/2256/",
    "https://www.chittorgarh.com/ipo-recommendation/paras-healthcare-ipo/2256/",
    "https://www.sebi.gov.in/filings/public-issues/oct-2026/paras-healthcare-limited-rhp_105284.html",
  );
  const asOf = "BSE close on 5 Oct 2026";
  return {
    id: "live-paras-healthcare",
    slug,
    dataMode: "live",
    company: {
      name: "Paras Healthcare Ltd",
      tagline: "Hospital chain in North India, Bihar and Jharkhand focused on cardiac, cancer, neuro and kidney care; recently turned profitable.",
      sector: "Healthcare services",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-21", "2026-10-23", "2026-10-26", "2026-10-28"),
    priceBand: { low: k.v(660, "INR", cg, "Price band"), high: k.v(693, "INR", cg, "Price band") },
    faceValue: k.v(1, "INR", cg, "Issue details"),
    lotSize: k.v(21, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(1450, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(500, "INR_CRORE", cg, "Issue details"),
      ofs: k.v(950, "INR_CRORE", cg, "Issue details"),
    },
    postIssueShares: k.v(108201194, "SHARES", cg, "Share holding post issue"),
    promoterHolding: { pre: k.v(72.8, "PERCENT", cg, "Promoter holding"), post: k.na("PERCENT") },
    proceedsUse: [
      { label: "Repay borrowings", amount: k.v(320.9, "INR_CRORE", cg, "Objects of the issue"), explanation: "Reduces debt and interest costs." },
      { label: "Investment in subsidiary (PMHPL)", amount: k.v(54.1, "INR_CRORE", cg, "Objects of the issue"), explanation: "Money passed to a subsidiary hospital company." },
      { label: "General corporate purposes", amount: k.na("INR_CRORE"), explanation: "Amount not stated in the source we used." },
    ],
    ofsSellers: [
      { name: "Dharminder Kumar Nagar", type: "Promoter", amount: k.v(300, "INR_CRORE", cg, "Selling shareholders") },
      { name: "Commelina Ltd", type: "Investor", amount: k.v(650, "INR_CRORE", cg, "Selling shareholders") },
    ],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("Paras Healthcare runs specialty hospitals providing advanced (tertiary and quaternary) care across North India, Bihar and Jharkhand: 8 hospitals with 2,211 beds as of 30 June 2026.", cg, "About the company"),
      products: [k.c("Cardiac sciences, oncology, neurosciences and renal sciences together contributed 75.30% of revenue in FY2026.", cg, "About the company")],
      customers: null,
      revenueModel: null,
      growthDrivers: [],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income. Borrowings by year were not given in the source we used.",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 1151.02, pat: -15.33, nw: 338.51, debt: null }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 1314.21, pat: -57.98, nw: 280.49, debt: null }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 1628.78, pat: 43.83, nw: 394.94, debt: null, eps: 4.34 }, { epsSource: pr! }),
      ],
    },
    peers: [
      k.peer("Aster DM Healthcare Ltd", 91.89, pr!, asOf),
      k.peer("Apollo Hospitals Enterprise Ltd", 59.36, pr!, asOf),
      k.peer("Fortis Healthcare Ltd", 55.43, pr!, asOf),
      k.peer("Global Health Ltd", 64.46, pr!, asOf),
      k.peer("Jupiter Life Line Hospitals Ltd", 42.92, pr!, asOf),
      k.peer("Krishna Institute of Medical Sciences Ltd", 116.41, pr!, asOf),
      k.peer("Manipal Health Enterprises Ltd", 87.0, pr!, asOf),
      k.peer("Max Healthcare Institute Ltd", 62.1, pr!, asOf),
      k.peer("Narayana Hrudayalaya Ltd", 43.41, pr!, asOf),
      k.peer("Yatharth Hospital & Trauma Care Services Ltd", 55.16, pr!, asOf),
    ],
    risks: [
      { id: "r1", category: "debt_cashflow", title: "Losses until recently", summary: "The company lost ₹15.33 crore in FY2024 and ₹57.98 crore in FY2025 before earning ₹43.83 crore in FY2026.", whyItMatters: "One profitable year is a short track record. A P/E built on a small, newly positive profit can look very high.", severity: "material", citation: k.cite(cg, "Financial information (restated)") },
      { id: "r2", category: "promoter_ofs", title: "About two-thirds of the issue is an offer for sale", summary: "₹950 crore of the ₹1,450 crore issue goes to selling shareholders, including ₹300 crore to the promoter.", whyItMatters: "That money doesn't go into the hospitals; the sellers are cashing out.", severity: "caution", citation: k.cite(cg, "Issue details; Selling shareholders") },
      { id: "r3", category: "debt_cashflow", title: "Most fresh money repays debt", summary: "₹320.90 crore of the fresh issue is earmarked to repay borrowings.", whyItMatters: "Lower debt helps, but it also means little of the IPO money funds new growth.", severity: "caution", citation: k.cite(cg, "Objects of the issue") },
    ],
    bullCase: [
      k.c("Total income grew from ₹1,151 crore (FY2024) to ₹1,629 crore (FY2026).", cg, "Financial information (restated)"),
      k.c("Turned profitable in FY2026 after two loss-making years.", cg, "Financial information (restated)"),
      k.c("Fresh-issue money reduces borrowings.", cg, "Objects of the issue"),
    ],
    bearCase: [
      k.c("Loss-making in FY2024 and FY2025; only one profitable year.", cg, "Financial information (restated)"),
      k.c("About 66% of the issue is an offer for sale.", cg, "Issue details"),
      k.c("At the upper band, P/E on FY2026 EPS is far above the listed hospital peers named in the RHP.", pr!, "Peer comparison"),
    ],
    listing: null,
    gmp: gmp(k, 12),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function tonbo(): Ipo {
  const slug = "tonbo-imaging-india";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "Tonbo Imaging India",
    "https://www.chittorgarh.com/ipo/tonbo-imaging-india-ipo/3215/",
    "https://www.chittorgarh.com/ipo-recommendation/tonbo-imaging-india-ipo/3215/",
    "https://www.sebi.gov.in/filings/public-issues/oct-2026/tonbo-imaging-india-limited-rhp_105141.html",
  );
  const asOf = "BSE close on 7 Oct 2026";
  return {
    id: "live-tonbo-imaging-india",
    slug,
    dataMode: "live",
    company: {
      name: "Tonbo Imaging India Ltd",
      tagline: "Defence electronics maker of thermal imaging, night vision and surveillance systems; the IPO was entirely an offer for sale.",
      sector: "Defence electronics",
      incorporated: "2003",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-15", "2026-10-19", "2026-10-21", "2026-10-23", true),
    priceBand: { low: k.v(665, "INR", cg, "Price band"), high: k.v(700, "INR", cg, "Price band; final issue price ₹700") },
    faceValue: k.v(2, "INR", cg, "Issue details"),
    lotSize: k.v(21, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(852.09, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(0, "INR_CRORE", cg, "Issue details (100% offer for sale)"),
      ofs: k.v(852.09, "INR_CRORE", cg, "Issue details"),
    },
    postIssueShares: k.v(57282100, "SHARES", cg, "Share holding post issue"),
    promoterHolding: { pre: k.v(18.58, "PERCENT", cg, "Promoter holding"), post: k.v(14.56, "PERCENT", cg, "Promoter holding") },
    proceedsUse: [],
    ofsSellers: [],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("Tonbo designs, develops and manufactures electro-optic and infrared (EO/IR) imaging, embedded vision, communication, guidance and surveillance systems for defence and security customers.", cg, "About the company"),
      products: [k.c("Thermal and night-vision imaging, embedded vision, guidance and surveillance systems", cg, "About the company")],
      customers: k.c("More than 28,000 systems deployed across 24 countries.", cg, "Key strengths"),
      revenueModel: null,
      growthDrivers: [k.c("Approved supplier under 'Make in India', with export capability free of US ITAR restrictions.", cg, "Key strengths")],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income. The source also reports a loss of ₹17.74 crore for the quarter to 30 June 2026 (not included in the yearly figures).",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 431.9, pat: 68.54, nw: 230.13, debt: 96.36 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 474.39, pat: 72.76, nw: 490.14, debt: 78.14 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 369.94, pat: 50.88, nw: 553.16, debt: 116.06, eps: 8.88 }, { epsSource: pr! }),
      ],
    },
    peers: [
      k.peer("Paras Defence and Space Technologies Ltd", 117.88, pr!, asOf),
      k.peer("Data Patterns (India) Ltd", 87.29, pr!, asOf),
      k.peer("Astra Microwave Products Ltd", 83.92, pr!, asOf),
      k.peer("Zen Technologies Ltd", 73.44, pr!, asOf),
      k.peer("Bharat Electronics Ltd", 45.7, pr!, asOf),
    ],
    risks: [
      { id: "r1", category: "dependence", title: "Revenue and profit fell in FY2026", summary: "Total income fell from ₹474.39 crore (FY2025) to ₹369.94 crore (FY2026), and profit from ₹72.76 crore to ₹50.88 crore.", whyItMatters: "Defence orders can be lumpy; a down year shows revenue isn't guaranteed to grow steadily.", severity: "material", citation: k.cite(cg, "Financial information (restated)") },
      { id: "r2", category: "debt_cashflow", title: "Loss in the June 2026 quarter", summary: "A loss of ₹17.74 crore on total income of ₹37.32 crore in the three months to 30 June 2026.", whyItMatters: "The most recent period before listing was loss-making, which the full-year P/E doesn't capture.", severity: "material", citation: k.cite(cg, "Financial information (restated): 30 Jun 2026") },
      { id: "r3", category: "promoter_ofs", title: "100% offer for sale; low promoter stake", summary: "The company received no money from the IPO. Promoter holding fell from 18.58% to 14.56%.", whyItMatters: "Founders with a small stake have less financial alignment with other shareholders.", severity: "caution", citation: k.cite(cg, "Issue details; Promoter holding") },
    ],
    bullCase: [
      k.c("Profitable in each of FY2024–FY2026.", cg, "Financial information (restated)"),
      k.c("At the issue price, P/E on FY2026 diluted EPS (about 78.8x) was below the median of the defence peers named in the RHP (83.9x), though above Bharat Electronics (45.7x).", pr!, "Peer comparison"),
      k.c("Systems deployed in 24 countries.", cg, "Key strengths"),
    ],
    bearCase: [
      k.c("FY2026 total income was about 22% lower than FY2025.", cg, "Financial information (restated)"),
      k.c("Loss-making in the June 2026 quarter.", cg, "Financial information (restated): 30 Jun 2026"),
      k.c("The company received none of the IPO money (100% offer for sale).", cg, "Issue details"),
    ],
    listing: listing(k, cg, "2026-10-23", 1160, 1133.8),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function smt(): Ipo {
  const slug = "sahajanand-medical-technologies";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "Sahajanand Medical Technologies",
    "https://www.chittorgarh.com/ipo/sahajanand-medical-technologies-ipo/2550/",
    "https://www.chittorgarh.com/ipo-recommendation/sahajanand-medical-technologies-ipo/2550/",
    "https://www.sebi.gov.in/filings/public-issues/oct-2026/sahajanand-medical-technologies-limited-rhp_105149.html",
  );
  const asOf = "BSE close on 6 Oct 2026";
  return {
    id: "live-sahajanand-medical-technologies",
    slug,
    dataMode: "live",
    company: {
      name: "Sahajanand Medical Technologies Ltd",
      tagline: "Maker of coronary stents, balloons and heart-valve (TAVI) devices sold in 77 countries; the IPO was entirely an offer for sale.",
      sector: "Medical devices",
      incorporated: "2001",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-15", "2026-10-19", "2026-10-21", "2026-10-23", true),
    priceBand: { low: k.v(327, "INR", cg, "Price band"), high: k.v(344, "INR", cg, "Price band; final issue price ₹344") },
    faceValue: k.v(1, "INR", cg, "Issue details"),
    lotSize: k.v(43, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(475.48, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(0, "INR_CRORE", cg, "Issue details (100% offer for sale)"),
      ofs: k.v(475.48, "INR_CRORE", cg, "Issue details"),
    },
    postIssueShares: k.na("SHARES"),
    promoterHolding: { pre: k.v(40.82, "PERCENT", cg, "Shareholding structure"), post: k.v(36.2, "PERCENT", cg, "Shareholding structure") },
    proceedsUse: [],
    ofsSellers: [
      { name: "Shree Hari Trust", type: "Promoter group", amount: k.na("INR_CRORE") },
      { name: "Dhirajkumar Savjibhai Vasoya", type: "Other", amount: k.na("INR_CRORE") },
      { name: "Samara Capital Markets Holding Ltd", type: "Investor", amount: k.na("INR_CRORE") },
      { name: "Kotak Pre-IPO Opportunities Fund", type: "Investor", amount: k.na("INR_CRORE") },
      { name: "NHPEA Sparkle Holding BV", type: "Investor", amount: k.na("INR_CRORE") },
    ],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("Sahajanand Medical Technologies makes devices for treating blocked arteries and heart-valve disease, including coronary stents, balloons and TAVI (transcatheter heart valve) devices.", cg, "About the company"),
      products: [k.c("Coronary stents and balloons", cg, "About the company"), k.c("Structural heart devices including TAVI", cg, "About the company")],
      customers: k.c("Products were marketed in 77 countries in FY2026 through direct, hybrid and distributor-led models.", cg, "About the company"),
      revenueModel: null,
      growthDrivers: [],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income.",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 908.59, pat: -7.35, nw: 526.3, debt: 175.27 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 1035.96, pat: 25.15, nw: 545.23, debt: 224.96 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 1218.73, pat: 69.08, nw: 616.05, debt: 269.53, eps: 6.48 }, { epsSource: pr! }),
      ],
    },
    peers: [k.peer("Poly Medicure Ltd", 51.4, pr!, asOf), k.peer("Laxmi Dental Ltd", 36.35, pr!, asOf)],
    risks: [
      { id: "r1", category: "debt_cashflow", title: "Borrowings rising every year", summary: "Total borrowings rose from ₹175.27 crore (FY2024) to ₹269.53 crore (FY2026).", whyItMatters: "No IPO money goes to the company, so the IPO doesn't reduce this debt.", severity: "caution", citation: k.cite(cg, "Financial information (restated)") },
      { id: "r2", category: "promoter_ofs", title: "100% offer for sale", summary: "All ₹475.48 crore went to selling shareholders, including a promoter-group trust and private-equity investors.", whyItMatters: "The company received no new capital from the IPO.", severity: "caution", citation: k.cite(cg, "Issue details; Selling shareholders") },
      { id: "r3", category: "debt_cashflow", title: "Short profit history", summary: "Loss of ₹7.35 crore in FY2024, then profits of ₹25.15 crore and ₹69.08 crore.", whyItMatters: "Profit margins are still thin (about 5.7% in FY2026), leaving little buffer.", severity: "caution", citation: k.cite(cg, "Financial information (restated)") },
    ],
    bullCase: [
      k.c("Total income grew from ₹909 crore (FY2024) to ₹1,219 crore (FY2026).", cg, "Financial information (restated)"),
      k.c("Profit rose from a loss in FY2024 to ₹69.08 crore in FY2026.", cg, "Financial information (restated)"),
      k.c("Sells in 77 countries.", cg, "About the company"),
    ],
    bearCase: [
      k.c("The company received none of the IPO money (100% offer for sale).", cg, "Issue details"),
      k.c("Borrowings increased each year from FY2024 to FY2026.", cg, "Financial information (restated)"),
      k.c("Only two listed peers are named for comparison.", pr!, "Peer comparison"),
    ],
    listing: listing(k, cg, "2026-10-23", 371.15, 377.65),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function zetwerk(): Ipo {
  const slug = "zetwerk";
  const k = liveKit(slug);
  const { cg, rhp } = stdSources(
    k,
    "Zetwerk Manufacturing Businesses",
    "https://www.chittorgarh.com/ipo/zetwerk-ipo/3091/",
    null,
    "https://www.sebi.gov.in/filings/public-issues/oct-2026/zetwerk-manufacturing-businesses-limited-rhp_105195.html",
  );
  return {
    id: "live-zetwerk",
    slug,
    dataMode: "live",
    company: {
      name: "Zetwerk Manufacturing Businesses Ltd",
      tagline: "Tech-led contract-manufacturing marketplace linking enterprises with a network of factories; loss-making.",
      sector: "Manufacturing platform",
      incorporated: "2017",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-15", "2026-10-19", "2026-10-21", "2026-10-23", true),
    priceBand: { low: k.v(143, "INR", cg, "Price band"), high: k.v(151, "INR", cg, "Price band; final issue price ₹151") },
    faceValue: k.v(1, "INR", cg, "Issue details"),
    lotSize: k.v(99, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(5012.33, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(2830.43, "INR_CRORE", cg, "Issue details"),
      ofs: k.v(2181.9, "INR_CRORE", cg, "Issue details"),
    },
    postIssueShares: k.v(1694300000, "SHARES", cg, "Share holding post issue (169.43 crore, rounded in source)"),
    promoterHolding: { pre: k.v(21.08, "PERCENT", cg, "Shareholding"), post: k.v(15.71, "PERCENT", cg, "Shareholding") },
    proceedsUse: [
      { label: "Repay debt", amount: k.v(1300, "INR_CRORE", cg, "Objects of the issue"), explanation: "Reduces borrowings and interest costs." },
      { label: "Investment in subsidiaries", amount: k.v(860, "INR_CRORE", cg, "Objects of the issue"), explanation: "Money passed to operating subsidiaries." },
      { label: "Acquisitions (inorganic growth)", amount: k.v(533.84, "INR_CRORE", cg, "Objects of the issue"), explanation: "Earmarked for buying other businesses; targets are typically not named in advance." },
    ],
    ofsSellers: [],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("Zetwerk is a managed marketplace connecting industrial and consumer companies with a global network of manufacturing partners for custom and large-scale production.", cg, "About the company"),
      products: [k.c("Custom and large-scale manufacturing delivered through partner factories, managed via its Zetwerk OS software", cg, "About the company")],
      customers: k.c("More than 1,100 customers across 25+ countries, served through 10,000+ suppliers.", cg, "About the company"),
      revenueModel: null,
      growthDrivers: [],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income. EPS is calculated by IPO Simplified from FY2026 profit and pre-issue shares (150.67 crore).",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 12523.46, pat: -917.95, nw: 4062.46, debt: 1232.1 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 11492.23, pat: -370.71, nw: 4453.76, debt: 1746.55 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 16100.63, pat: -1606.17, nw: 4813.72, debt: 1936.16, eps: -10.66 }, { epsLocator: "Calculated: FY2026 PAT ÷ pre-issue shares (both from source)" }),
      ],
    },
    peers: [],
    risks: [
      { id: "r1", category: "debt_cashflow", title: "Loss-making in every year shown", summary: "Losses of ₹917.95 crore (FY2024), ₹370.71 crore (FY2025) and ₹1,606.17 crore (FY2026), plus ₹732.98 crore in the June 2026 quarter.", whyItMatters: "Losses widened in the latest year even as revenue grew, so it's unclear when the business will turn profitable.", severity: "material", citation: k.cite(cg, "Financial information (restated)") },
      { id: "r2", category: "debt_cashflow", title: "Borrowings rising", summary: "Borrowings rose from ₹1,232 crore (FY2024) to ₹1,936 crore (FY2026). ₹1,300 crore of fresh money goes to debt repayment.", whyItMatters: "A loss-making company with growing debt depends on outside funding.", severity: "material", citation: k.cite(cg, "Financial information; Objects of the issue") },
      { id: "r3", category: "promoter_ofs", title: "Large offer for sale; small founder stake", summary: "₹2,181.90 crore (44%) of the issue was an offer for sale. Promoter holding fell from 21.08% to 15.71%.", whyItMatters: "Existing investors cashed out a large amount, and founders own a relatively small share.", severity: "caution", citation: k.cite(cg, "Issue details; Shareholding") },
    ],
    bullCase: [
      k.c("Total income rose to ₹16,101 crore in FY2026 from ₹11,492 crore in FY2025.", cg, "Financial information (restated)"),
      k.c("More than half of the issue (₹2,830 crore) was fresh capital for the company.", cg, "Issue details"),
      k.c("Serves 1,100+ customers in 25+ countries.", cg, "About the company"),
    ],
    bearCase: [
      k.c("Losses in every year shown, widening to ₹1,606 crore in FY2026.", cg, "Financial information (restated)"),
      k.c("P/E is not meaningful because the company makes losses; valuation can't be compared on earnings.", cg, "KPIs"),
      k.c("Listed on 23 Oct 2026 and closed the day 8.44% below the issue price.", cg, "Listing day trading information"),
    ],
    listing: listing(k, cg, "2026-10-23", 159.25, 138.25),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function eaaa(): Ipo {
  const slug = "eaaa-india-alternatives";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "EAAA India Alternatives",
    "https://www.chittorgarh.com/ipo/eaaa-india-alternatives-ipo/2061/",
    "https://www.chittorgarh.com/ipo-recommendation/eaaa-india-alternatives-ipo/2061/",
    "https://www.eaaa.in/wp-content/uploads/2026/09/Red-Herring-Prospectus.pdf",
    "EAAA India Alternatives (company website)",
  );
  const asOf = "NSE close on 8 Oct 2026";
  return {
    id: "live-eaaa-india-alternatives",
    slug,
    dataMode: "live",
    company: {
      name: "EAAA India Alternatives Ltd",
      tagline: "Edelweiss group's alternative-investment manager for infrastructure, real estate and private-credit funds; the IPO is entirely an offer for sale.",
      sector: "Asset management",
      incorporated: "2008",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-26", "2026-10-28", "2026-10-29", "2026-11-02"),
    priceBand: { low: k.v(1585, "INR", cg, "Price band"), high: k.v(1665, "INR", cg, "Price band") },
    faceValue: k.v(5, "INR", cg, "Issue details"),
    lotSize: k.v(9, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(1200, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(0, "INR_CRORE", cg, "Issue details (100% offer for sale)"),
      ofs: k.v(1200, "INR_CRORE", cg, "Issue details"),
    },
    postIssueShares: k.v(64655246, "SHARES", cg, "Share holding post issue"),
    promoterHolding: { pre: k.v(95.03, "PERCENT", cg, "Shareholding"), post: k.v(83.88, "PERCENT", cg, "Shareholding") },
    proceedsUse: [],
    ofsSellers: [{ name: "Edelweiss Securities & Investments Pvt Ltd", type: "Promoter", amount: k.v(1200, "INR_CRORE", cg, "Selling shareholder") }],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("EAAA is an alternative investment manager focused on India's real assets (infrastructure, commercial real estate) and private credit, managing funds for institutional investors and wealthy individuals.", cg, "About the company"),
      products: [
        k.c("10 active Real Assets funds, including two Infrastructure Investment Trusts (InvITs)", cg, "About the company"),
        k.c("16 active Private Credit funds", cg, "About the company"),
      ],
      customers: k.c("Assets under management of about ₹95,345 crore as of 30 June 2026.", cg, "About the company"),
      revenueModel: null,
      growthDrivers: [],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income. The RHP peer table shows EAAA's EPS on a standalone basis.",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 584.25, pat: 175.16, nw: 729.48, debt: 444.83 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 786.54, pat: 229.78, nw: 966.45, debt: 507.49 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 963.76, pat: 265.2, nw: 1075.54, debt: 441.03, eps: 40.36 }, { epsSource: pr!, epsLocator: "Peer comparison (from RHP): diluted EPS, standalone" }),
      ],
    },
    peers: [
      k.peer("360 One WAM Ltd", 35.67, pr!, asOf),
      k.peer("Aditya Birla Sun Life AMC Ltd", 29.84, pr!, asOf),
      k.peer("Anand Rathi Wealth Ltd", 90.69, pr!, asOf),
      k.peer("HDFC Asset Management Co Ltd", 33.76, pr!, asOf),
      k.peer("Gaja Alternative Asset Management Ltd", 16.47, pr!, asOf),
      k.peer("Nippon Life India Asset Management Ltd", 43.99, pr!, asOf),
      k.peer("Nuvama Wealth Management Ltd", 30.99, pr!, asOf),
      k.peer("UTI Asset Management Co Ltd", 27.93, pr!, asOf),
      k.peer("ICICI Prudential Asset Management Co Ltd", 45.95, pr!, asOf),
    ],
    risks: [
      { id: "r1", category: "promoter_ofs", title: "100% offer for sale by the promoter group", summary: "Edelweiss Securities & Investments sells ₹1,200 crore of shares; promoter holding falls from 95.03% to 83.88%.", whyItMatters: "The company receives no money. The promoter group remains firmly in control.", severity: "caution", citation: k.cite(cg, "Issue details; Shareholding") },
      { id: "r2", category: "debt_cashflow", title: "Borrowings on the balance sheet", summary: "Borrowings were ₹441.03 crore at 31 March 2026.", whyItMatters: "Asset managers usually carry little debt; it's worth understanding why this one does.", severity: "caution", citation: k.cite(cg, "Financial information (restated)") },
    ],
    bullCase: [
      k.c("Total income grew from ₹584 crore (FY2024) to ₹964 crore (FY2026).", cg, "Financial information (restated)"),
      k.c("Profit after tax rose from ₹175 crore to ₹265 crore over the same period.", cg, "Financial information (restated)"),
      k.c("High profitability relative to income: FY2026 profit was over 27% of total income.", cg, "Financial information (restated)"),
    ],
    bearCase: [
      k.c("No money goes to the company; the promoter group is selling.", cg, "Issue details"),
      k.c("Peers in the RHP are mostly mutual-fund and wealth managers whose businesses differ from alternative-asset management.", pr!, "Peer comparison"),
    ],
    listing: null,
    gmp: gmp(k, 36),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function sfc(): Ipo {
  const slug = "sfc-environmental-technologies";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "SFC Environmental Technologies",
    "https://www.chittorgarh.com/ipo/sfc-environmental-technologies-ipo/2070/",
    "https://www.chittorgarh.com/ipo-recommendation/sfc-environmental-technologies-ipo/2070/",
    "https://sfcenvironment.com/wp-content/uploads/2026/10/SFC-Environmental-Technologies-Ltd_RHP-1.pdf",
    "SFC Environmental Technologies (company website)",
  );
  const asOf = "BSE close on 16 Oct 2026";
  return {
    id: "live-sfc-environmental-technologies",
    slug,
    dataMode: "live",
    company: {
      name: "SFC Environmental Technologies Ltd",
      tagline: "Wastewater-treatment and waste-management technology company with 728 installations across 23 states.",
      sector: "Environmental engineering",
      incorporated: "2005",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-27", "2026-10-29", "2026-10-30", "2026-11-03"),
    priceBand: { low: k.v(313, "INR", cg, "Price band"), high: k.v(330, "INR", cg, "Price band") },
    faceValue: k.v(2, "INR", cg, "Issue details"),
    lotSize: k.v(45, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(667.53, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(150, "INR_CRORE", cg, "Issue details"),
      ofs: k.v(517.53, "INR_CRORE", cg, "Issue details"),
    },
    postIssueShares: k.v(97956724, "SHARES", cg, "Share holding post issue"),
    promoterHolding: { pre: k.v(48.18, "PERCENT", cg, "Shareholding"), post: k.v(41.18, "PERCENT", cg, "Shareholding") },
    proceedsUse: [
      { label: "Prepay debt", amount: k.v(42.23, "INR_CRORE", cg, "Objects of the issue"), explanation: "Reduces borrowings." },
      { label: "Working capital", amount: k.v(74.92, "INR_CRORE", cg, "Objects of the issue"), explanation: "Funds the cash tied up in ongoing projects." },
      { label: "General corporate purposes", amount: k.na("INR_CRORE"), explanation: "Amount not stated in the source we used." },
    ],
    ofsSellers: [],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("SFC builds and supplies technology for wastewater treatment, recycling and reuse, and solid-waste management, using its proprietary C-Tech (advanced SBR) and OREX technologies.", cg, "About the company"),
      products: [
        k.c("Wastewater treatment plants: 728 installations commissioned, treating 17,511 million litres a day (as of 31 July 2026)", cg, "About the company"),
        k.c("Solid-waste management technology (OREX)", cg, "About the company"),
      ],
      customers: k.c("Repeat customers contributed 91.98% of revenue, per the company's stated strengths.", cg, "Key strengths"),
      revenueModel: null,
      growthDrivers: [k.c("Claims over 80% share of the SBR wastewater-treatment market in India.", cg, "Key strengths")],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income. The source also reports profit of only ₹1.48 crore for the quarter to 30 June 2026.",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 676.74, pat: 144.17, nw: 534.3, debt: 139.16 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 726.96, pat: 152.01, nw: 648.68, debt: 83.71 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 821.27, pat: 160.21, nw: 804.17, debt: 195.64, eps: 16.52 }, { epsSource: pr! }),
      ],
    },
    peers: [k.peer("Thermax Ltd", 52.01, pr!, asOf), k.peer("Praj Industries Ltd", 220.77, pr!, asOf), k.peer("Ion Exchange (India) Ltd", 31.34, pr!, asOf)],
    risks: [
      { id: "r1", category: "dependence", title: "Very weak June 2026 quarter", summary: "Profit of ₹1.48 crore on total income of ₹137.90 crore in the three months to 30 June 2026, against ₹160.21 crore profit for FY2026.", whyItMatters: "Project businesses can be seasonal or lumpy. Check the RHP for the reason before relying on full-year figures.", severity: "material", citation: k.cite(cg, "Financial information (restated): 30 Jun 2026") },
      { id: "r2", category: "promoter_ofs", title: "Most of the issue is an offer for sale", summary: "₹517.53 crore of the ₹667.53 crore issue (78%) goes to selling shareholders.", whyItMatters: "Only ₹150 crore reaches the company.", severity: "caution", citation: k.cite(cg, "Issue details") },
      { id: "r3", category: "debt_cashflow", title: "Borrowings more than doubled in FY2026", summary: "From ₹83.71 crore (FY2025) to ₹195.64 crore (FY2026).", whyItMatters: "Rising debt in a profitable company can signal cash tied up in projects.", severity: "caution", citation: k.cite(cg, "Financial information (restated)") },
    ],
    bullCase: [
      k.c("Profitable in all three years, with profit rising from ₹144 crore to ₹160 crore.", cg, "Financial information (restated)"),
      k.c("Profit was about 20% of total income in FY2026.", cg, "Financial information (restated)"),
      k.c("At the upper band, P/E on FY2026 diluted EPS is below all three peers named in the RHP.", pr!, "Peer comparison"),
    ],
    bearCase: [
      k.c("About 78% of the issue is an offer for sale.", cg, "Issue details"),
      k.c("Profit fell to ₹1.48 crore in the June 2026 quarter.", cg, "Financial information (restated): 30 Jun 2026"),
      k.c("Total income growth was modest: about 7% (FY2025) and 13% (FY2026).", cg, "Financial information (restated)"),
    ],
    listing: null,
    gmp: gmp(k, 32),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

// ---------------------------------------------------------------------------

function bls(): Ipo {
  const slug = "bls-polymers";
  const k = liveKit(slug);
  const { cg, pr, rhp } = stdSources(
    k,
    "BLS Polymers",
    "https://www.chittorgarh.com/ipo/bls-polymers-ipo/2559/",
    "https://www.chittorgarh.com/ipo-recommendation/bls-polymers-ipo/2559/",
    "https://www.sebi.gov.in/filings/public-issues/oct-2026/bls-polymers-limited-rhp_105327.html",
  );
  const asOf = "NSE close on 12 Oct 2026";
  return {
    id: "live-bls-polymers",
    slug,
    dataMode: "live",
    company: {
      name: "BLS Polymers Ltd",
      tagline: "Goa-based maker of specialised polymer compounds for wires, cables and pipelines; the entire issue is fresh capital.",
      sector: "Specialty polymers",
    },
    exchanges: ["NSE", "BSE"],
    board: "Mainboard",
    issueMethod: "Book built",
    coverage: "partial",
    dates: dates(k, cg, "2026-10-27", "2026-10-29", "2026-10-30", "2026-11-03"),
    priceBand: { low: k.v(142, "INR", cg, "Price band"), high: k.v(150, "INR", cg, "Price band") },
    faceValue: k.v(10, "INR", cg, "Issue details"),
    lotSize: k.v(100, "SHARES", cg, "Lot size"),
    issueSize: {
      total: k.v(255, "INR_CRORE", cg, "Issue details"),
      fresh: k.v(255, "INR_CRORE", cg, "Issue details (fresh issue only)"),
      ofs: k.v(0, "INR_CRORE", cg, "Issue details (fresh issue only)"),
    },
    postIssueShares: k.v(62031834, "SHARES", cg, "Share holding post issue"),
    promoterHolding: { pre: k.v(98.53, "PERCENT", cg, "Shareholding"), post: k.v(71.53, "PERCENT", cg, "Shareholding") },
    proceedsUse: [
      { label: "Expand manufacturing facility", amount: k.v(77.56, "INR_CRORE", cg, "Objects of the issue"), explanation: "Adds production capacity." },
      { label: "Working capital", amount: k.v(89.5, "INR_CRORE", cg, "Objects of the issue"), explanation: "Funds inventory and customer credit." },
      { label: "General corporate purposes", amount: k.na("INR_CRORE"), explanation: "Amount not stated in the source we used." },
    ],
    ofsSellers: [],
    lockIns: [{ description: LOCKIN_NOTE, citation: null, status: "unavailable" }],
    documents: [{ type: "RHP", sourceId: rhp }],
    business: {
      whatItDoes: k.c("BLS Polymers manufactures specialised polymer compounds used in wires, cables and underground pipelines.", cg, "About the company"),
      products: [k.c("Polymer compounds for wire and cable insulation and for pipelines, made at a 24,220 sq. metre facility in Goa with 11 machines", cg, "About the company")],
      customers: k.c("More than 190 customers; exports to Bangladesh, Egypt, Saudi Arabia, UAE, USA and Zambia.", cg, "About the company"),
      revenueModel: null,
      growthDrivers: [k.c("IPO money funds expansion of the manufacturing facility.", cg, "Objects of the issue")],
      challenges: [],
    },
    financials: {
      basis: "consolidated",
      revenueBasis: "total_income",
      note: "Total income includes other income.",
      years: [
        k.fy("FY2024", "2024-03-31", cg, { rev: 301.5, pat: 7.52, nw: 46.83, debt: 93.77 }),
        k.fy("FY2025", "2025-03-31", cg, { rev: 336.7, pat: 21.14, nw: 67.94, debt: 73.92 }),
        k.fy("FY2026", "2026-03-31", cg, { rev: 354.41, pat: 27.01, nw: 94.93, debt: 51.72, eps: 5.99 }, { epsSource: pr! }),
      ],
    },
    peers: [
      k.peer("Kingfa Science & Technology (India) Ltd", 46.25, pr!, asOf),
      k.peer("Ddev Plastiks Industries Ltd", 12.97, pr!, asOf),
      k.peer("Plastiblends India Ltd", 14.53, pr!, asOf),
    ],
    risks: [
      { id: "r1", category: "debt_cashflow", title: "Thin profit margins until recently", summary: "Profit was ₹7.52 crore on ₹301.50 crore of total income in FY2024 (about 2.5%), improving to about 7.6% in FY2026.", whyItMatters: "Compounders depend on raw-material prices; margins can shrink again if costs rise.", severity: "caution", citation: k.cite(cg, "Financial information (restated)") },
      { id: "r2", category: "dependence", title: "Small company relative to the issue", summary: "Net worth was ₹94.93 crore at FY2026, against a ₹255 crore fresh issue.", whyItMatters: "Deploying a large amount of new money well is a test of execution for a small company.", severity: "caution", citation: k.cite(cg, "Financial information; Issue details") },
    ],
    bullCase: [
      k.c("Profit rose from ₹7.52 crore (FY2024) to ₹27.01 crore (FY2026).", cg, "Financial information (restated)"),
      k.c("Borrowings fell from ₹93.77 crore to ₹51.72 crore over the same period.", cg, "Financial information (restated)"),
      k.c("The entire issue is fresh capital going to the company.", cg, "Issue details"),
    ],
    bearCase: [
      k.c("Total income growth slowed to about 5% in FY2026.", cg, "Financial information (restated)"),
      k.c("Peer P/E ratios in the RHP range widely (about 13x to 46x), making the comparison less informative.", pr!, "Peer comparison"),
    ],
    listing: null,
    gmp: gmp(k, 38),
    sources: k.sources,
    lastReviewed: COMPILED_AT,
  };
}

export const LIVE_IPOS: Ipo[] = [jio(), paras(), tonbo(), smt(), zetwerk(), eaaa(), sfc(), bls()];
