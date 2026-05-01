"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { HistoryPoint } from "@/lib/types";
import { formatUsd } from "@/lib/format";

export default function PnlChart({
  data,
  capitalNeto = 0,
}: {
  data: HistoryPoint[];
  capitalNeto?: number;
}) {
  const points = (data ?? []).map((p) => ({
    ts: p.ts,
    cumulative_pnl: Number(p.cumulative_pnl),
  }));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            PnL bruto acumulado
          </div>
          <div className="text-[10px] text-neutral-600">
            Σ ganancias/pérdidas de trades cerrados (no incluye depósitos)
          </div>
        </div>
        {capitalNeto > 0 && (
          <div className="text-[10px] text-neutral-500 text-right">
            <span className="inline-block w-3 border-t border-dashed border-amber-500 mr-1 align-middle" />
            breakeven = capital aportado ({formatUsd(capitalNeto)})
          </div>
        )}
      </div>
      {!points.length ? (
        <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={points}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              stroke="#525252"
              fontSize={11}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              stroke="#525252"
              fontSize={11}
              tickFormatter={(v) => formatUsd(v, 0)}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #262626",
                fontSize: 12,
              }}
              labelFormatter={(v) => new Date(v as string).toLocaleString()}
              formatter={(v: number | string) => [formatUsd(v), "PnL bruto"]}
            />
            <ReferenceLine y={0} stroke="#525252" strokeDasharray="2 2" />
            {capitalNeto > 0 && (
              <ReferenceLine
                y={capitalNeto}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: "capital",
                  position: "right",
                  fill: "#f59e0b",
                  fontSize: 10,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="cumulative_pnl"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
