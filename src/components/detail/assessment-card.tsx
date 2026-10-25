import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Assessment } from "@/lib/analysis";
import { AssessmentBadge } from "@/components/ui/indicators";
import { Disclosure } from "@/components/ui/disclosure";
import { SourceRef } from "@/components/ui/source-ref";

const TONE_ICON = {
  positive: { Icon: ArrowUpRight, cls: "text-good", sr: "Supports" },
  negative: { Icon: ArrowDownRight, cls: "text-risk", sr: "Concern" },
  neutral: { Icon: Minus, cls: "text-ink-3", sr: "Context" },
};

export function AssessmentCard({ a, slug }: { a: Assessment; slug: string }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold">{a.title}</h3>
        <AssessmentBadge label={a.label} />
      </div>
      <p className="mt-2 text-sm text-ink-2">{a.reason}</p>

      {a.evidence.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {a.evidence.map((e, i) => {
            const t = TONE_ICON[e.tone];
            return (
              <li key={i} className="flex gap-2 text-sm">
                <t.Icon className={`mt-0.5 size-4 shrink-0 ${t.cls}`} aria-hidden />
                <span className="sr-only">{t.sr}: </span>
                <span className="min-w-0">
                  {e.text} <SourceRef slug={slug} citation={e.citation} className="ml-0.5 align-middle" />
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {a.missing.length > 0 && (
        <div className="mt-4 rounded-lg bg-sunken px-3 py-2 text-sm">
          <p className="font-medium text-ink">Uncertain or missing</p>
          <ul className="mt-1 list-disc pl-5 text-ink-2">
            {a.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto space-y-3 pt-4">
        <p className="text-sm text-ink-2">
          <span className="font-medium text-ink">Why it matters: </span>
          {a.whyItMatters}
        </p>
        <Disclosure summary="What was evaluated">
          <ul className="list-disc space-y-1 pl-5">
            {a.evaluated.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Disclosure>
      </div>
    </article>
  );
}
