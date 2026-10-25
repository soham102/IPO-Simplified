import Link from "next/link";
import { FlaskConical, ShieldQuestion } from "lucide-react";

export function SampleBanner() {
  return (
    <div className="border-b border-sample/20 bg-sample-soft text-sample">
      <p className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-sm sm:items-center">
        <FlaskConical className="mt-0.5 size-4 shrink-0 sm:mt-0" aria-hidden />
        <span>
          <strong className="font-semibold">Sample data mode.</strong> All companies, figures and documents shown are
          fictional and exist only to demonstrate the product.{" "}
          <Link href="/disclosures#data-modes" className="underline">
            Learn more
          </Link>
        </span>
      </p>
    </div>
  );
}

export function LiveBanner() {
  return (
    <div className="border-b border-warn/20 bg-warn-soft text-ink">
      <p className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-sm sm:items-center">
        <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-warn sm:mt-0" aria-hidden />
        <span>
          <strong className="font-semibold">Real IPOs, compiled 25 Oct 2026 from public sources.</strong>{" "}
          <span className="hidden sm:inline">
            Figures are marked unverified until checked against each offer document. Always confirm in the linked RHP.{" "}
          </span>
          <span className="sm:hidden">Figures unverified. </span>
          <Link href="/disclosures#data-modes" className="underline">
            <span className="hidden sm:inline">How we source data</span>
            <span className="sm:hidden">Details</span>
          </Link>
        </span>
      </p>
    </div>
  );
}
