import { TrendingDown, TrendingUp } from "lucide-react";
import type { Claim, Ipo } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { SourceRef } from "@/components/ui/source-ref";
import { SectionTitle } from "./section";

function CaseColumn({ title, items, slug, tone }: { title: string; items: Claim[]; slug: string; tone: "bull" | "bear" }) {
  const Icon = tone === "bull" ? TrendingUp : TrendingDown;
  return (
    <section className="card overflow-hidden">
      <div className={`flex items-center gap-2 border-b px-5 py-3 ${tone === "bull" ? "border-good/20 bg-good-soft text-good" : "border-risk/20 bg-risk-soft text-risk"}`}>
        <Icon className="size-5" aria-hidden />
        <h3 className="font-sans font-semibold">{title}</h3>
      </div>
      {items.length ? (
        <ol className="divide-y divide-line">
          {items.map((c, i) => (
            <li key={i} className="flex gap-3 px-5 py-3.5 text-sm">
              <span className="mt-0.5 text-xs font-semibold text-ink-3 num">{i + 1}</span>
              <div className="min-w-0 space-y-1.5">
                <p className="text-ink">{c.text}</p>
                <SourceRef slug={slug} citation={c.citation} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-5 py-4 text-sm text-ink-3 italic">No points identified from the sources reviewed.</p>
      )}
    </section>
  );
}

export function BullBearSection({ ipo }: { ipo: Ipo }) {
  if (!ipo.bullCase.length && !ipo.bearCase.length) {
    return (
      <div>
        <SectionTitle title="Bull case vs bear case" />
        <EmptyState title="Not enough evidence yet">
          We only list arguments we can tie to a source or clearly mark as a hypothesis. There isn&apos;t enough reviewed
          material for this IPO yet.
        </EmptyState>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle
        title="Bull case vs bear case"
        intro="The strongest arguments on each side. Each point links to its source, or is clearly marked as a hypothesis you would need to verify."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <CaseColumn title="What could go right" items={ipo.bullCase} slug={ipo.slug} tone="bull" />
        <CaseColumn title="What could go wrong" items={ipo.bearCase} slug={ipo.slug} tone="bear" />
      </div>
      <p className="mt-4 text-sm text-ink-3">
        Seeing more points on one side doesn&apos;t make it the right answer. Weigh how important each point is to you.
      </p>
    </div>
  );
}
