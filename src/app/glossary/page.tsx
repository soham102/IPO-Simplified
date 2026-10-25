import type { Metadata } from "next";
import { GLOSSARY } from "@/data/glossary";
import { Disclosure } from "@/components/ui/disclosure";

export const metadata: Metadata = { title: "Beginner glossary" };

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <div className="py-10">
      <p className="eyebrow">Glossary</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">IPO terms, explained simply</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        One-line definitions first. Open &quot;Explain more&quot; for the detail and an example. Terms are also explained inline
        wherever you see a dotted underline.
      </p>
      <nav aria-label="Jump to term" className="mt-6 flex flex-wrap gap-2">
        {sorted.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line bg-surface px-3 py-1 text-sm hover:border-line-strong">
            {g.term.split(" (")[0]}
          </a>
        ))}
      </nav>
      <dl className="mt-8 grid gap-4 md:grid-cols-2">
        {sorted.map((g) => (
          <div key={g.id} id={g.id} className="card scroll-mt-24 p-5 target:ring-2 target:ring-series">
            <dt className="font-semibold">{g.term}</dt>
            <dd className="mt-1 text-ink-2">{g.short}</dd>
            <dd className="mt-3">
              <Disclosure summary="Explain more">
                <p>{g.deeper}</p>
                {g.example && (
                  <p className="mt-2 rounded-lg bg-brand-soft px-3 py-2 text-ink">
                    <span className="font-medium">Example: </span>
                    {g.example}
                  </p>
                )}
              </Disclosure>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
