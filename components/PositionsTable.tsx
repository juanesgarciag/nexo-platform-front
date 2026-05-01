"use client";

import { Position } from "@/lib/types";
import { formatAge, formatDate, formatNum, formatPct, formatUsd } from "@/lib/format";
import { getScoreMeta } from "@/lib/whales";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

type LivePriceMap = Record<
  string,
  {
    curPrice: number | null;
    currentValue: number | null;
    cashPnl: number | null;
    percentPnl: number | null;
    endDate: string | null;
  }
>;

export default function PositionsTable({
  positions,
  showClose = true,
  onSelect,
  livePrices = {},
}: {
  positions: Position[];
  showClose?: boolean;
  onSelect?: (positionId: number) => void;
  livePrices?: LivePriceMap;
}) {
  const qc = useQueryClient();
  const [closingId, setClosingId] = useState<string | null>(null);

  const closeMut = useMutation({
    mutationFn: async ({
      position_id,
      razon,
    }: {
      position_id: number;
      razon: string;
    }) =>
      apiFetch(`/api/control/positions/by-id/${position_id}/close`, {
        method: "POST",
        body: JSON.stringify({ razon }),
      }),
    onSettled: () => {
      setClosingId(null);
      qc.invalidateQueries({ queryKey: ["positions"] });
    },
  });

  if (!positions.length) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center">
        No positions.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th className="text-left px-3 py-2">Pregunta</th>
            <th className="text-left px-3 py-2">Outcome</th>
            <th className="text-right px-3 py-2">Entrada</th>
            <th className="text-right px-3 py-2">Actual</th>
            <th className="text-right px-3 py-2">Invertido</th>
            <th className="text-right px-3 py-2">PnL$</th>
            <th className="text-right px-3 py-2">PnL%</th>
            <th className="text-right px-3 py-2">Abierta</th>
            <th className="text-right px-3 py-2">Cierre</th>
            <th className="text-left px-3 py-2">Score</th>
            <th className="text-left px-3 py-2">Origen</th>
            {showClose && <th className="px-3 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const live = livePrices[p.condition_id];
            const curPrice = live?.curPrice ?? Number(p.precio_actual ?? 0);
            const entryPrice = Number(p.precio_entrada ?? 0);
            const inv = Number(p.cantidad ?? 0);
            // PnL viene calculado del backend (incluye sells parciales + valor actual)
            // No sobrescribir con livePrices.cashPnl (solo residual).
            const livePnlPct = p.pnl_pct != null ? Number(p.pnl_pct) : null;
            const livePnlUsd = p.pnl_usdc != null ? Number(p.pnl_usdc) : null;
            const endDate = live?.endDate ?? p.end_date;
            return (
            <tr
              key={p.id}
              onClick={() => onSelect?.(p.id)}
              className="border-t border-neutral-800 hover:bg-neutral-900/50 cursor-pointer"
            >
              <td className="px-3 py-2 max-w-md truncate" title={p.pregunta}>
                {p.pregunta}
              </td>
              <td className="px-3 py-2">{p.outcome}</td>
              <td className="px-3 py-2 text-right">
                {formatNum(p.precio_entrada, 3)}
              </td>
              <td className="px-3 py-2 text-right">
                {curPrice > 0 ? formatNum(curPrice, 3) : "—"}
                {(() => {
                  const pico = Number(p.precio_pico ?? 0);
                  const entry = Number(p.precio_entrada ?? 0);
                  return pico > 0 && pico > entry ? (
                    <span
                      className="ml-1 text-emerald-500 text-[10px]"
                      title={`pico: ${formatNum(pico, 3)}`}
                    >
                      ▲
                    </span>
                  ) : null;
                })()}
              </td>
              <td className="px-3 py-2 text-right">
                {formatUsd(p.cantidad)}
              </td>
              <td
                className={`px-3 py-2 text-right font-mono ${
                  livePnlUsd === null
                    ? ""
                    : livePnlUsd >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {livePnlUsd !== null ? formatUsd(livePnlUsd) : "—"}
              </td>
              <td
                className={`px-3 py-2 text-right ${
                  livePnlPct === null
                    ? ""
                    : livePnlPct >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {livePnlPct !== null ? formatPct(livePnlPct) : "—"}
              </td>
              <td className="px-3 py-2 text-right text-neutral-400 whitespace-nowrap text-xs">
                {formatAge(p.ts_entrada)}
              </td>
              <td className="px-3 py-2 text-right text-neutral-400 whitespace-nowrap text-xs">
                {endDate ? endDate.toString().slice(0, 10) : "—"}
              </td>
              <td className="px-3 py-2">
                {p.score != null ? (
                  (() => {
                    const meta = getScoreMeta(p.score);
                    return (
                      <div
                        className="flex flex-col leading-tight"
                        title={p.score_label ?? meta.label}
                      >
                        <span className={`font-mono text-sm ${meta.color}`}>
                          {meta.emoji} {p.score}
                        </span>
                        {p.whale_name && (
                          <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                            {p.whale_name}
                          </span>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <span className="text-neutral-600">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1 flex-wrap">
                  {p.origen === "copy" ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300">copy</span>
                  ) : p.origen === "piramide" ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300">piramide</span>
                  ) : p.origen ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">{p.origen}</span>
                  ) : (
                    <span className="text-neutral-600">—</span>
                  )}
                  {p.hedge_opened && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300"
                      title={`hedge${p.hedge_reason ? ` (${p.hedge_reason})` : ""}${p.hedge_count ? ` x${p.hedge_count}` : ""}${p.football_sibling_team ? ` ↔ ${p.football_sibling_team}` : ""}`}
                    >
                      {p.hedge_reason === "football_sibling" ? "⚽" : "🔀"}{" "}
                      {p.football_sibling_team
                        ? `vs ${p.football_sibling_team.slice(0, 14)}`
                        : "hedge"}
                    </span>
                  )}
                  {p.portfolio_mode === "live_binary" && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300"
                      title="live binary portfolio mode"
                    >
                      📊 live binary
                    </span>
                  )}
                  {p.event_category && p.event_category !== "otro" && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-300"
                      title={`detectado por estructura: ${p.event_category}`}
                    >
                      {p.event_category}
                    </span>
                  )}
                  {p.flip && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300"
                      title="Flip YES→NO"
                    >
                      🔄 reverse
                    </span>
                  )}
                  {p.sin_sl && <span title="Sin stop-loss">🛡️</span>}
                </span>
              </td>
              {showClose && (
                <td className="px-3 py-2 text-right">
                  {p.status === "open" && (
                    <button
                      disabled={closingId === String(p.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        const razon =
                          window.prompt("Razón del cierre manual:") || "";
                        if (!razon) return;
                        setClosingId(String(p.id));
                        closeMut.mutate({
                          position_id: p.id,
                          razon,
                        });
                      }}
                      className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
                    >
                      Cerrar
                    </button>
                  )}
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
