import { CalendarDays, Lock } from "lucide-react";
import { sharePct } from "@/lib/finance";
import { formatNumber } from "@/lib/format";
import type { Ipo } from "@/lib/types";
import { SourceRef } from "@/components/ui/source-ref";
import { Term } from "@/components/ui/term";
import { Value } from "@/components/ui/value";
import { Callout, Panel, SectionTitle } from "./section";

export function StructureSection({ ipo }: { ipo: Ipo }) {
  const { total, fresh, ofs } = ipo.issueSize;
  const freshPct = sharePct(fresh.value, total.value);
  const ofsPct = sharePct(ofs.value, total.value);
  const timeline = [
    { label: "Issue opens", v: ipo.dates.open },
    { label: "Issue closes", v: ipo.dates.close },
    { label: "Allotment (indicative)", v: ipo.dates.allotment },
    { label: "Listing (indicative)", v: ipo.dates.listing },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="IPO structure" intro="Who receives the money from this IPO, what it will be used for, and how ownership changes." />

      <Panel title="Where the money goes" action={<SourceRef slug={ipo.slug} citation={total.citation} />}>
        <p className="text-sm text-ink-2">
          Total issue size <span className="font-semibold text-ink num"><Value v={total} /></span>
        </p>
        {freshPct != null && ofsPct != null ? (
          <>
            <div className="mt-4 flex h-9 w-full gap-0.5 overflow-hidden rounded-lg" role="img" aria-label={`Fresh issue ${freshPct.toFixed(0)}%, offer for sale ${ofsPct.toFixed(0)}%`}>
              {freshPct > 0 && <div className="flex items-center bg-series px-3 text-xs font-semibold text-white" style={{ width: `${freshPct}%` }}>{freshPct >= 12 && `${freshPct.toFixed(0)}%`}</div>}
              {ofsPct > 0 && <div className="flex items-center justify-end bg-context px-3 text-xs font-semibold text-ink" style={{ width: `${ofsPct}%` }}>{ofsPct >= 12 && `${ofsPct.toFixed(0)}%`}</div>}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <span className="mt-1 size-3 shrink-0 rounded-sm bg-series" aria-hidden />
                <div>
                  <p className="font-semibold"><Term id="fresh-issue">Fresh issue</Term>: <span className="num"><Value v={fresh} /></span></p>
                  <p className="mt-0.5 text-sm text-ink-2">New shares. This money goes <strong>to the company</strong> for the uses listed below.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 size-3 shrink-0 rounded-sm bg-context" aria-hidden />
                <div>
                  <p className="font-semibold"><Term id="ofs">Offer for sale</Term>: <span className="num"><Value v={ofs} /></span></p>
                  <p className="mt-0.5 text-sm text-ink-2">Existing shares sold by current owners. This money goes <strong>to the sellers</strong>, not the company.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-3 italic">The split between fresh issue and offer for sale is not yet available.</p>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="How the company will use fresh-issue money">
          {ipo.proceedsUse.length ? (
            <ul className="divide-y divide-line">
              {ipo.proceedsUse.map((u) => (
                <li key={u.label} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">{u.label}</p>
                    <p className="shrink-0 font-semibold num"><Value v={u.amount} /></p>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-2">{u.explanation}</p>
                  {u.amount.citation && <SourceRef slug={ipo.slug} citation={u.amount.citation} className="mt-1.5" />}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-2">
              {fresh.value === 0 ? "There is no fresh issue, so the company receives no money from this IPO." : <span className="text-ink-3 italic">Objects of the offer not yet available.</span>}
            </p>
          )}
        </Panel>

        <Panel title="Who is selling in the offer for sale">
          {ipo.ofsSellers.length ? (
            <ul className="divide-y divide-line">
              {ipo.ofsSellers.map((s) => (
                <li key={s.name} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-ink-3">{s.type}</p>
                  </div>
                  <p className="shrink-0 font-semibold num"><Value v={s.amount} /></p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-2">{ofs.value === 0 ? "No existing shareholders are selling. The entire issue is fresh capital." : <span className="text-ink-3 italic">Seller details not yet available.</span>}</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={<Term id="promoter">Promoter holding</Term>}>
          <div className="flex items-end gap-3">
            <div>
              <p className="text-xs text-ink-3">Before IPO</p>
              <p className="text-2xl font-semibold num"><Value v={ipo.promoterHolding.pre} /></p>
            </div>
            <span className="pb-1 text-ink-3" aria-hidden>→</span>
            <div>
              <p className="text-xs text-ink-3">After IPO</p>
              <p className="text-2xl font-semibold num"><Value v={ipo.promoterHolding.post} /></p>
            </div>
          </div>
          {ipo.promoterHolding.pre.value != null && ipo.promoterHolding.post.value != null && (
            <p className="mt-2 text-sm text-ink-2">
              {ipo.promoterHolding.post.value < ipo.promoterHolding.pre.value
                ? `Down ${(ipo.promoterHolding.pre.value - ipo.promoterHolding.post.value).toFixed(1)} percentage points, from new shares diluting their stake and/or promoters selling.`
                : "No reduction in promoter holding."}
            </p>
          )}
          <SourceRef slug={ipo.slug} citation={ipo.promoterHolding.pre.citation} className="mt-3" />
        </Panel>

        <Panel title={<span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-brand" aria-hidden />Key dates</span>}>
          <dl className="space-y-2 text-sm">
            {timeline.map((t) => (
              <div key={t.label} className="flex justify-between gap-2">
                <dt className="text-ink-3">{t.label}</dt>
                <dd className="font-medium"><Value v={t.v} date /></dd>
              </div>
            ))}
          </dl>
          <SourceRef slug={ipo.slug} citation={ipo.dates.open.citation} className="mt-3" />
        </Panel>

        <Panel title={<span className="inline-flex items-center gap-2"><Lock className="size-4 text-brand" aria-hidden /><Term id="lock-in">Lock-in</Term></span>}>
          {ipo.lockIns.length ? (
            <ul className="space-y-3 text-sm text-ink-2">
              {ipo.lockIns.map((l) => (
                <li key={l.description}>
                  {l.description}
                  {l.citation ? <SourceRef slug={ipo.slug} citation={l.citation} className="mt-1 flex w-fit" /> : <span className="mt-1 block text-xs text-ink-3">Not yet verified</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-3 italic">Lock-in details not yet available.</p>
          )}
        </Panel>
      </div>

      <Callout>
        <span className="font-medium text-ink">Why this matters: </span>a large offer for sale isn&apos;t automatically bad. Early
        investors have to exit at some point. But when most of the money goes to sellers, ask why they are selling now,
        and whether the price is set to suit them.
      </Callout>
    </div>
  );
}
