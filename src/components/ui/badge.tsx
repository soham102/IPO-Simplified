import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "good" | "warn" | "risk" | "sample";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-sunken text-ink-2 border-line",
  brand: "bg-brand-soft text-brand border-brand/15",
  good: "bg-good-soft text-good border-good/20",
  warn: "bg-warn-soft text-warn border-warn/20",
  risk: "bg-risk-soft text-risk border-risk/20",
  sample: "bg-sample-soft text-sample border-sample/20",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  title,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
