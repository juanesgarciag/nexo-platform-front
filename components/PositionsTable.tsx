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
      <div className="glass-panel text-sm text-neutral-500 py-10 text-center">
        No positions.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-x-auto scrollbar-thin -mx-4 sm:mx-0 rounded-none sm:rounded-xl">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
          <tr>
            <th className="sm:sticky sm:left-0 sm:z-20 sm:bg-neutral-950 text-left px-3 py-3 border-b border-white/5 min-w-[280px] max-w-md">Pregunta</th>
            <th className="text-left px-3 py-3 border-b border-white/5">Outcome</th>
            <th className="text-right px-3 py-3 border-b border-white/5">Entrada</th>
            <th className="text-right px-3 py-3 border-b border-white/5">Actual</th>
            <th className="text-right px-3 py-3 border-b border-white/5">Invertido</th>
            <th className="text-right px-3 py-3 border-b border-white/5">PnL$</th>
            <th className="text-right px-3 py-3 border-b border-white/5">PnL%</th>
            <th className="text-right px-3 py-3 border-b border-white/5">Abierta</th>
            <th className="text-right px-3 py-3 border-b border-white/5">Cierre</th>
            <th className="text-left px-3 py-3 border-b border-white/5">Score</th>
            <th className="text-left px-3 py-3 border-b border-white/5">Origen</th>
            {showClose && <th className="px-3 py-3 border-b border-white/5"></th>}
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
              className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
            >
              <td
                className="sm:sticky sm:left-0 sm:z-10 sm:bg-neutral-950 sm:group-hover:bg-[rgb(15,15,15)] px-3 py-2.5 min-w-[280px] max-w-md truncate border-t border-white/5"
                title={p.pregunta}
              >
                {p.pregunta}
              </td>
              <td className="px-3 py-2.5 border-t border-white/5">{p.outcome}</td>
              <td className="px-3 py-2.5 text-right tabular-nums border-t border-white/5">
                {formatNum(p.precio_entrada, 3)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums border-t border-white/5">
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
              <td className="px-3 py-2.5 text-right tabular-nums border-t border-white/5">
                {formatUsd(p.cantidad)}
              </td>
              <td
                className={`px-3 py-2.5 text-right tabular-nums border-t border-white/5 ${
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
                className={`px-3 py-2.5 text-right tabular-nums border-t border-white/5 ${
                  livePnlPct === null
                    ? ""
                    : livePnlPct >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {livePnlPct !== null ? formatPct(livePnlPct) : "—"}
              </td>
              <td className="px-3 py-2.5 text-right text-neutral-400 whitespace-nowrap text-xs tabular-nums border-t border-white/5">
                {formatAge(p.ts_entrada)}
              </td>
              <td className="px-3 py-2.5 text-right text-neutral-400 whitespace-nowrap text-xs tabular-nums border-t border-white/5">
                {endDate ? endDate.toString().slice(0, 10) : "—"}
              </td>
              <td className="px-3 py-2.5 border-t border-white/5">
                {p.score != null ? (
                  (() => {
                    const meta = getScoreMeta(p.score);
                    return (
                      <div
                        className="flex flex-col leading-tight"
                        title={p.score_label ?? meta.label}
                      >
                        <span className={`font-mono text-sm tabular-nums ${meta.color}`}>
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
              <td className="px-3 py-2.5 border-t border-white/5">
                <span className="inline-flex items-center gap-1 flex-wrap">
                  {p.origen === "copy" ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">copy</span>
                  ) : p.origen === "piramide" ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-muted text-accent border border-accent/20">piramide</span>
                  ) : p.origen ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">{p.origen}</span>
                  ) : (
                    <span className="text-neutral-600">—</span>
                  )}
                  {p.hedge_opened && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      title={`hedge${p.hedge_reason ? ` (${p.hedge_reason})` : ""}${p.hedge_count ? ` x${p.hedge_count}` : ""}${p.football_sibling_team ? ` ↔ ${p.football_sibling_team}` : ""}`}
                    >
                      {p.hedge_reason === "football_sibling" ? "⚽" : "🔀"}{" "}
                      {p.football_sibling_team
                        ? `vs ${p.football_sibling_team.slice(0, 14)}`
                        : "hedge"}
                    </span>
                  )}
                  {p.whale_hedge_nivel && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        p.whale_hedge_nivel === "A"
                          ? "bg-red-500/10 text-red-300 border-red-500/20"
                          : p.whale_hedge_nivel === "B"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}
                      title={`Nivel hedge ${p.whale_hedge_nivel}: ratio ballena ${
                        p.whale_hedge_ratio != null
                          ? `${(Number(p.whale_hedge_ratio) * 100).toFixed(0)}%`
                          : "?"
                      }${
                        p.whale_hedge_nivel === "A"
                          ? " — ballena casi sin hedge, cobertura 30%"
                          : p.whale_hedge_nivel === "B"
                          ? " — ballena con algo de hedge, cobertura 50%"
                          : " — ballena bien cubierta, cobertura 60%"
                      }`}
                    >
                      Nv {p.whale_hedge_nivel}
                    </span>
                  )}
                  {p.portfolio_mode === "live_binary" && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      title="live binary portfolio mode"
                    >
                      📊 live binary
                    </span>
                  )}
                  {p.event_category && p.event_category !== "otro" && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-accent-muted text-accent border border-accent/20"
                      title={`detectado por estructura: ${p.event_category}`}
                    >
                      {p.event_category}
                    </span>
                  )}
                  {p.flip && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      title="Flip YES→NO"
                    >
                      🔄 reverse
                    </span>
                  )}
                  {p.sin_sl && <span title="Sin stop-loss">🛡️</span>}
                </span>
              </td>
              {showClose && (
                <td className="px-3 py-2.5 text-right border-t border-white/5">
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
                      className="text-xs h-7 px-2.5 rounded-md border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 disabled:opacity-50 transition-colors"
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
