import { AlertOctagon, AlertTriangle } from "lucide-react";
import type { Ipo, RiskCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SourceRef } from "@/components/ui/source-ref";
import { Callout, SectionTitle } from "./section";

export const RISK_CATEGORY_LABEL: Record<RiskCategory, string> = {
  concentration: "Customer / supplier concentration",
  litigation: "Litigation",
  related_party: "Related-party transactions",
  promoter_ofs: "Promoter holding & offer for sale",
  debt_cashflow: "Debt & cash flow",
  dependence: "Dependence on a product, input or market",
  industry_regulatory: "Industry & regulatory",
};

export function RisksSection({ ipo }: { ipo: Ipo }) {
  const doc = ipo.documents[0];
  if (ipo.risks.length === 0) {
    return (
      <div>
        <SectionTitle title="Risk analysis" />
        <EmptyState title={ipo.documents.length ? "Risk factors not yet summarised" : "No offer document reviewed yet"}>
          {ipo.documents.length
            ? "We haven't finished summarising the risk factors in this company's offer document. An empty list here does not mean the IPO has no risks."
            : "Risk factors come from the offer document. Once one is available and reviewed, material risks will appear here."}
        </EmptyState>
      </div>
    );
  }
  const sorted = [...ipo.risks].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "material" ? -1 : 1));
  const material = sorted.filter((r) => r.severity === "material").length;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Risk analysis"
        intro={`${material} of ${ipo.risks.length} findings are flagged as material. Each links to its source. These don't replace the full "Risk Factors" section of the ${doc?.type ?? "offer document"}.`}
      />
      <ul className="space-y-3">
        {sorted.map((r) => {
          const isMaterial = r.severity === "material";
          const Icon = isMaterial ? AlertOctagon : AlertTriangle;
          return (
            <li key={r.id} className={`card border-l-4 p-5 ${isMaterial ? "border-l-risk" : "border-l-warn"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={isMaterial ? "risk" : "warn"}>
                  <Icon className="size-3.5" aria-hidden />
                  {isMaterial ? "Material risk" : "Worth knowing"}
                </Badge>
                <span className="text-xs text-ink-3">{RISK_CATEGORY_LABEL[r.category]}</span>
              </div>
              <h3 className="mt-2 font-sans text-base font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-ink-2">{r.summary}</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Why a beginner should care: </span>
                <span className="text-ink-2">{r.whyItMatters}</span>
              </p>
              <SourceRef slug={ipo.slug} citation={r.citation} className="mt-3" />
            </li>
          );
        })}
      </ul>
      <Callout>
        This is a summary, not the full list. Offer documents often contain 50+ risk factors. Read the original &quot;Risk
        Factors&quot; section before making any decision.
      </Callout>
    </div>
  );
}
