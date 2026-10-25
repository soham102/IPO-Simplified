/**
 * Pure financial calculations.
 *
 * Every function returns `null` when the inputs cannot produce a meaningful
 * number (missing data, zero denominator, negative base). Callers must render
 * `null` as "Data unavailable" / "Not meaningful" — never substitute a value.
 */

export type Num = number | null | undefined;

const isNum = (n: Num): n is number => typeof n === "number" && Number.isFinite(n);

/** a / b, or null when either is missing or b is zero. */
export function safeDivide(a: Num, b: Num): number | null {
  if (!isNum(a) || !isNum(b) || b === 0) return null;
  return a / b;
}

/**
 * Year-on-year growth in percent.
 * Null when the previous value is missing, zero or negative: growth from a
 * negative base (e.g. a loss shrinking) is not meaningful as a percentage.
 */
export function growthPct(current: Num, previous: Num): number | null {
  if (!isNum(current) || !isNum(previous) || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Margin in percent (e.g. PAT / revenue). Null when revenue is missing or ≤ 0. */
export function marginPct(numerator: Num, revenue: Num): number | null {
  if (!isNum(numerator) || !isNum(revenue) || revenue <= 0) return null;
  return (numerator / revenue) * 100;
}

/**
 * Compound annual growth rate in percent across `years` periods.
 * Null when the start value is ≤ 0, the end value is negative, or years ≤ 0.
 */
export function cagrPct(start: Num, end: Num, years: number): number | null {
  if (!isNum(start) || !isNum(end) || start <= 0 || end < 0 || years <= 0) return null;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

export type PeResult =
  | { kind: "ok"; value: number }
  | { kind: "negative_earnings" }
  | { kind: "zero_earnings" }
  | { kind: "missing" };

/**
 * Price-to-earnings ratio. Loss-making companies do not have a meaningful
 * P/E: we return a tagged reason instead of a negative number.
 */
export function peRatio(price: Num, eps: Num): PeResult {
  if (!isNum(price) || !isNum(eps) || price <= 0) return { kind: "missing" };
  if (eps === 0) return { kind: "zero_earnings" };
  if (eps < 0) return { kind: "negative_earnings" };
  return { kind: "ok", value: price / eps };
}

/** Market capitalisation in ₹ crore from a per-share price (₹) and share count. */
export function marketCapCrore(price: Num, shares: Num): number | null {
  if (!isNum(price) || !isNum(shares) || price <= 0 || shares <= 0) return null;
  return (price * shares) / 1e7;
}

/** Borrowings ÷ net worth. Null when net worth is missing, zero or negative. */
export function debtToEquity(borrowings: Num, netWorth: Num): number | null {
  if (!isNum(borrowings) || !isNum(netWorth) || netWorth <= 0 || borrowings < 0) return null;
  return borrowings / netWorth;
}

/** Minimum application amount = one lot × upper price band. */
export function minInvestment(lotSize: Num, priceHigh: Num): number | null {
  if (!isNum(lotSize) || !isNum(priceHigh) || lotSize <= 0 || priceHigh <= 0) return null;
  return lotSize * priceHigh;
}

/** Percent change between two prices (e.g. issue → listing). */
export function priceChangePct(from: Num, to: Num): number | null {
  if (!isNum(from) || !isNum(to) || from <= 0) return null;
  return ((to - from) / from) * 100;
}

/** Median of the finite numbers in `values`; null if none. */
export function median(values: Num[]): number | null {
  const xs = values.filter(isNum).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid]! : (xs[mid - 1]! + xs[mid]!) / 2;
}

/** Share of `part` in `total`, in percent. */
export function sharePct(part: Num, total: Num): number | null {
  if (!isNum(part) || !isNum(total) || total <= 0 || part < 0) return null;
  return (part / total) * 100;
}
