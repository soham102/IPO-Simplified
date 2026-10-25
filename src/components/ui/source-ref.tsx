import Link from "next/link";
import { FileText } from "lucide-react";
import type { Citation } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Inline citation chip. Links to the source detail page, which shows the
 * document metadata and opens the original document where one exists.
 */
export function SourceRef({
  slug,
  citation,
  className,
  hypothesisLabel = "Hypothesis: needs verification",
}: {
  slug: string;
  citation: Citation | null;
  className?: string;
  hypothesisLabel?: string;
}) {
  if (!citation) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-dashed border-warn/40 bg-warn-soft px-1.5 py-0.5 text-[11px] font-medium text-warn",
          className,
        )}
      >
        {hypothesisLabel}
      </span>
    );
  }
  const label = citation.locator ?? "Source";
  return (
    <Link
      href={`/sources/${slug}/${citation.sourceId}${citation.locator ? `?at=${encodeURIComponent(citation.locator)}` : ""}`}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-sunken px-1.5 py-0.5 text-[11px] font-medium text-ink-2 hover:border-line-strong hover:text-ink",
        className,
      )}
      title={`Source: ${label}`}
    >
      <FileText className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}
