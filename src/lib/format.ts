import type { IssueDates, IpoStatus, SourcedValue, Unit } from "./types";

export const UNAVAILABLE = "Data unavailable";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatNumber(value: number | null | undefined, unit: Unit, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return UNAVAILABLE;
  switch (unit) {
    case "INR":
      return `${value < 0 ? "−" : ""}₹${inr.format(Math.abs(value))}`;
    case "INR_CRORE":
      return `${value < 0 ? "−" : ""}₹${inr.format(Math.abs(Number(value.toFixed(digits))))} cr`;
    case "PERCENT":
      return `${value.toFixed(digits)}%`;
    case "RATIO":
      return `${value.toFixed(digits)}x`;
    case "SHARES":
    case "COUNT":
      return inr0.format(value);
    case "DATE":
      return formatDate(new Date(value).toISOString());
  }
}

export function formatValue(sv: SourcedValue | null | undefined, digits?: number): string {
  if (!sv || sv.value == null) return UNAVAILABLE;
  return formatNumber(sv.value, sv.unit, digits);
}

export function formatDate(iso: string | null | undefined, opts?: { short?: boolean }): string {
  if (!iso) return "To be announced";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: opts?.short ? undefined : "numeric",
    timeZone: "UTC",
  });
}

export function formatSignedPct(value: number | null, digits = 1): string {
  if (value == null) return UNAVAILABLE;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

/** Today's date (yyyy-mm-dd) in India. Statuses are derived in IST. */
export function todayIST(now: Date = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Derive an IPO's status from its dates. Dates are compared as yyyy-mm-dd
 * strings in IST. Missing open date → "upcoming" (dates to be announced).
 */
export function deriveStatus(dates: IssueDates, today: string): IpoStatus {
  const open = dates.open.value;
  const close = dates.close.value;
  const listing = dates.listing.value;
  if (listing && listing <= today) return "listed";
  if (close && close < today) return "closed";
  if (open && open <= today && (!close || today <= close)) return "open";
  return "upcoming";
}

export const STATUS_LABEL: Record<IpoStatus, string> = {
  upcoming: "Upcoming",
  open: "Open now",
  closed: "Closed",
  listed: "Listed",
};
