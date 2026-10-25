import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-ink-2">The IPO or page may have been removed, or the link may be mistyped.</p>
      <Link href="/ipos" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand">
        Browse IPOs
      </Link>
    </div>
  );
}
