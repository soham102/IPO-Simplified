import { formatDate, formatValue, UNAVAILABLE } from "@/lib/format";
import type { SourcedValue } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Renders a sourced value, or a visibly muted "Data unavailable". */
export function Value({
  v,
  digits,
  className,
  date,
}: {
  v: SourcedValue | SourcedValue<string> | null | undefined;
  digits?: number;
  className?: string;
  date?: boolean;
}) {
  if (!v || v.value == null) {
    return <span className={cn("text-sm font-normal text-ink-3 italic", className)}>{UNAVAILABLE}</span>;
  }
  const text = date || v.unit === "DATE" ? formatDate(String(v.value)) : formatValue(v as SourcedValue, digits);
  return <span className={cn("num", className)}>{text}</span>;
}

export function Unavailable({ children = UNAVAILABLE }: { children?: React.ReactNode }) {
  return <span className="text-sm text-ink-3 italic">{children}</span>;
}
