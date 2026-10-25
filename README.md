# IPO Simplified

Plain-English research and education for Indian IPOs. A beginner can open an IPO, understand the business, inspect financial trends, compare valuation with peers, read the material risks and see exactly which source every figure comes from.

> **Educational information only. Not investment advice.** The product does not recommend applying for or avoiding any IPO, or treat GMP or subscription figures as a signal of quality. GMP is shown on IPO cards for reference only, labelled unofficial and timestamped.

By default the app shows **real IPOs** (`DATA_PROVIDER=curated`): eight mainboard issues from October 2026, compiled on 25 Oct 2026 from public sources (Chittorgarh.com IPO pages, plus the peer tables reproduced from each RHP), with every figure cited and each IPO linked to its RHP. All values are tagged **Unverified** until checked against the RHP itself. Data lives in `src/data/live/ipos.ts` and is a snapshot, so update it as IPOs progress.

`DATA_PROVIDER=mock` switches to a **sample dataset**: eight clearly-labelled **fictional** companies that exercise every state of the UI.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript 6 |
| Styling | Tailwind CSS v4, design tokens in `src/app/globals.css`; small hand-written shadcn-style primitives in `src/components/ui` |
| Charts | Recharts 3 |
| Icons | lucide-react |
| Validation | zod 4 |
| Data | Pluggable provider: built-in sample dataset (default) or Supabase |
| AI (optional) | Anthropic Claude via `@anthropic-ai/sdk`, server-side only |
| Tests | Vitest |
| Hosting | Vercel (no special configuration needed) |

## Getting started

Requirements: Node.js 20.9 or newer (developed on Node 24).

```bash
npm install
cp .env.example .env.local   # optional: every variable is optional
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm test            # unit tests (Vitest)
npm run typecheck   # TypeScript, no emit
npm run build       # production build
npm start           # serve the production build
```

## Environment variables

All optional. With none set, the app runs in sample mode with rule-based (non-AI) explanations.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATA_PROVIDER` | `curated` | `curated` = real IPOs compiled from public sources; `mock` = fictional sample data; `supabase` = records from Supabase |
| `SUPABASE_URL` | none | Supabase project URL (server-side only) |
| `SUPABASE_SERVICE_ROLE_KEY` | none | Service-role key (server-side only; never prefix with `NEXT_PUBLIC_`) |
| `ANTHROPIC_API_KEY` | none | Enables AI explanations. When unset, the "Explain it to me" panel uses rule-based explanations |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Claude model for explanations |

If `DATA_PROVIDER=supabase` is set without credentials, or Supabase returns invalid records, pages show an error. **The app never silently falls back to sample data.**

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing: search, open/upcoming and recently listed IPOs, sample analysis, how it works, lessons, disclaimer |
| `/ipos` | Discovery dashboard: status filter (All/Open/Upcoming/Closed/Listed), search, board filter, "full analysis only", sorting; `?status=` and `?q=` are linkable |
| `/ipos/[slug]` | Analysis page with tabs: Overview (two-minute summary, analysis framework, explainer), Business, Financials, Valuation, Bull vs bear, Risks, IPO structure, Since listing (listed IPOs only), Sources. `?tab=` is linkable |
| `/ipos/[slug]/performance` | Post-listing performance: issue vs listing price, listing-day change, latest close with date, price chart with date-range selector |
| `/learn`, `/learn/[slug]` | Seven beginner lessons |
| `/glossary` | 19 terms with short and deeper explanations (also shown as inline tooltips across the app) |
| `/methodology` | Label rules, generated from the same code that applies them |
| `/watchlist` | Browser-local watchlist (no account) |
| `/disclosures` | Legal disclaimer, data modes, sources, AI, sponsorship/affiliate disclosure, corrections |
| `/sources/[slug]/[sourceId]` | Source detail: metadata, cited sections, link to the original document |
| `POST /api/explain` | `{ slug, topic }` → explanation (AI or rule-based) |
| `POST /api/report-error` | Correction reports (stored in Supabase if configured, otherwise logged) |
| `GET /api/ipos` | JSON list of IPO summaries with provenance |

## Architecture

```
src/
  app/                    routes (server components by default)
  components/
    ui/                   primitives: Badge, Tabs, Term (glossary tooltip), Disclosure, Value, SourceRef…
    layout/               header, footer, sample banner, report-an-error dialog
    ipo/                  IPO card, explorer (search/filter/sort), watchlist
    detail/               one component per analysis section
    charts/               Recharts wrappers (bar, peer P/E, price line)
  data/
    sample/               fictional sample dataset + builders
    glossary.ts, lessons.ts
  lib/
    types.ts              domain model
    schema.ts             zod validation of external records
    finance.ts            pure financial maths (null-safe)
    metrics.ts            per-year metrics, valuation snapshot
    analysis.ts           explainable label rules + METHODOLOGY
    data/                 provider interface, mock + Supabase adapters
    ai/                   fact pack, deterministic explainer, Claude adapter
