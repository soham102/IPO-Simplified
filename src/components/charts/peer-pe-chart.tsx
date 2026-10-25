"use client";

import { useEffect, useRef, useState } from "react";
import { useChartColors } from "@/lib/theme";
import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface PeerDatum {
  name: string;
  pe: number;
  isIpo: boolean;
}


/** Horizontal bars: the IPO in the series colour, peers as grey context, direct value labels. */
export function PeerPeChart({ data, median }: { data: PeerDatum[]; median: number | null }) {
  const c = useChartColors();
  // Label column adapts to the chart's own width so bars stay readable on phones.
  const box = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow((e?.contentRect.width ?? 999) < 380));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const labelWidth = narrow ? 104 : 136;
  const maxChars = narrow ? 11 : 18;
  const height = Math.max(160, data.length * 44 + 30);
  return (
    <figure>
      <figcaption className="sr-only">
        P/E comparison: {data.map((d) => `${d.name} ${d.pe.toFixed(1)}x`).join("; ")}
        {median != null ? `; peer median ${median.toFixed(1)}x` : ""}
      </figcaption>
      <div ref={box} style={{ height }} className="w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 28, right: narrow ? 44 : 52, bottom: 8, left: 0 }} barCategoryGap={10}>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="name"
              width={labelWidth}
              tickLine={false}
              axisLine={false}
              tick={({ x, y, payload }: { x?: number | string; y?: number | string; payload?: { value: string } }) => {
                const label = payload?.value ?? "";
                const short = label.replace(" (fictional)", "").replace(" Ltd", "");
                const isIpo = data.find((d) => d.name === label)?.isIpo;
                return (
                  <text x={Number(x) - 6} y={Number(y)} dy={4} textAnchor="end" fontSize={12} fill={isIpo ? c.ink : c.axis} fontWeight={isIpo ? 600 : 400}>
                    {short.length > maxChars ? `${short.slice(0, maxChars - 1)}…` : short}
                  </text>
                );
              }}
            />
            {median != null && (
              <ReferenceLine x={median} stroke={c.ink} strokeDasharray="4 3" label={{ value: `Peer median ${median.toFixed(1)}x`, position: "top", fontSize: 11, fill: c.axis }} />
            )}
            <Tooltip
              cursor={{ fill: c.cursor }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as PeerDatum | undefined;
                if (!active || !p) return null;
                return (
                  <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-md">
                    <p className="text-xs text-ink-3">{p.isIpo ? "This IPO (upper band)" : "Listed peer"}</p>
                    <p className="font-semibold">{p.name}</p>
                    <p className="num">P/E {p.pe.toFixed(1)}x</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="pe" radius={[0, 4, 4, 0]} maxBarSize={26} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.isIpo ? c.series : c.context} />
              ))}
              <LabelList dataKey="pe" position="right" formatter={(v: unknown) => `${Number(v).toFixed(1)}x`} fontSize={12} fill={c.ink} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
