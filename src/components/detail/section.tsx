import { cn } from "@/lib/cn";

export function SectionTitle({ title, intro, id }: { title: string; intro?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="text-2xl font-semibold">{title}</h2>
      {intro && <p className="mt-1.5 max-w-3xl text-ink-2">{intro}</p>}
    </div>
  );
}

export function Panel({ title, children, className, action }: { title?: React.ReactNode; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("card p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          {title && <h3 className="font-sans text-base font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Callout({ tone = "neutral", children }: { tone?: "neutral" | "warn" | "sample"; children: React.ReactNode }) {
  const cls = { neutral: "border-line bg-sunken text-ink-2", warn: "border-warn/25 bg-warn-soft text-ink", sample: "border-sample/25 bg-sample-soft text-ink" }[tone];
  return <div className={cn("rounded-xl border px-4 py-3 text-sm", cls)}>{children}</div>;
}
