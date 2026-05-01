"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { WalletHistoryPoint } from "@/lib/types";
import { formatUsd } from "@/lib/format";

export default function WalletHistoryChart({
  data,
}: {
  data: WalletHistoryPoint[];
}) {
  const points = (data ?? []).map((p) => ({
    fecha: p.fecha,
    cash: Number(p.cash_usdc),
    total: p.total != null ? Number(p.total) : Number(p.cash_usdc),
    deposits: Number(p.cum_deposits),
  }));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Evolución del wallet
          </div>
          <div className="text-[10px] text-neutral-600">
            Cash on-chain (histórico vía RPC) + total wallet (cuando hay
            snapshot completo)
          </div>
        </div>
      </div>
      {!points.length ? (
        <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
          No hay snapshots aún
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={points}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis
              dataKey="fecha"
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
              labelFormatter={(v) =>
                new Date(v as string).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })
              }
              formatter={(v: number | string, name: string) => [
                v == null ? "—" : formatUsd(v),
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="cash"
              name="Cash USDC"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Wallet total"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="stepAfter"
              dataKey="deposits"
              name="Capital aportado"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
