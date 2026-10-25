import type { Metadata } from "next";
import Link from "next/link";
import { LABEL_TEXT, METHODOLOGY, type AssessmentLabel } from "@/lib/analysis";
import { AssessmentBadge } from "@/components/ui/indicators";

export const metadata: Metadata = { title: "Methodology" };

const ORDER: AssessmentLabel[] = ["insufficient", "attention", "positive", "mixed"];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl py-10">
      <p className="eyebrow">Methodology</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">How we analyse an IPO</h1>
      <div className="mt-4 space-y-3 text-ink-2">
        <p>
          IPO Simplified organises evidence about an IPO into six areas. Each area gets one of four descriptive labels,
          assigned by the fixed rules below. The rules are applied automatically to the data shown on each IPO page; this
          page is generated from the same code, so the published rules and the applied rules are always the same.
        </p>
        <p>
          <strong className="text-ink">There is no overall score.</strong> We do not add labels up, weight them or turn them
          into a rating, because any such weighting would be arbitrary and could be mistaken for a recommendation.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">The four labels</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ["positive", "The rule's conditions for favourable evidence are all met."],
            ["mixed", "Some evidence points each way, or the evidence is neutral."],
            ["attention", "One or more of the rule's warning conditions is met. This is a prompt to look closer, not a verdict."],
            ["insufficient", "A required input is missing. We say so rather than guess."],
          ] as const).map(([l, d]) => (
            <div key={l} className="card p-4">
              <dt><AssessmentBadge label={l} /></dt>
              <dd className="mt-2 text-sm text-ink-2">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-3">Rules are checked in this order: insufficient data → needs attention → positive evidence → mixed evidence.</p>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-2xl font-semibold">Rules by area</h2>
        {METHODOLOGY.map((m) => (
          <article key={m.id} id={m.id} className="card scroll-mt-24 p-6">
            <h3 className="font-sans text-lg font-semibold">{m.title}</h3>
            <p className="mt-1 text-sm text-ink-2">{m.whyItMatters}</p>
            <h4 className="mt-4 text-sm font-semibold">What is evaluated</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-2">
              {m.evaluated.map((e) => <li key={e}>{e}</li>)}
            </ul>
            <h4 className="mt-4 text-sm font-semibold">Label rules</h4>
            <dl className="mt-2 divide-y divide-line rounded-lg border border-line">
              {ORDER.map((l) => (
                <div key={l} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                  <dt className="text-sm font-medium">{LABEL_TEXT[l]}</dt>
                  <dd className="text-sm text-ink-2">{m.rules[l]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section className="mt-10 space-y-3 text-ink-2">
        <h2 className="text-2xl font-semibold text-ink">Calculations</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Revenue growth</strong> = (this year − last year) ÷ last year. Not shown when last year was zero or negative.</li>
          <li><strong className="text-ink">Profit margin</strong> = profit after tax ÷ revenue from operations. Not shown when revenue is zero or negative.</li>
          <li><strong className="text-ink">Revenue CAGR</strong> = (last ÷ first)^(1 ÷ years) − 1, using full financial years only.</li>
          <li><strong className="text-ink">P/E</strong> = upper price band ÷ latest full-year diluted EPS as disclosed (pre-issue). Shown as &quot;not meaningful&quot; for zero or negative EPS.</li>
          <li><strong className="text-ink">Post-issue market cap</strong> = upper band × shares outstanding after the issue. Post-issue P/E = market cap ÷ latest profit after tax.</li>
          <li><strong className="text-ink">Debt-to-equity</strong> = total borrowings ÷ net worth. Not shown when net worth is zero or negative.</li>
          <li><strong className="text-ink">Peer median</strong> uses only peers with a positive disclosed P/E.</li>
          <li>Partial periods (e.g. six months) are shown where available but excluded from growth and trend calculations.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3 text-ink-2">
        <h2 className="text-2xl font-semibold text-ink">What we deliberately leave out</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Grey market premium (GMP):</strong> unofficial, unregulated and easily distorted. It appears on IPO cards for reference, with its source and time, but is never an input to any label. <Link href="/learn/what-is-gmp" className="text-series underline">Why</Link></li>
          <li><strong className="text-ink">Subscription figures:</strong> measure short-term demand, not quality or value. <Link href="/learn/oversubscription-is-not-quality" className="text-series underline">Why</Link></li>
          <li><strong className="text-ink">Price targets and listing-gain predictions:</strong> we don&apos;t make them.</li>
          <li><strong className="text-ink">Personal suitability:</strong> we don&apos;t know your goals, income or risk tolerance, so we never say whether an IPO suits you.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3 text-ink-2">
        <h2 className="text-2xl font-semibold text-ink">Missing data and sources</h2>
        <p>
          Every figure stores its value, unit, period, source, verification status and last-update time. Missing values are
          shown as &quot;Data unavailable&quot; and never estimated. If a rule needs a missing value, the label is
          &quot;Insufficient data&quot;. Uncited claims appear only when explicitly marked &quot;Hypothesis: needs verification&quot;.
        </p>
        <p>
          Source priority: (1) SEBI offer documents (DRHP, RHP, prospectus); (2) NSE and BSE announcements; (3) company
          filings and annual reports; (4) licensed data providers where necessary.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-ink-2">
        <h2 className="text-2xl font-semibold text-ink">AI explanations</h2>
        <p>
          Where enabled, an AI model can write a plain-English explanation. It receives only the cited facts shown on the
          page, must cite them by reference, must separate facts from interpretation, and is instructed not to give
          verdicts. Output that cites unknown facts or contains an investment verdict is discarded and replaced by the
          rule-based explanation. AI never changes a label or a figure.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-sunken p-6 text-sm text-ink-2">
        <p className="font-semibold text-ink">Limitations</p>
        <p className="mt-1">
          The thresholds (for example, 25% above the peer median P/E) are editorial judgements chosen to be simple and
          explainable, not statistically validated predictors of returns. They will be reviewed as the product matures.
          Labels should be read as prompts for further reading, not conclusions.
        </p>
      </section>
    </div>
  );
}
