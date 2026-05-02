"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { PositionDetail, Position } from "@/lib/types";
import {
  formatAge,
  formatDate,
  formatNum,
  formatPct,
  formatUsd,
} from "@/lib/format";
import { getScoreMeta, truncateAddr } from "@/lib/whales";

export default function PositionDetailModal({
  positionId,
  onClose,
}: {
  positionId: number | null;
  onClose: () => void;
}) {
  const enabled = positionId !== null;

  const { data, isLoading } = useQuery({
    queryKey: ["position-detail", positionId],
    queryFn: () =>
      apiFetch<PositionDetail>(`/api/positions/by-id/${positionId}`),
    enabled,
  });

  // Live prices for open positions
  type LiveData = {
    curPrice: number | null;
    currentValue: number | null;
    cashPnl: number | null;
    percentPnl: number | null;
    endDate: string | null;
  };
  const liveQ = useQuery({
    queryKey: ["live-prices"],
    queryFn: () =>
      apiFetch<Record<string, LiveData>>("/api/positions/live/prices"),
    refetchInterval: 10000,
    enabled: enabled && data?.status === "open",
  });
  const live = data?.condition_id ? liveQ.data?.[data.condition_id] : undefined;

  // Hedge: detectar si esta posición forma parte de un par hedge
  const hasHedge = !!(data?.hedge_opened || data?.hedge_for);
  // Si tiene hedge_for, esta posición ES la secundaria; el primary tiene
  // condition_id == hedge_for. Si no tiene hedge_for pero hedge_opened=true,
  // esta es la primary y la secundaria existe en otra condition.
  const isSecondary = !!data?.hedge_for;
  const partnerConditionId = isSecondary ? data?.hedge_for ?? null : null;
  const partnerQ = useQuery({
    queryKey: ["position-detail", partnerConditionId],
    queryFn: () =>
      apiFetch<PositionDetail>(`/api/positions/${partnerConditionId}`),
    enabled: !!partnerConditionId,
  });
  const partner: Position | undefined = partnerQ.data;
  const combinedPnl =
    hasHedge && partner
      ? Number(data?.pnl_usdc ?? 0) + Number(partner.pnl_usdc ?? 0)
      : null;
  const combinedInvertido =
    hasHedge && partner
      ? Number(data?.cantidad ?? 0) + Number(partner.cantidad ?? 0)
      : null;
  const hedgePriceFromRaw = (() => {
    const r =
      data?.raw_json && typeof data.raw_json === "object"
        ? (data.raw_json as Record<string, unknown>)
        : null;
    if (!r) return null;
    const v = r["hedge_price"] ?? r["hedgePrice"] ?? null;
    return typeof v === "number" || typeof v === "string" ? Number(v) : null;
  })();

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onClose]);

  if (!enabled) return null;

  const p = data;
  // Prioridad: event_slug (campo dedicado del bot) > raw_json.slug > condition_id
  const rawSlug =
    p?.raw_json && typeof p.raw_json === "object"
      ? (p.raw_json as Record<string, unknown>)["slug"]
      : undefined;
  const eventSlug = p?.event_slug || (typeof rawSlug === "string" ? rawSlug : "");
  const polymarketHref = eventSlug
    ? `https://polymarket.com/event/${eventSlug}`
    : `https://polymarket.com/event/${data?.condition_id ?? ""}`;

  const isOpen = p?.status === "open";
  const displayPrice = isOpen && live?.curPrice != null
    ? live.curPrice
    : p?.exit_price ?? p?.precio_actual;
  const displayPnlPct = isOpen && live?.percentPnl != null
    ? live.percentPnl
    : p?.pnl_pct != null ? Number(p.pnl_pct) : null;
  const displayPnlUsd = isOpen && live?.cashPnl != null
    ? live.cashPnl
    : p?.pnl_usdc != null ? Number(p.pnl_usdc) : null;
  const pnlPctNum = displayPnlPct ?? 0;

  // Audit fields from raw_json (bot snapshot)
  const raw =
    p?.raw_json && typeof p.raw_json === "object"
      ? (p.raw_json as Record<string, unknown>)
      : null;
  const lastBidRaw =
    raw &&
    (raw["precio_actual"] ??
      raw["last_bid"] ??
      raw["bid"] ??
      raw["ultimo_precio"]);
  const lastBid =
    typeof lastBidRaw === "number" || typeof lastBidRaw === "string"
      ? Number(lastBidRaw)
      : null;
  const exitPriceNum =
    p?.exit_price != null ? Number(p.exit_price) : null;
  const isSuspectStop =
    p?.exit_motivo === "monitor" &&
    exitPriceNum === 0 &&
    lastBid !== null &&
    lastBid > 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-neutral-950 border border-neutral-800 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white text-2xl leading-none px-2"
          aria-label="Cerrar"
        >
          ×
        </button>

        {isLoading || !p ? (
          <div className="text-sm text-neutral-400 py-8">Cargando…</div>
        ) : (
          <div className="space-y-6">
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {p.status}
                </span>
                {p.outcome && (
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                    {p.outcome}
                  </span>
                )}
                {p.categoria && (
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                    {p.categoria}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold leading-snug">
                {p.pregunta ?? "—"}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <Stat label="Precio entrada" value={formatNum(p.precio_entrada, 3)} />
              <Stat
                label={isOpen ? "Precio actual (live)" : "Precio salida"}
                value={formatNum(displayPrice, 3)}
              />
              {(() => {
                const pico = Number(p.precio_pico ?? 0);
                const entry = Number(p.precio_entrada ?? 0);
                const showGreen = pico > 0 && pico > entry;
                return p.precio_pico != null ? (
                  <Stat
                    label="Precio pico"
                    value={showGreen ? `\u{1F4C8} ${formatNum(pico, 3)}` : formatNum(pico, 3)}
                    valueClass={showGreen ? "text-emerald-400" : ""}
                  />
                ) : (
                  <Stat label="Precio pico" value="—" />
                );
              })()}
              <Stat label="Invertido" value={formatUsd(p.cantidad)} />
              <Stat label="Tokens" value={formatNum(p.tokens, 2)} />
              <Stat
                label={isOpen ? "PnL % (live)" : "PnL %"}
                value={displayPnlPct !== null ? formatPct(displayPnlPct) : "—"}
                valueClass={
                  pnlPctNum >= 0 ? "text-emerald-400" : "text-red-400"
                }
              />
              <Stat
                label={isOpen ? "PnL $ (live)" : "PnL $"}
                value={displayPnlUsd !== null ? formatUsd(displayPnlUsd) : "—"}
                valueClass={
                  (displayPnlUsd ?? 0) >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              />
              <Stat
                label={p.ts_salida ? "Cerrado" : "Edad"}
                value={
                  p.ts_salida
                    ? formatDate(p.ts_salida)
                    : formatAge(p.ts_entrada)
                }
              />
              <Stat
                label="Fin mercado"
                value={p.end_date ? formatDate(p.end_date) : "—"}
              />
              <Stat label="Confianza" value={p.confianza ?? "—"} />
              {(p.whale_name || p.whale_addr) && (
                <Stat
                  label="Whale"
                  value={p.whale_name ?? truncateAddr(p.whale_addr)}
                />
              )}
              {p.score != null && (
                (() => {
                  const meta = getScoreMeta(p.score);
                  return (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                        Score
                      </div>
                      <div className={`text-sm font-medium mt-0.5 ${meta.color}`}>
                        {meta.emoji} {p.score} · {p.score_label ?? meta.label}
                      </div>
                      {p.score_detalle && (
                        <div className="text-[10px] text-neutral-500 mt-1 leading-snug">
                          {p.score_detalle}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
              <Stat label="Origen" value={p.origen ?? "—"} />
              <Stat
                label="Flags"
                value={
                  [
                    p.sin_sl ? "🛡️ Sin SL" : null,
                    p.tp_parcial ? "📊 TP parcial" : null,
                    p.flip ? "↩️ Flip" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"
                }
              />
            </div>

            {p.exit_motivo && (
              <div className="text-sm text-neutral-400">
                <span className="text-neutral-500">Motivo salida: </span>
                {p.exit_motivo}
              </div>
            )}

            {(lastBid !== null || isSuspectStop) && (
              <div
                className={`rounded-lg border p-3 text-xs ${
                  isSuspectStop
                    ? "border-amber-700/60 bg-amber-900/20 text-amber-200"
                    : "border-neutral-800 bg-neutral-900/40 text-neutral-300"
                }`}
              >
                <div className="font-semibold mb-1">
                  {isSuspectStop
                    ? "⚠ Stop-loss sospechoso"
                    : "Auditoría de cierre"}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-neutral-500">Precio salida registrado:</span>{" "}
                    {formatNum(p.exit_price, 4)}
                  </div>
                  <div>
                    <span className="text-neutral-500">Último bid conocido:</span>{" "}
                    {lastBid !== null ? lastBid.toFixed(4) : "—"}
                  </div>
                  {isSuspectStop && lastBid !== null && p.cantidad && (
                    <div>
                      <span className="text-neutral-500">
                        Pérdida evitable estimada:
                      </span>{" "}
                      {formatUsd(
                        (lastBid / Number(p.precio_entrada || 1)) *
                          Number(p.cantidad)
                      )}
                    </div>
                  )}
                </div>
                {isSuspectStop && (
                  <div className="mt-2 text-[11px] text-amber-300/80">
                    El bot marcó precio_salida=0 pero el orderbook tenía bid &gt; 0.
                    Probablemente la orden de venta no pegó y se contabilizó
                    como pérdida total.
                  </div>
                )}
              </div>
            )}

            {hasHedge && (
              <div className="rounded-lg border border-indigo-700/60 bg-indigo-900/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-indigo-200">
                    {isSecondary ? "🛡️ Par hedge (esta es la secundaria)" : "🛡️ Par hedge"}
                  </h3>
                  {p.hedge_count != null && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300">
                      hedge #{p.hedge_count}
                    </span>
                  )}
                </div>

                {partnerQ.isLoading && (
                  <div className="text-xs text-neutral-500">Cargando par…</div>
                )}

                {partner && (
                  <div className="rounded border border-indigo-800/50 bg-neutral-900/40 p-2 mb-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-0.5">
                      {isSecondary ? "Posición primary" : "Posición hedge"}
                    </div>
                    <div className="text-xs text-neutral-200 mb-1 leading-snug">
                      {partner.pregunta ?? "—"}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                      {partner.outcome && (
                        <span>
                          <span className="text-neutral-500">Outcome:</span>{" "}
                          {partner.outcome}
                        </span>
                      )}
                      <span>
                        <span className="text-neutral-500">Invertido:</span>{" "}
                        {formatUsd(partner.cantidad)}
                      </span>
                      <span>
                        <span className="text-neutral-500">PnL:</span>{" "}
                        <span
                          className={
                            Number(partner.pnl_usdc ?? 0) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }
                        >
                          {partner.pnl_usdc != null
                            ? formatUsd(partner.pnl_usdc)
                            : "—"}
                        </span>
                      </span>
                      {isSecondary && (
                        <button
                          onClick={() => {
                            // Navegar al primary cerrando este modal y abriendo otro vía URL hash
                            // Si el padre maneja state, sólo cerramos; el usuario puede clickear desde la tabla.
                            // Mejor: emitir un custom event que el padre puede escuchar, o usar window.location.
                            const cid = partner.condition_id;
                            if (cid) {
                              // Cerramos y dejamos que el usuario abra desde la tabla.
                              // Como atajo, copiamos al portapapeles y notificamos.
                              window.dispatchEvent(
                                new CustomEvent("open-position-detail", {
                                  detail: { conditionId: cid },
                                })
                              );
                              onClose();
                            }
                          }}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Ver primary ↗
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                      P&amp;L combinado
                    </div>
                    <div
                      className={`text-sm font-medium mt-0.5 ${
                        (combinedPnl ?? 0) >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {combinedPnl !== null ? formatUsd(combinedPnl) : "—"}
                    </div>
                  </div>
                  <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                      Invertido combinado
                    </div>
                    <div className="text-sm font-medium mt-0.5">
                      {combinedInvertido !== null
                        ? formatUsd(combinedInvertido)
                        : "—"}
                    </div>
                  </div>
                  {p.hedge_reason && (
                    <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                        Motivo hedge
                      </div>
                      <div className="text-sm font-medium mt-0.5 text-neutral-200">
                        {p.hedge_reason === "football_sibling" ? "⚽ " : ""}
                        {p.hedge_reason}
                      </div>
                    </div>
                  )}
                  {p.football_sibling_team && (
                    <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                        Rival cubierto
                      </div>
                      <div className="text-sm font-medium mt-0.5 text-neutral-200">
                        {p.football_sibling_team}
                      </div>
                    </div>
                  )}
                  {p.whale_hedge_nivel && (
                    <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                        Nivel hedge ballena
                      </div>
                      <div className="text-sm font-medium mt-0.5 text-neutral-200">
                        Nv {p.whale_hedge_nivel}
                        {p.whale_hedge_ratio != null && (
                          <span className="text-neutral-400 ml-2">
                            (ratio {(Number(p.whale_hedge_ratio) * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {p.entry_pair_result != null && (
                    <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                        Resultado fijo si ambos resuelven
                      </div>
                      <div
                        className={`text-sm font-medium mt-0.5 ${
                          Number(p.entry_pair_result) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatUsd(Number(p.entry_pair_result))}
                      </div>
                    </div>
                  )}
                  {hedgePriceFromRaw !== null && (
                    <div className="rounded border border-indigo-800/40 bg-neutral-900/40 p-2">
                      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                        Precio hedge
                      </div>
                      <div className="text-sm font-medium mt-0.5 text-neutral-200">
                        {formatNum(hedgePriceFromRaw, 4)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-neutral-300 mb-2">
                Trades de este mercado
              </h3>
              {p.trades && p.trades.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-neutral-800">
                  <table className="w-full text-xs">
                    <thead className="bg-neutral-900 text-neutral-400">
                      <tr>
                        <th className="text-left px-2 py-1.5">Tipo</th>
                        <th className="text-right px-2 py-1.5">Precio</th>
                        <th className="text-right px-2 py-1.5">Cantidad</th>
                        <th className="text-right px-2 py-1.5">PnL%</th>
                        <th className="text-left px-2 py-1.5">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.trades.map((t) => (
                        <tr
                          key={t.id}
                          className="border-t border-neutral-800"
                        >
                          <td className="px-2 py-1.5">
                            <span
                              className={
                                "text-[10px] px-1.5 py-0.5 rounded " +
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
                          <td className="px-2 py-1.5 text-right">
                            {formatNum(t.precio, 3)}
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            {formatUsd(t.cantidad)}
                          </td>
                          <td
                            className={`px-2 py-1.5 text-right ${
                              Number(t.pnl_pct ?? 0) >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatPct(t.pnl_pct)}
                          </td>
                          <td className="px-2 py-1.5">{formatDate(t.ts)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">Sin trades.</div>
              )}
            </div>

            <div>
              <a
                href={polymarketHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Ver en Polymarket ↗
              </a>
            </div>

            {p.raw_json && (
              <details className="rounded-lg border border-neutral-800 bg-neutral-900/40">
                <summary className="cursor-pointer px-3 py-2 text-sm text-neutral-300">
                  Raw data
                </summary>
                <pre className="px-3 py-2 text-xs text-neutral-400 overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(p.raw_json, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className={`text-sm font-medium mt-0.5 ${valueClass}`}>{value}</div>
    </div>
  );
}
