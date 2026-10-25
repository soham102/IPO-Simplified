export default function Loading() {
  return (
    <div className="py-10" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-64 animate-pulse rounded bg-sunken" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-sunken" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-56 animate-pulse bg-sunken/60" />
        ))}
      </div>
    </div>
  );
}
