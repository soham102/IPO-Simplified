export interface GlossaryTerm {
  id: string;
  term: string;
  short: string;
  deeper: string;
  example?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "gmp",
    term: "GMP (Grey Market Premium)",
    short: "An unofficial price at which IPO shares are informally traded before listing.",
    deeper:
      "The grey market is unregulated: there is no exchange, no disclosure and no protection. GMP figures circulate on websites and messaging groups, can be thin or manipulated, and change quickly. They reflect short-term sentiment, not the company's fundamentals. IPO Simplified shows GMP on IPO cards for reference only, with its source and time, and never uses it in analysis.",
    example: "A ₹50 GMP on a ₹300 issue implies some traders expect ₹350 on listing. That expectation is often wrong.",
  },
  {
    id: "pe-ratio",
    term: "P/E ratio (Price-to-Earnings)",
    short: "Share price divided by earnings per share. How many rupees you pay for each rupee of yearly profit.",
    deeper:
      "A higher P/E means investors are paying more for current profits, usually because they expect growth. Compare P/E only with similar companies, and always check which EPS was used (pre- or post-issue, which year). P/E is not meaningful for loss-making companies.",
    example: "Price ₹300 ÷ EPS ₹10 = P/E of 30x.",
  },
  {
    id: "eps",
    term: "EPS (Earnings Per Share)",
    short: "Profit after tax divided by the number of shares.",
    deeper:
      "'Diluted' EPS includes shares that could be created from options or convertibles. In offer documents, EPS is usually shown on pre-issue shares; after the IPO adds new shares, EPS on the same profit is lower.",
    example: "₹108 crore profit ÷ 10 crore shares = ₹10.8 EPS.",
  },
  {
    id: "drhp",
    term: "DRHP (Draft Red Herring Prospectus)",
    short: "The first draft offer document a company files with SEBI before an IPO.",
    deeper:
      "It contains the business description, financials, risk factors and offer structure, but not the price band or dates. SEBI reviews it and may ask for changes. DRHPs are published on SEBI's website for public comment.",
  },
  {
    id: "rhp",
    term: "RHP (Red Herring Prospectus)",
    short: "The updated offer document filed before the IPO opens; it has everything except the final price.",
    deeper:
      "The RHP is the document to read before applying. The price band is announced separately, shortly before the issue opens. After the price is fixed, the final 'Prospectus' is filed.",
  },
  {
    id: "subscription",
    term: "Subscription multiple",
    short: "How many times the shares on offer were applied for.",
    deeper:
      "If an IPO is 'subscribed 40 times', applications were 40× the shares available. High subscription shows demand at that moment, often driven by hopes of listing gains. It does not tell you whether the business is good or the price is fair.",
  },
  {
    id: "lot-size",
    term: "Lot size",
    short: "The minimum number of shares you must apply for, and the multiple you apply in.",
    deeper:
      "Retail investors apply in lots. The minimum application amount is one lot × the upper end of the price band. For SME IPOs, lots are much larger.",
    example: "Lot of 50 shares × ₹300 = ₹15,000 minimum application.",
  },
  {
    id: "market-cap",
    term: "Market capitalisation",
    short: "The total value of all a company's shares at a given price.",
    deeper:
      "Market cap = share price × total shares outstanding. For an IPO, use the shares outstanding after the issue (including new shares) to get the post-issue market cap.",
    example: "₹300 × 10.4 crore shares = ₹3,120 crore.",
  },
  {
    id: "ofs",
    term: "Offer for sale (OFS)",
    short: "Existing shareholders selling their shares in the IPO. The company receives none of this money.",
    deeper:
      "Promoters or early investors use an OFS to cash out some or all of their stake. A large OFS isn't automatically bad, but it means the IPO is partly an exit for sellers rather than funding for the business.",
  },
  {
    id: "fresh-issue",
    term: "Fresh issue",
    short: "New shares created and sold by the company. This money goes to the company.",
    deeper:
      "Fresh-issue proceeds must be used for the purposes stated in the offer document ('Objects of the Offer'). New shares dilute existing shareholders' percentage ownership.",
  },
  {
    id: "listing-gains",
    term: "Listing gains",
    short: "The difference between the IPO price and the price on the first day of trading.",
    deeper:
      "Listing-day prices are driven by short-term demand and market mood. Many IPOs that list at a gain later fall below their issue price, and vice versa. Listing gains are not a measure of long-term value.",
  },
  {
    id: "price-band",
    term: "Price band",
    short: "The range within which investors bid in a book-built IPO.",
    deeper:
      "The final issue price is set within the band after bidding closes. Retail investors can bid at the 'cut-off' price, meaning they accept whatever final price is set.",
  },
  {
    id: "promoter",
    term: "Promoter",
    short: "The founders or controlling shareholders named in the offer document.",
    deeper:
      "Promoters usually control the company. A falling promoter stake after the IPO is normal, but a large drop can mean they are reducing their commitment.",
  },
  {
    id: "anchor-investor",
    term: "Anchor investor",
    short: "Large institutional investors who are allotted shares a day before the IPO opens.",
    deeper:
      "Anchors' shares are locked in for a period after allotment. Anchor participation is sometimes read as a vote of confidence, but anchors have their own motives and timelines.",
  },
  {
    id: "lock-in",
    term: "Lock-in",
    short: "A period during which certain shareholders cannot sell their shares.",
    deeper:
      "When lock-ins expire, a large number of shares can become sellable at once, which can pressure the share price.",
  },
  {
    id: "ocf",
    term: "Operating cash flow",
    short: "Cash the business actually generated from its day-to-day operations.",
    deeper:
      "Profit can include sales not yet paid for. Operating cash flow shows whether customers are actually paying. Persistently negative operating cash flow means the business needs outside money to keep running.",
  },
  {
    id: "debt-to-equity",
    term: "Debt-to-equity",
    short: "Borrowings divided by shareholders' net worth.",
    deeper:
      "Higher means more reliance on borrowed money. Above about 1–2x, interest costs and refinancing risk become significant for most non-financial companies. Banks and NBFCs are judged differently.",
  },
  {
    id: "consolidated",
    term: "Consolidated vs standalone",
    short: "Consolidated figures include subsidiaries; standalone figures cover only the parent company.",
    deeper:
      "For groups with subsidiaries, consolidated figures give the fuller picture. Always compare like with like.",
  },
  {
    id: "sme-ipo",
    term: "SME IPO",
    short: "An IPO on the exchanges' small and medium enterprise platforms (NSE Emerge, BSE SME).",
    deeper:
      "SME IPOs have lighter disclosure requirements, larger lot sizes and often low trading liquidity after listing. They carry higher risk for retail investors.",
  },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));
