import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LESSONS } from "@/data/lessons";

export const metadata: Metadata = { title: "Learning centre" };

export default function LearnPage() {
  return (
    <div className="py-10">
      <p className="eyebrow">Learning centre</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Learn the basics, one short lesson at a time</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Written for first-time investors. No jargon without an explanation, and examples with real-looking numbers so you
        can follow the arithmetic.
      </p>
      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {LESSONS.map((l, i) => (
          <li key={l.slug}>
            <Link href={`/learn/${l.slug}`} className="card group flex h-full flex-col p-6 hover:border-line-strong">
              <div className="flex items-center justify-between text-xs text-ink-3 num">
                <span>Lesson {i + 1}</span>
                <span>{l.minutes} min read</span>
              </div>
              <h2 className="mt-2 font-sans text-lg font-semibold">{l.title}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-2">{l.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-series">
                Read lesson <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-ink-2">
        Looking for a definition? Try the <Link href="/glossary" className="font-medium text-series underline">glossary</Link>.
      </p>
    </div>
  );
}
