"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatNumber, formatSignedPct } from "@/lib/format";
import { priceChangePct } from "@/lib/finance";
import type { PricePoint } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useChartColors } from "@/lib/theme";


const RANGES = [
  { id: "1m", label: "1M", days: 30 },
  { id: "3m", label: "3M", days: 91 },
  { id: "6m", label: "6M", days: 182 },
  { id: "all", label: "Since listing", days: Infinity },
] as const;

export function PriceChart({ points, issuePrice }: { points: PricePoint[]; issuePrice: number | null }) {
  const c = useChartColors();
  const span = points.length ? (Date.parse(points[points.length - 1]!.date) - Date.parse(points[0]!.date)) / 86400000 : 0;
  const available = RANGES.filter((r) => r.days === Infinity || r.days < span);
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("all");

  const visible = useMemo(() => {
    const r = RANGES.find((x) => x.id === range)!;
    if (r.days === Infinity || !points.length) return points;
    const cutoff = Date.parse(points[points.length - 1]!.date) - r.days * 86400000;
    return points.filter((p) => Date.parse(p.date) >= cutoff);
  }, [points, range]);

  const first = visible[0];
  const last = visible[visible.length - 1];
  const change = priceChangePct(first?.close, last?.close);

  if (!points.length) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Date range" className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-sm">
          {available.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn("rounded-md px-2.5 py-1 font-medium", range === r.id ? "bg-brand text-on-brand" : "text-ink-2 hover:text-ink")}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-2">
          Change over period:{" "}
          <span className={cn("font-semibold num", change == null ? "" : change >= 0 ? "text-good" : "text-risk")}>{formatSignedPct(change)}</span>
        </p>
      </div>
      <figure className="mt-4">
        <figcaption className="sr-only">
          Daily closing price from {formatDate(first?.date)} ({formatNumber(first?.close, "INR")}) to {formatDate(last?.date)} (
          {formatNumber(last?.close, "INR")}). Issue price {formatNumber(issuePrice, "INR")}.
        </figcaption>
        <div className="h-72 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visible} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: c.grid }}
                tick={{ fill: c.axis, fontSize: 12 }}
                tickFormatter={(d: string) => formatDate(d, { short: true })}
                minTickGap={40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                domain={["auto", "auto"]}
                tick={{ fill: c.axis, fontSize: 12 }}
                tickFormatter={(v: number) => `₹${Math.round(v)}`}
              />
              {issuePrice != null && (
                <ReferenceLine
                  y={issuePrice}
                  stroke={c.ink}
                  strokeDasharray="4 3"
                  label={{ value: `Issue price ₹${issuePrice}`, position: "insideTopLeft", fontSize: 11, fill: c.axis }}
                />
              )}
              <Tooltip
                cursor={{ stroke: c.axis, strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as PricePoint | undefined;
                  if (!active || !p) return null;
                  return (
                    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-md">
                      <p className="text-xs text-ink-3">{formatDate(p.date)}</p>
                      <p className="font-semibold num">{formatNumber(p.close, "INR")}</p>
                      {issuePrice != null && <p className="text-xs text-ink-3 num">{formatSignedPct(priceChangePct(issuePrice, p.close))} vs issue price</p>}
                    </div>
                  );
                }}
              />
              <Line isAnimationActive={false} type="monotone" dataKey="close" stroke={c.series} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: c.dot, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
