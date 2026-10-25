import Link from "next/link";
import { Mail } from "lucide-react";
import { FEEDBACK_MAILTO, OWNER_EMAIL, OWNER_NAME } from "@/lib/site";
import { ReportErrorButton } from "./report-error";

export function SiteFooter({ dataMode }: { dataMode: "sample" | "live" }) {
  return (
    <footer className="mt-20 border-t border-line bg-sunken">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-lg font-semibold">IPO Simplified</p>
          <p className="mt-2 max-w-prose text-sm text-ink-2">
            <strong className="font-semibold text-ink">Educational information only.</strong> IPO Simplified explains
            publicly disclosed information about IPOs in plain language. It is not investment advice, a research report or a
            recommendation to apply for, buy, sell or hold any security. We are not registered with SEBI as an investment
            adviser or research analyst. Investments in securities are subject to market risks; read the offer document
            carefully and consider consulting a SEBI-registered adviser before investing.
          </p>
          <p className="mt-3 text-sm text-ink-3">
            {dataMode === "sample"
              ? "Currently showing a fictional sample dataset. No company, figure or document on this site is real."
              : "Data is drawn from the sources cited on each page. Check the source and its date before relying on any figure."}
          </p>
        </div>
        <div>
          <p className="eyebrow">Product</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/ipos">Explore IPOs</Link></li>
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/learn">Learning centre</Link></li>
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/glossary">Glossary</Link></li>
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/watchlist">Watchlist</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Trust</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/methodology">Methodology</Link></li>
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/disclosures">Disclosures &amp; data sources</Link></li>
            <li><ReportErrorButton variant="link" /></li>
            <li><Link className="inline-block py-1 text-ink-2 hover:text-ink pointer-coarse:py-2" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="bg-bar text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            Created by <span className="font-semibold text-white">{OWNER_NAME}</span>
          </p>
          <a href={FEEDBACK_MAILTO} className="-my-2 inline-flex items-center gap-2 py-2 hover:text-white">
            <Mail className="size-4" aria-hidden />
            {OWNER_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
