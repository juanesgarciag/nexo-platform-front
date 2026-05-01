"use client";

import { Trade } from "@/lib/types";
import { formatDate, formatNum, formatPct, formatUsd } from "@/lib/format";

export default function TradesTable({
  trades,
  onSelect,
}: {
  trades: Trade[];
  onSelect?: (trade: Trade) => void;
}) {
  if (!trades.length) {
    return (
      <div className="glass-panel text-sm text-neutral-500 py-10 text-center">
        No trades.
      </div>
    );
  }
  return (
    <div className="glass-panel overflow-x-auto scrollbar-thin -mx-4 sm:mx-0 rounded-none sm:rounded-xl">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium border-b border-white/5">
          <tr>
            <th className="text-left px-3 py-3">Fecha</th>
            <th className="text-left px-3 py-3">Tipo</th>
            <th className="text-left px-3 py-3">Outcome</th>
            <th className="text-right px-3 py-3">Precio</th>
            <th className="text-right px-3 py-3">Invertido</th>
            <th className="text-right px-3 py-3">Cobrado</th>
            <th className="text-right px-3 py-3">PnL$</th>
            <th className="text-right px-3 py-3">PnL%</th>
            <th className="text-left px-3 py-3">Categoría</th>
            <th className="text-left px-3 py-3">Confianza</th>
            <th className="text-left px-3 py-3">Razón</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const inv = Number(t.cantidad ?? 0);
            const pct = t.pnl_pct === null || t.pnl_pct === undefined
              ? null
              : Number(t.pnl_pct);
            const isClose = t.tipo !== "entrada";
            const cobrado = isClose && pct !== null
              ? inv * (1 + pct / 100)
              : null;
            const pnlUsd = isClose && pct !== null
              ? inv * (pct / 100)
              : null;
            return (
            <tr
              key={t.id}
              onClick={() => onSelect?.(t)}
              className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors ${
                onSelect ? "cursor-pointer" : ""
              }`}
            >
              <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
                {formatDate(t.ts)}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={
                    "text-[10px] px-1.5 py-0.5 rounded border " +
                    (t.tipo === "entrada"
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      : t.tipo === "resolucion"
                      ? "bg-accent-muted text-accent border-accent/20"
                      : t.tipo === "monitor"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      : "bg-white/5 text-neutral-300 border-white/10")
                  }
                >
                  {t.tipo}
                </span>
              </td>
              <td className="px-3 py-2.5">{t.outcome ?? "—"}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatNum(t.precio, 3)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatUsd(t.cantidad)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {cobrado === null ? "—" : formatUsd(cobrado)}
              </td>
              <td
                className={`px-3 py-2.5 text-right tabular-nums ${
                  pnlUsd === null
                    ? ""
                    : pnlUsd >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {pnlUsd === null ? "—" : formatUsd(pnlUsd)}
              </td>
              <td
                className={`px-3 py-2.5 text-right tabular-nums ${
                  pct === null ? "" : pct >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {pct === null ? "—" : formatPct(pct)}
              </td>
              <td className="px-3 py-2.5">{t.categoria ?? "—"}</td>
              <td className="px-3 py-2.5">{t.confianza ?? "—"}</td>
              <td
                className="px-3 py-2.5 max-w-xs truncate text-neutral-400"
                title={t.razon ?? ""}
              >
                {t.razon ?? "—"}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
