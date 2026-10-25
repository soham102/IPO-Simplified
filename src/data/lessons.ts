export type LessonBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "example"; title: string; text: string }
  | { type: "warning"; text: string };

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  blocks: LessonBlock[];
  takeaways: string[];
  /** Glossary ids relevant to the lesson. */
  terms: string[];
}

export const LESSONS: Lesson[] = [
  {
    slug: "how-ipos-work-in-india",
    title: "How IPOs work in India",
    summary: "From the draft prospectus to listing day: the steps, the timeline and who does what.",
    minutes: 5,
    terms: ["drhp", "rhp", "price-band", "lot-size", "anchor-investor"],
    blocks: [
      { type: "p", text: "An Initial Public Offering (IPO) is when a company sells shares to the public for the first time and lists them on a stock exchange, usually NSE and/or BSE. After listing, anyone with a demat account can buy or sell those shares." },
      { type: "h", text: "The main steps" },
      { type: "list", items: [
        "Draft filing: the company files a Draft Red Herring Prospectus (DRHP) with SEBI. It describes the business, financials, risks and the offer.",
        "Review: SEBI reviews the draft and may ask for changes. The DRHP is public, so you can read it on SEBI's website.",
        "RHP and price band: the company files a Red Herring Prospectus (RHP) and announces a price band a few days before opening.",
        "Bidding: the issue is open for at least three working days. Retail investors bid through their broker or bank using UPI or ASBA; the money is blocked, not debited.",
        "Allotment: if the issue is oversubscribed, retail shares are allotted by lottery, generally one lot per successful applicant.",
        "Listing: under SEBI's current T+3 timeline, shares are typically listed three working days after the issue closes.",
      ] },
      { type: "example", title: "A simple example", text: "A company sets a price band of ₹285–300 with a lot of 50 shares. The minimum application is 50 × ₹300 = ₹15,000. If the final price is ₹300 and you are allotted one lot, ₹15,000 is debited; otherwise the block on your money is released." },
      { type: "h", text: "Investor categories" },
      { type: "p", text: "Shares are split between qualified institutional buyers (QIBs), non-institutional investors (NIIs, larger individual bids) and retail individual investors (RIIs, bids up to ₹2 lakh). Each category has its own quota and its own subscription figure." },
      { type: "warning", text: "Rules, timelines and limits change. Always check the latest SEBI circulars and the specific offer document." },
    ],
    takeaways: [
      "The RHP is the key document to read before applying.",
      "Your money is blocked, not spent, until allotment.",
      "Allotment in popular IPOs is a lottery: applying does not guarantee shares.",
    ],
  },
  {
    slug: "reading-financial-statements",
    title: "How to read a company's financial statements",
    summary: "Revenue, profit, cash flow and debt explained with simple examples.",
    minutes: 6,
    terms: ["ocf", "debt-to-equity", "eps", "consolidated"],
    blocks: [
      { type: "p", text: "Offer documents include three to four years of 'restated' financial statements. You don't need to be an accountant to read the important parts. Focus on four things." },
      { type: "h", text: "1. Revenue: how much the company sells" },
      { type: "p", text: "Revenue from operations is the money earned from selling products or services. Look at the trend: is it growing steadily, jumping around, or shrinking?" },
      { type: "h", text: "2. Profit after tax (PAT): what's left for shareholders" },
      { type: "p", text: "PAT is revenue minus all costs, interest and taxes. Divide it by revenue to get the profit margin. A business with 15% margins keeps ₹15 of every ₹100 it sells." },
      { type: "example", title: "Margin example", text: "Revenue ₹1,510 cr and PAT ₹108 cr → margin = 108 ÷ 1,510 = 7.2%. If last year's margin was 6.6%, profitability improved." },
      { type: "h", text: "3. Operating cash flow: is profit turning into cash?" },
      { type: "p", text: "A company can report profit while customers haven't actually paid yet. Operating cash flow shows real cash from operations. If profit is positive but operating cash flow is repeatedly negative, ask why." },
      { type: "h", text: "4. Borrowings: how much is funded by debt" },
      { type: "p", text: "Compare borrowings with net worth (shareholders' funds). The ratio is called debt-to-equity. Higher debt means higher interest costs and more risk when business slows." },
      { type: "warning", text: "Check whether figures are consolidated (including subsidiaries) or standalone, and whether a period is a full year or only a few months. Don't compare a six-month figure with a full year." },
    ],
    takeaways: [
      "Look at trends over three years, not a single number.",
      "Profit margin tells you how much of each sale the company keeps.",
      "Cash flow and debt reveal risks that profit alone can hide.",
    ],
  },
  {
    slug: "what-is-gmp",
    title: "What GMP means and why it's unreliable",
    summary: "Grey market premium is popular on social media. Here's why it shouldn't drive your decision.",
    minutes: 4,
    terms: ["gmp", "listing-gains"],
    blocks: [
      { type: "p", text: "GMP, or Grey Market Premium, is the extra amount over the issue price that some people are informally willing to pay for IPO shares before they list. It's quoted on websites and in messaging groups." },
      { type: "h", text: "Why GMP is unreliable" },
      { type: "list", items: [
        "It's unofficial and unregulated: there is no exchange, no record and no investor protection.",
        "Volumes are small and opaque, so a few participants can move the quoted number.",
        "It changes quickly with market mood and can reverse just before listing.",
        "It measures expected listing-day demand, not the long-term value of the business.",
      ] },
      { type: "example", title: "Illustration", text: "Suppose an IPO priced at ₹300 shows a GMP of ₹60 a week before listing. By listing day market sentiment turns, and the stock opens at ₹290. Investors who applied only because of the GMP are now sitting on a loss." },
      { type: "warning", text: "IPO Simplified shows GMP on IPO cards only for reference, labelled unofficial and timestamped, and never uses it in its analysis. A high GMP is not evidence that a company is good or fairly priced." },
    ],
    takeaways: [
      "GMP is unofficial, unregulated and easily distorted.",
      "Even when accurate, it only reflects short-term sentiment.",
      "Base decisions on the business, financials, valuation and risks instead.",
    ],
  },
  {
    slug: "oversubscription-is-not-quality",
    title: "Why oversubscription doesn't prove a company is good",
    summary: "A 100× subscribed IPO tells you about demand, not about value.",
    minutes: 4,
    terms: ["subscription", "listing-gains"],
    blocks: [
      { type: "p", text: "News headlines often celebrate IPOs that are 'subscribed 100 times'. That number only means applications were 100 times the shares available." },
      { type: "h", text: "What drives high subscription" },
      { type: "list", items: [
        "Hope of listing gains, especially in a rising market.",
        "Leveraged applications by some investors, which inflate the numbers.",
        "Multiple applications by families or groups to improve lottery odds.",
        "Momentum: people apply because others are applying.",
      ] },
      { type: "p", text: "None of these say anything about the company's profitability, debt, competitive position or whether the price is reasonable." },
      { type: "example", title: "Think of it this way", text: "A restaurant with a long queue on opening day may be popular because of a promotion. Whether it's still good in a year depends on the food, costs and management, not on the opening-day queue." },
      { type: "warning", text: "Heavily oversubscribed IPOs can still fall below their issue price after listing." },
    ],
    takeaways: [
      "Subscription measures demand at a moment in time.",
      "Demand can be driven by speculation rather than fundamentals.",
      "Evaluate the business and valuation independently.",
    ],
  },
  {
    slug: "understanding-valuation",
    title: "How to understand valuation",
    summary: "P/E ratios, peer comparison, and what 'expensive' really means.",
    minutes: 6,
    terms: ["pe-ratio", "eps", "market-cap"],
    blocks: [
      { type: "p", text: "A great company can be a poor investment if you pay too much for it. Valuation asks: how much am I paying for what this business earns?" },
      { type: "h", text: "The P/E ratio" },
      { type: "p", text: "Price-to-Earnings (P/E) = share price ÷ earnings per share. A P/E of 30 means you are paying ₹30 for every ₹1 of annual profit." },
      { type: "example", title: "Calculation", text: "Upper price band ₹300; latest full-year diluted EPS ₹10.80 → P/E = 300 ÷ 10.80 ≈ 27.8×." },
      { type: "h", text: "Compare with similar companies" },
      { type: "p", text: "Offer documents list 'listed industry peers' in the 'Basis for Offer Price' section. If peers trade around 38× and the IPO is priced at 28×, it is cheaper on this one measure. Then ask why: lower growth? Lower margins? More risk?" },
      { type: "h", text: "Limitations to remember" },
      { type: "list", items: [
        "P/E is meaningless for loss-making companies.",
        "Peers chosen by the company may not be truly comparable.",
        "EPS shown in the offer document is usually before the new shares are issued; after dilution, the effective P/E is higher.",
        "One year's earnings may be unusually high or low.",
      ] },
      { type: "warning", text: "A lower P/E than peers is not automatically a bargain, and a higher one is not automatically too expensive. Look for the reasons behind the difference." },
    ],
    takeaways: [
      "P/E tells you how much you pay for each rupee of profit.",
      "Compare with genuinely similar companies and note the differences.",
      "Always check the EPS basis and whether earnings are positive.",
    ],
  },
  {
    slug: "common-ipo-mistakes",
    title: "Common IPO investing mistakes",
    summary: "The traps that catch first-time IPO investors, and how to avoid them.",
    minutes: 4,
    terms: ["gmp", "subscription", "listing-gains", "lock-in"],
    blocks: [
      { type: "list", items: [
        "Applying because of GMP or tips: these reflect sentiment, not the business.",
        "Skipping the offer document: the risk factors section exists for a reason.",
        "Ignoring the offer-for-sale share: a large OFS means much of the money goes to sellers, not the company.",
        "Assuming listing gains: many IPOs list below their price, and many that list above later fall.",
        "Borrowing to apply: losses are magnified and interest adds up.",
        "Putting too much into one IPO: diversification limits the damage of any single mistake.",
        "Forgetting lock-in expiries: large blocks of shares becoming sellable can pressure prices.",
      ] },
      { type: "example", title: "A better checklist", text: "Before applying, write one sentence for each: what the company does, how it makes money, whether profits and cash flows are healthy, how the price compares with peers, and the top three risks. If you can't, you probably need to read more." },
    ],
    takeaways: [
      "Do your own reading; don't outsource the decision to tips.",
      "Understand who gets the IPO money.",
      "Only invest what you can afford to lose.",
    ],
  },
  {
    slug: "reading-an-offer-document",
    title: "How to read an offer document",
    summary: "Where to find the most useful information in a 400-page RHP.",
    minutes: 5,
    terms: ["drhp", "rhp", "ofs", "fresh-issue", "promoter"],
    blocks: [
      { type: "p", text: "Offer documents are long, but you don't need to read every page. These sections give you most of what matters." },
      { type: "list", items: [
        "Offer Document Summary: a short overview of the business, the issue and key financials.",
        "Risk Factors: the company's own list of what could go wrong. Read at least the first 15–20.",
        "Objects of the Offer: how fresh-issue money will be used.",
        "Basis for Offer Price: EPS, P/E and the list of comparable listed peers.",
        "Our Business: what the company does, its customers, products and strategy.",
        "Financial Information: restated statements, including cash flows.",
        "Outstanding Litigation: legal cases involving the company, promoters and directors.",
        "Capital Structure: shareholding before and after the issue, and lock-in details.",
      ] },
      { type: "h", text: "Where to find them" },
      { type: "p", text: "DRHPs and RHPs are published on SEBI's website and on the NSE and BSE websites, usually under public issues or IPO sections. The lead managers' websites also host them." },
      { type: "example", title: "A 20-minute plan", text: "Read the summary (5 min), skim the top risk factors (5 min), check Objects of the Offer (3 min), look at Basis for Offer Price (4 min), and glance at the cash flow statement (3 min)." },
    ],
    takeaways: [
      "Start with the summary, risk factors and objects of the offer.",
      "Basis for Offer Price shows the company's own peer comparison.",
      "Always download documents from SEBI, NSE, BSE or the lead managers.",
    ],
  },
];

export const LESSON_BY_SLUG = Object.fromEntries(LESSONS.map((l) => [l.slug, l]));
