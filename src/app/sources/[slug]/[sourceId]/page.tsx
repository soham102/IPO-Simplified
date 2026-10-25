import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, FileText, FlaskConical } from "lucide-react";
import { getSource } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Ipo } from "@/lib/types";
import { SOURCE_KIND_LABEL } from "@/components/detail/sources";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/sources/[slug]/[sourceId]">): Promise<Metadata> {
  const { slug, sourceId } = await params;
  const r = await getSource(slug, sourceId);
  return { title: r ? r.source.title : "Source not found" };
}

/** Sections of this source cited on the IPO page, with counts. */
function citedSections(ipo: Ipo, sourceId: string): [string, number][] {
  const m = new Map<string, number>();
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    const o = n as Record<string, unknown>;
    const c = o.citation as { sourceId?: string; locator?: string } | null | undefined;
    if (c?.sourceId === sourceId) m.set(c.locator ?? "(whole document)", (m.get(c.locator ?? "(whole document)") ?? 0) + 1);
    Object.entries(o).forEach(([k, v]) => k !== "citation" && walk(v));
  };
  walk(ipo);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

const OFFICIAL = [
  { name: "SEBI: public issue filings (DRHP / RHP)", url: "https://www.sebi.gov.in/" },
  { name: "NSE: IPO and public issue information", url: "https://www.nseindia.com/" },
  { name: "BSE: public issues", url: "https://www.bseindia.com/" },
];

export default async function SourcePage({ params, searchParams }: PageProps<"/sources/[slug]/[sourceId]">) {
  const { slug, sourceId } = await params;
  const { at } = await searchParams;
  const r = await getSource(slug, sourceId);
  if (!r) notFound();
  const { ipo, source } = r;
  const highlight = typeof at === "string" ? at : null;
  const sections = citedSections(ipo, source.id);
  const external = source.url && /^https?:\/\//.test(source.url);

  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href={`/ipos/${ipo.slug}?tab=sources`} className="-my-2 inline-flex items-center gap-1 py-2 text-sm text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> {ipo.company.name}: sources
      </Link>

      <div className="mt-6 flex items-start gap-3">
        <FileText className="mt-1 size-6 shrink-0 text-brand" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{source.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{SOURCE_KIND_LABEL[source.kind]}</Badge>
            {source.kind === "sample" && <Badge tone="sample"><FlaskConical className="size-3" aria-hidden />Fictional</Badge>}
          </div>
        </div>
      </div>

      <dl className="card mt-6 grid gap-4 p-5 sm:grid-cols-3">
        <div><dt className="text-xs text-ink-3">Publisher</dt><dd className="mt-1 font-medium">{source.publisher}</dd></div>
        <div><dt className="text-xs text-ink-3">Document date</dt><dd className="mt-1 font-medium">{formatDate(source.documentDate)}</dd></div>
        <div><dt className="text-xs text-ink-3">Retrieved / last checked</dt><dd className="mt-1 font-medium">{formatDate(source.accessedAt)}</dd></div>
      </dl>

      {highlight && (
        <div className="mt-4 rounded-xl border border-series/30 bg-brand-soft px-4 py-3 text-sm">
          You followed a citation to: <strong>{highlight}</strong>
        </div>
      )}

      {source.kind === "sample" ? (
        <section className="mt-6 rounded-xl border border-sample/25 bg-sample-soft p-5 text-sm text-ink">
          <p className="font-semibold">This document does not exist.</p>
          <p className="mt-1">
            It is a placeholder for the fictional sample dataset, so there is no original to open. For real IPOs, the
            citation would link to the offer document or filing. Official documents are published here:
          </p>
          <ul className="mt-3 space-y-1.5">
            {OFFICIAL.map((o) => (
              <li key={o.url}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-series underline">
                  {o.name} <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : external ? (
        <a href={source.url!} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-on-brand">
          Open original document <ExternalLink className="size-4" aria-hidden />
        </a>
      ) : (
        <p className="mt-6 text-sm text-ink-3 italic">No public link is available for this source.</p>
      )}

      <section className="mt-8">
        <h2 className="font-sans text-lg font-semibold">Sections cited on the {ipo.company.name} page</h2>
        {sections.length ? (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {sections.map(([loc, n]) => (
              <li key={loc} className={cn("flex items-center justify-between gap-3 px-4 py-2.5 text-sm", loc === highlight && "bg-brand-soft font-medium")}>
                <span>{loc}</span>
                <span className="text-ink-3 num">{n} {n === 1 ? "citation" : "citations"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-3">No fields currently cite this source.</p>
        )}
      </section>
    </div>
  );
}
