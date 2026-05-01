"use client";

import { Trade } from "@/lib/types";
import { formatDate, formatNum, formatPct, formatUsd } from "@/lib/format";

export default function TradesTable({ trades }: { trades: Trade[] }) {
  if (!trades.length) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center">
        No trades.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th className="text-left px-3 py-2">Fecha</th>
            <th className="text-left px-3 py-2">Tipo</th>
            <th className="text-left px-3 py-2">Outcome</th>
            <th className="text-right px-3 py-2">Precio</th>
            <th className="text-right px-3 py-2">Invertido</th>
            <th className="text-right px-3 py-2">Cobrado</th>
            <th className="text-right px-3 py-2">PnL$</th>
            <th className="text-right px-3 py-2">PnL%</th>
            <th className="text-left px-3 py-2">Categoría</th>
            <th className="text-left px-3 py-2">Confianza</th>
            <th className="text-left px-3 py-2">Razón</th>
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
              className="border-t border-neutral-800 hover:bg-neutral-900/50"
            >
              <td className="px-3 py-2 whitespace-nowrap">
                {formatDate(t.ts)}
              </td>
              <td className="px-3 py-2">
                <span
                  className={
                    "text-xs px-2 py-0.5 rounded " +
                    (t.tipo === "entrada"
                      ? "bg-blue-900/40 text-blue-300"
                      : t.tipo === "resolucion"
                      ? "bg-purple-900/40 text-purple-300"
                      : t.tipo === "monitor"
                      ? "bg-amber-900/40 text-amber-300"
                      : "bg-neutral-800 text-neutral-300")
                  }
                >
                  {t.tipo}
                </span>
              </td>
              <td className="px-3 py-2">{t.outcome ?? "—"}</td>
              <td className="px-3 py-2 text-right">
                {formatNum(t.precio, 3)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatUsd(t.cantidad)}
              </td>
              <td className="px-3 py-2 text-right">
                {cobrado === null ? "—" : formatUsd(cobrado)}
              </td>
              <td
                className={`px-3 py-2 text-right ${
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
                className={`px-3 py-2 text-right ${
                  pct === null ? "" : pct >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {pct === null ? "—" : formatPct(pct)}
              </td>
              <td className="px-3 py-2">{t.categoria ?? "—"}</td>
              <td className="px-3 py-2">{t.confianza ?? "—"}</td>
              <td
                className="px-3 py-2 max-w-xs truncate"
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
