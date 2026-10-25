"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Shown when a page fails, e.g. the live data provider is unreachable or
 * returns invalid records. We deliberately do NOT fall back to sample data.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-16">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-warn" aria-hidden />
        <h1 className="mt-3 text-2xl font-semibold">We couldn&apos;t load this data</h1>
        <p className="mt-2 text-ink-2">
          The data source did not return information we could verify, so we are not showing anything rather than showing
          something possibly wrong. No figures have been estimated or substituted.
        </p>
        {error.digest && <p className="mt-2 text-xs text-ink-3">Reference: {error.digest}</p>}
        <button type="button" onClick={reset} className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand">
          Try again
        </button>
      </div>
    </div>
  );
}
