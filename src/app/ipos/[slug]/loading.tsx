export default function Loading() {
  return (
    <div className="py-8" role="status" aria-live="polite">
      <span className="sr-only">Loading IPO analysis…</span>
      <div className="h-4 w-20 animate-pulse rounded bg-sunken" />
      <div className="mt-6 h-10 w-80 max-w-full animate-pulse rounded bg-sunken" />
      <div className="mt-3 h-4 w-[32rem] max-w-full animate-pulse rounded bg-sunken" />
      <div className="card mt-6 h-24 animate-pulse bg-sunken/60" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-48 animate-pulse bg-sunken/60" />
        ))}
      </div>
    </div>
  );
}
