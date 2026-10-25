import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** Native <details> disclosure: keyboard accessible with no JS. */
export function Disclosure({
  summary,
  children,
  className,
  defaultOpen,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details className={cn("group", className)} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-series select-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        {summary}
      </summary>
      <div className="mt-2 text-sm text-ink-2">{children}</div>
    </details>
  );
}
