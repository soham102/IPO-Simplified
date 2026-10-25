import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { GLOSSARY_BY_ID } from "@/data/glossary";
import { LESSON_BY_SLUG, LESSONS, type LessonBlock } from "@/data/lessons";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const l = LESSON_BY_SLUG[slug];
  return l ? { title: l.title, description: l.summary } : { title: "Lesson not found" };
}

function Block({ b }: { b: LessonBlock }) {
  switch (b.type) {
    case "p":
      return <p>{b.text}</p>;
    case "h":
      return <h2 className="!mt-8 text-xl font-semibold text-ink">{b.text}</h2>;
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-5">
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "example":
      return (
        <aside className="rounded-xl border border-brand/15 bg-brand-soft px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Lightbulb className="size-4" aria-hidden /> {b.title}
          </p>
          <p className="mt-1 text-ink">{b.text}</p>
        </aside>
      );
    case "warning":
      return (
        <aside className="flex gap-3 rounded-xl border border-warn/25 bg-warn-soft px-5 py-4 text-ink">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
          <p>{b.text}</p>
        </aside>
      );
  }
}

export default async function LessonPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const lesson = LESSON_BY_SLUG[slug];
  if (!lesson) notFound();
  const idx = LESSONS.findIndex((l) => l.slug === slug);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];

  return (
    <article className="mx-auto max-w-2xl py-10">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Learning centre
      </Link>
      <p className="mt-6 text-sm text-ink-3 num">Lesson {idx + 1} of {LESSONS.length} · {lesson.minutes} min read</p>
      <h1 className="mt-1 text-3xl leading-tight font-semibold sm:text-4xl">{lesson.title}</h1>
      <p className="mt-3 text-lg text-ink-2">{lesson.summary}</p>

      <div className="mt-8 space-y-4 text-[17px] leading-relaxed text-ink-2">
        {lesson.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
      </div>

      <section className="card mt-10 p-6">
        <h2 className="font-sans text-base font-semibold">Key takeaways</h2>
        <ul className="mt-3 space-y-2 text-ink-2">
          {lesson.takeaways.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-good" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {lesson.terms.length > 0 && (
        <section className="mt-6">
          <h2 className="font-sans text-sm font-semibold">Terms in this lesson</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {lesson.terms.map((id) => (
              <li key={id}>
                <Link href={`/glossary#${id}`} className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-sm hover:border-line-strong">
                  {GLOSSARY_BY_ID[id]?.term ?? id}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Lesson navigation" className="mt-10 flex justify-between gap-4 border-t border-line pt-6 text-sm">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="inline-flex items-center gap-1 font-medium text-series">
            <ArrowLeft className="size-4" aria-hidden /> {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/learn/${next.slug}`} className="inline-flex items-center gap-1 text-right font-medium text-series">
            {next.title} <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link href="/ipos" className="inline-flex items-center gap-1 font-medium text-series">
            Put it into practice: explore IPOs <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </nav>
      <p className="mt-8 text-xs text-ink-3">Educational content only. Not investment advice.</p>
    </article>
  );
}
