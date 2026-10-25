import { AlertTriangle, CheckCircle2, CircleHelp, CircleDot, FlaskConical, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { AssessmentLabel } from "@/lib/analysis";
import { LABEL_TEXT } from "@/lib/analysis";
import { STATUS_LABEL } from "@/lib/format";
import type { AnalysisCoverage, IpoStatus, VerificationStatus } from "@/lib/types";
import { Badge, type BadgeTone } from "./badge";

const STATUS_TONE: Record<IpoStatus, BadgeTone> = {
  upcoming: "brand",
  open: "good",
  closed: "neutral",
  listed: "neutral",
};

export function IpoStatusBadge({ status }: { status: IpoStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      {status === "open" && <span className="size-1.5 rounded-full bg-good" aria-hidden />}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const ASSESS: Record<AssessmentLabel, { tone: BadgeTone; Icon: typeof CheckCircle2 }> = {
  positive: { tone: "good", Icon: CheckCircle2 },
  mixed: { tone: "neutral", Icon: CircleDot },
  attention: { tone: "warn", Icon: AlertTriangle },
  insufficient: { tone: "neutral", Icon: CircleHelp },
};

/** Assessment label: always icon + text, never colour alone. */
export function AssessmentBadge({ label, size = "sm" }: { label: AssessmentLabel; size?: "sm" | "md" }) {
  const { tone, Icon } = ASSESS[label];
  return (
    <Badge tone={tone} className={size === "md" ? "px-2.5 py-1 text-sm" : undefined}>
      <Icon className={size === "md" ? "size-4" : "size-3.5"} aria-hidden />
      {LABEL_TEXT[label]}
    </Badge>
  );
}

const VERIFY: Record<VerificationStatus, { tone: BadgeTone; text: string; Icon: typeof ShieldCheck; help: string }> = {
  verified: { tone: "good", text: "Verified", Icon: ShieldCheck, help: "Checked against a primary source such as the offer document or an exchange filing." },
  unverified: { tone: "warn", text: "Unverified", Icon: ShieldQuestion, help: "From a secondary source; not yet checked against a primary source." },
  sample: { tone: "sample", text: "Sample", Icon: FlaskConical, help: "Fictional value used for demonstration. Not real data." },
  unavailable: { tone: "neutral", text: "Unavailable", Icon: CircleHelp, help: "We do not have this value. Nothing has been estimated in its place." },
};

export function VerificationTag({ status }: { status: VerificationStatus }) {
  const v = VERIFY[status];
  return (
    <Badge tone={v.tone} title={v.help}>
      <v.Icon className="size-3" aria-hidden />
      {v.text}
    </Badge>
  );
}

const COVERAGE: Record<AnalysisCoverage, { text: string; tone: BadgeTone }> = {
  complete: { text: "Full analysis", tone: "brand" },
  partial: { text: "Partial analysis", tone: "warn" },
  basic: { text: "Basic details only", tone: "neutral" },
};

export function CoverageBadge({ coverage }: { coverage: AnalysisCoverage }) {
  const c = COVERAGE[coverage];
  return <Badge tone={c.tone}>{c.text}</Badge>;
}
