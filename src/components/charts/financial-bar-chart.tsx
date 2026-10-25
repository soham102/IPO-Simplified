"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/format";
import type { Unit } from "@/lib/types";
import { useChartColors } from "@/lib/theme";

export interface BarDatum {
  period: string;
  value: number | null;
}


/**
 * Single-series bar chart for one financial metric over time.
 * Missing years are shown as a gap with an "n/a" label, never as zero.
 */
export function FinancialBarChart({ data, unit, title }: { data: BarDatum[]; unit: Unit; title: string }) {
  const c = useChartColors();
  const hasNegative = data.some((d) => (d.value ?? 0) < 0);
  const chartData = data.map((d) => ({ ...d, plotted: d.value ?? 0, missing: d.value == null }));

  return (
    <figure>
      <figcaption className="sr-only">
        {title}: {data.map((d) => `${d.period} ${formatNumber(d.value, unit)}`).join("; ")}
      </figcaption>
      <div className="h-56 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="period" tickLine={false} axisLine={{ stroke: c.grid }} tick={{ fill: c.axis, fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fill: c.axis, fontSize: 12 }}
              tickFormatter={(v: number) => (unit === "INR_CRORE" ? `₹${v.toLocaleString("en-IN")}` : String(v))}
            />
            {hasNegative && <ReferenceLine y={0} stroke={c.axis} />}
            <Tooltip
              cursor={{ fill: c.cursor }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as (BarDatum & { missing: boolean }) | undefined;
                if (!active || !p) return null;
                return (
                  <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-md">
                    <p className="text-xs text-ink-3">{p.period}</p>
                    <p className="font-semibold num">{p.missing ? "Data unavailable" : formatNumber(p.value, unit)}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="plotted"
              isAnimationActive={false}
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
              label={({ x, y, width, index }: { x?: number | string; y?: number | string; width?: number | string; index?: number }) => {
                const d = chartData[index ?? 0];
                if (!d) return <g />;
                const text = d.missing ? "n/a" : formatNumber(d.value, unit);
                return (
                  <text x={Number(x ?? 0) + Number(width ?? 0) / 2} y={Number(y ?? 0) - 6} textAnchor="middle" fontSize={11} fill={d.missing ? c.axis : c.ink}>
                    {text}
                  </text>
                );
              }}
            >
              {chartData.map((d) => (
                <Cell key={d.period} fill={(d.value ?? 0) < 0 ? c.negative : c.series} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
