import { Briefcase, Package, Users, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import type { Claim, Ipo } from "@/lib/types";
import { Detailed } from "@/components/ui/detail-level";
import { EmptyState } from "@/components/ui/empty-state";
import { SourceRef } from "@/components/ui/source-ref";
import { Panel, SectionTitle } from "./section";

function ClaimText({ c, slug }: { c: Claim | null; slug: string }) {
  if (!c) return <span className="text-ink-3 italic">Not yet summarised from the offer document. See the RHP linked under Sources.</span>;
  return (
    <>
      {c.text} <SourceRef slug={slug} citation={c.citation} className="ml-0.5 align-middle" />
    </>
  );
}

function ClaimList({ items, slug, empty }: { items: Claim[]; slug: string; empty: string }) {
  if (!items.length) return <p className="text-sm text-ink-3 italic">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((c, i) => (
        <li key={i} className="flex gap-2 text-sm text-ink-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden />
          <span>
            <ClaimText c={c} slug={slug} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BusinessSection({ ipo }: { ipo: Ipo }) {
  const b = ipo.business;
  if (!b) {
    return (
      <EmptyState title="Business details not yet available">
        We haven&apos;t reviewed this company&apos;s offer document yet. Rather than guess, we&apos;ve left this section empty.
      </EmptyState>
    );
  }
  const rows = [
    { Icon: Briefcase, q: "What does the company do?", a: <ClaimText c={b.whatItDoes} slug={ipo.slug} /> },
    { Icon: Users, q: "Who are its customers?", a: <ClaimText c={b.customers} slug={ipo.slug} /> },
    { Icon: Wallet, q: "How does it make money?", a: <ClaimText c={b.revenueModel} slug={ipo.slug} /> },
  ];
  return (
    <div>
      <SectionTitle title="Understand the business" intro="What the company does, in plain language, with every statement linked to where it came from." />
      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((r) => (
          <Panel key={r.q}>
            <r.Icon className="size-5 text-brand" aria-hidden />
            <p className="mt-3 font-semibold">{r.q}</p>
            <p className="mt-1.5 text-sm text-ink-2">{r.a}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title={<span className="inline-flex items-center gap-2"><Package className="size-4 text-brand" aria-hidden />Products &amp; services</span>}>
          <ClaimList items={b.products} slug={ipo.slug} empty="Not disclosed." />
        </Panel>
        <Panel title={<span className="inline-flex items-center gap-2"><TrendingUp className="size-4 text-good" aria-hidden />Growth drivers</span>}>
          <ClaimList items={b.growthDrivers} slug={ipo.slug} empty="No growth drivers identified from the sources reviewed." />
        </Panel>
        <Panel title={<span className="inline-flex items-center gap-2"><AlertTriangle className="size-4 text-warn" aria-hidden />Biggest challenges</span>}>
          <ClaimList items={b.challenges} slug={ipo.slug} empty="No challenges identified from the sources reviewed." />
        </Panel>
      </div>
      {b.detail && (
        <Detailed>
          <Panel title="Deeper context" className="mt-4">
            <p className="text-sm text-ink-2">{b.detail}</p>
            <p className="mt-2 text-xs text-ink-3">Editorial summary of the cited points above; not a new factual claim.</p>
          </Panel>
        </Detailed>
      )}
      <p className="mt-4 text-xs text-ink-3">
        Points marked &quot;Hypothesis: needs verification&quot; are reasonable questions, not facts from a source. Treat them as
        things to check.
      </p>
    </div>
  );
}
