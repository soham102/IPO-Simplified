import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Ipo, Source } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { VerificationTag } from "@/components/ui/indicators";
import { Callout, SectionTitle } from "./section";

export const SOURCE_KIND_LABEL: Record<Source["kind"], string> = {
  sebi_offer_document: "SEBI offer document",
  exchange: "Exchange filing",
  company_filing: "Company filing",
  data_provider: "Data provider",
  sample: "Fictional sample document",
};

/** Count how many fields cite each source (walks the record). */
function citationCounts(ipo: Ipo): Map<string, number> {
  const counts = new Map<string, number>();
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    const o = n as Record<string, unknown>;
    const c = o.citation as { sourceId?: string } | null | undefined;
    if (c?.sourceId) counts.set(c.sourceId, (counts.get(c.sourceId) ?? 0) + 1);
    Object.entries(o).forEach(([k, v]) => k !== "citation" && walk(v));
  };
  walk(ipo);
  return counts;
}

export function SourcesSection({ ipo }: { ipo: Ipo }) {
  const counts = citationCounts(ipo);
  return (
    <div className="space-y-5">
      <SectionTitle title="Sources" intro="Every figure and claim on this page links to one of these documents. Open a source to see the details and the original document." />
      {ipo.dataMode === "sample" && (
        <Callout tone="sample">These are fictional placeholder documents for the sample dataset. In live mode, sources are SEBI offer documents, NSE/BSE filings and company disclosures.</Callout>
      )}
      <ul className="space-y-3">
        {ipo.sources.map((s) => (
          <li key={s.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <FileText className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div className="min-w-0">
                <p className="font-medium">{s.title}</p>
                <p className="mt-0.5 text-sm text-ink-3">
                  {s.publisher} · Dated {formatDate(s.documentDate)} · Retrieved {formatDate(s.accessedAt)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge>{SOURCE_KIND_LABEL[s.kind]}</Badge>
                  {s.kind === "sample" && <VerificationTag status="sample" />}
                  <Badge tone="brand">{counts.get(s.id) ?? 0} citations on this page</Badge>
                </div>
              </div>
            </div>
            <Link href={`/sources/${ipo.slug}/${s.id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">
              Open source <ExternalLink className="size-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-sm font-medium">What the verification tags mean</p>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2"><dt><VerificationTag status="verified" /></dt><dd className="text-ink-2">Checked against a primary source.</dd></div>
          <div className="flex items-start gap-2"><dt><VerificationTag status="unverified" /></dt><dd className="text-ink-2">From a secondary source, not yet checked.</dd></div>
          <div className="flex items-start gap-2"><dt><VerificationTag status="sample" /></dt><dd className="text-ink-2">Fictional, for demonstration only.</dd></div>
          <div className="flex items-start gap-2"><dt><VerificationTag status="unavailable" /></dt><dd className="text-ink-2">Not available; nothing estimated in its place.</dd></div>
        </dl>
      </div>
    </div>
  );
}