supabase/migrations/      SQL schema
```

### Data model and source integrity

Every factual figure is a `SourcedValue`:

```ts
{ value, unit, period, citation: { sourceId, locator }, status, updatedAt }
```

`status` is `verified | unverified | sample | unavailable`. Claims (business description, bull/bear points) must either cite a source or be explicitly flagged as a hypothesis. `src/lib/schema.ts` enforces this for live data. It rejects records with uncited values, citations to unknown sources, non-null values marked unavailable, uncited claims that aren't hypotheses, and live records containing sample values.

### Adding a real data provider

1. Implement `IpoDataProvider` (`src/lib/data/provider.ts`): `listIpos()` and `getIpo(slug)` returning `Ipo` objects.
2. Validate with `ipoSchema` before returning.
3. Register it in `getProvider()` (`src/lib/data/index.ts`).

No page or component changes are needed. Throw `DataProviderError` on failure; never return estimated values.

For the included Supabase adapter, run `supabase/migrations/0001_init.sql`, insert reviewed `Ipo` documents into `ipos.payload` with `published = true`, and set `DATA_PROVIDER=supabase`. Row-level security is enabled with no public policies; only the server (service role) can read or write.

### Analysis framework

Six areas (business quality, financial health, valuation, growth, material risks, IPO structure) each get one of **Positive evidence / Mixed evidence / Needs attention / Insufficient data**, by fixed rules in `src/lib/analysis.ts`. The `/methodology` page renders those same rule definitions. There is deliberately no aggregate score. GMP and subscription data are not inputs.

### AI layer (optional)

`src/lib/ai/claude.ts` sends Claude a numbered **fact pack** built only from cited data, with structured output (summary / facts / interpretations / unknowns, each citing fact IDs). Server-side checks then:

- map fact IDs back to source citations, dropping any item that cites a non-existent fact;
- reject output containing investment verdicts ("you should apply", "guaranteed returns"…), falling back to the rule-based explanation;
- handle refusals, rate limits and API errors by falling back as well.

Responses are cached per IPO and topic for six hours, and the endpoint is rate-limited. The request opts into Anthropic's server-side refusal fallback (`fallbacks: "default"`); remove it in `claude.ts` if you don't want it. AI never changes figures or labels.

## Testing

```bash
npm test
```

90 unit tests cover:

- **Financial maths** (`finance.test.ts`): growth, margins, CAGR, P/E, market cap, debt-to-equity, medians; zero denominators, negative bases, negative earnings, missing and non-finite inputs.
- **Analysis and data integrity** (`analysis.test.ts`): sample records pass schema validation, the schema rejects bad records, status derivation, partial-period handling, label rules per scenario.
- **AI guardrails** (`ai/explain-core.test.ts`): fact-pack construction, deterministic explanations, rejection of fabricated citations and verdict language.

A browser smoke test (Playwright, run against the production build at desktop and 390px mobile widths) covered navigation, filters, empty states, tab keyboard navigation, detailed mode, glossary tooltips, the explainer, the watchlist, the error-report flow and horizontal overflow.

## Deployment (Vercel)

1. Push the repository and import it in Vercel (framework preset: Next.js; root directory: this folder).
2. Optionally add environment variables (see above).
3. Deploy. Pages revalidate hourly, so date-based statuses stay current.

Notes for production:

- The in-memory rate limiter is per instance; use a shared store (e.g. Upstash Redis) for strict limits.
- Without Supabase, correction reports are only written to server logs.

## Known limitations and what's still sample

- **All IPO data is fictional sample data.** No real IPO listings, dates, financials, peers, risk factors or prices are included.
- **Post-listing prices are a generated sample series.** Live prices need a licensed market-data provider.
- **No live provider is integrated.** NSE/BSE/SEBI websites are not scraped. Their terms restrict automated access, and NSE/BSE market data is licensed. Before integrating any provider, confirm API availability, licensing terms, redistribution rights, rate limits and cost.
- **Valuation uses P/E only.** EV/EBITDA and price-to-book need additional peer data.
- **Thresholds are editorial judgements.** The label thresholds are simple and documented, not statistically validated.

## Legal

This is an educational tool and is not registered with SEBI as an investment adviser or research analyst. Describing a service as "educational" does not by itself settle its regulatory status under SEBI (Investment Advisers) and (Research Analysts) Regulations. **Get specialist legal review before launching any recommendation, rating, paid research, or sponsored/affiliate feature.** The UI must not imply SEBI registration or endorsement.
