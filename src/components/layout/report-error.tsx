"use client";

import { useRef, useState } from "react";
import { Flag, X } from "lucide-react";
import { cn } from "@/lib/cn";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; via: string } | { kind: "error"; message: string };

/** "Report an error" dialog. Posts to /api/report-error. */
export function ReportErrorButton({ variant = "button", context }: { variant?: "button" | "link"; context?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>({ kind: "idle" });

  const open = () => {
    setState({ kind: "idle" });
    ref.current?.showModal();
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          page: window.location.pathname + window.location.search,
          context: context ?? "",
          field: fd.get("field"),
          description: fd.get("description"),
          sourceUrl: fd.get("sourceUrl"),
          email: fd.get("email"),
          website: fd.get("website"), // honeypot
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; via?: string; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setState({ kind: "sent", via: json.via ?? "server" });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          variant === "link"
            ? "text-ink-2 hover:text-ink"
            : "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink",
        )}
      >
        {variant === "button" && <Flag className="size-4" aria-hidden />}
        Report an error
      </button>
      <dialog
        ref={ref}
        aria-labelledby="report-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="report-title" className="text-lg font-semibold">Report an error</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="rounded p-1 text-ink-3 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        {state.kind === "sent" ? (
          <div className="px-5 py-6">
            <p className="font-medium">Thank you. Your report has been received.</p>
            <p className="mt-1 text-sm text-ink-2">
              We review every correction against the original source. Confirmed fixes are reflected in the page&apos;s
              &quot;last reviewed&quot; date.
            </p>
            <button type="button" className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand" onClick={() => ref.current?.close()}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
            <p className="text-sm text-ink-2">
              Spotted a wrong figure, outdated date or broken source? Tell us what is wrong and, ideally, where the correct
              information is.
            </p>
            <label className="block text-sm">
              <span className="font-medium">What is wrong?</span>
              <input name="field" required maxLength={200} placeholder="e.g. FY2026 revenue on the Financials tab" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Details</span>
              <textarea name="description" required minLength={10} maxLength={2000} rows={4} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Link to the correct source (optional)</span>
              <input name="sourceUrl" type="url" maxLength={500} placeholder="https://" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Your email (optional, only to follow up)</span>
              <input name="email" type="email" maxLength={200} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            </label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {state.kind === "error" && (
              <p role="alert" className="rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">
                Could not send your report: {state.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => ref.current?.close()} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-2">
                Cancel
              </button>
              <button type="submit" disabled={state.kind === "sending"} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-60">
                {state.kind === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
