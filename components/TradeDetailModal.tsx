"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { PositionDetail, Trade } from "@/lib/types";
import { formatDate, formatNum, formatPct, formatUsd } from "@/lib/format";

export default function TradeDetailModal({
  trade,
  onClose,
}: {
  trade: Trade | null;
  onClose: () => void;
}) {
  const enabled = trade !== null;

  const positionQ = useQuery({
    queryKey: ["position-detail-by-condition", trade?.condition_id],
    queryFn: () =>
      apiFetch<PositionDetail>(`/api/positions/${trade?.condition_id}`),
    enabled: enabled && !!trade?.condition_id,
  });

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onClose]);

  if (!enabled || !trade) return null;

  const t = trade;
  const inv = Number(t.cantidad ?? 0);
  const pct = t.pnl_pct === null || t.pnl_pct === undefined ? null : Number(t.pnl_pct);
  const isClose = t.tipo !== "entrada";
  const cobrado = isClose && pct !== null ? inv * (1 + pct / 100) : null;
  const pnlUsd = isClose && pct !== null ? inv * (pct / 100) : null;

  const pos = positionQ.data;
  const eventSlug = (() => {
    const r =
      pos?.raw_json && typeof pos.raw_json === "object"
        ? (pos.raw_json as Record<string, unknown>)
        : null;
    const s = (pos?.event_slug as string | undefined) ?? (r ? r["slug"] : undefined);
    return typeof s === "string" ? s : "";
  })();
  const polymarketHref = eventSlug
    ? `https://polymarket.com/event/${eventSlug}`
    : t.condition_id
    ? `https://polymarket.com/event/${t.condition_id}`
    : null;

  const tipoBadgeClass =
    t.tipo === "entrada"
      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
      : t.tipo === "resolucion"
      ? "bg-accent-muted text-accent border-accent/20"
      : t.tipo === "monitor"
      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
      : "bg-white/5 text-neutral-300 border-white/10";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-neutral-950 border border-neutral-800 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white text-2xl leading-none px-2"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="space-y-6">
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded border ${tipoBadgeClass}`}>
                {t.tipo}
              </span>
              {t.outcome && (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {t.outcome}
                </span>
              )}
              {t.categoria && (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {t.categoria}
                </span>
              )}
              {t.confianza && (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {t.confianza}
                </span>
              )}
              {t.source_wallet && (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {t.source_wallet}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold leading-snug">
              {pos?.pregunta ?? (t.condition_id ? "Mercado vinculado" : "Trade")}
            </h2>
            <div className="text-xs text-neutral-500 mt-1 tabular-nums">
              {formatDate(t.ts)} · ID #{t.id}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <Stat label="Precio" value={formatNum(t.precio, 4)} />
            <Stat label="Invertido" value={formatUsd(t.cantidad)} />
            <Stat label="Tokens" value={t.tokens != null ? formatNum(t.tokens, 2) : "—"} />
            {isClose && (
              <Stat
                label="Cobrado"
                value={cobrado === null ? "—" : formatUsd(cobrado)}
              />
            )}
            {pnlUsd !== null && (
              <Stat
                label="PnL $"
                value={formatUsd(pnlUsd)}
                valueClass={pnlUsd >= 0 ? "text-emerald-400" : "text-red-400"}
              />
            )}
            {pct !== null && (
              <Stat
                label="PnL %"
                value={formatPct(pct)}
                valueClass={pct >= 0 ? "text-emerald-400" : "text-red-400"}
              />
            )}
          </div>

          {t.razon && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
                Razón
              </div>
              <div className="text-sm text-neutral-200 leading-relaxed">
                {t.razon}
              </div>
            </div>
          )}

          {(t.token_id || t.condition_id) && (
            <div className="grid grid-cols-1 gap-2 text-xs">
              {t.condition_id && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
                    Condition ID
                  </div>
                  <div className="font-mono text-neutral-300 break-all">
                    {t.condition_id}
                  </div>
                </div>
              )}
              {t.token_id && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
                    Token ID
                  </div>
                  <div className="font-mono text-neutral-300 break-all">
                    {t.token_id}
                  </div>
                </div>
              )}
            </div>
          )}

          {t.condition_id && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-300 mb-2">
                Posición vinculada
              </h3>
              {positionQ.isLoading ? (
                <div className="text-xs text-neutral-500">Cargando…</div>
              ) : pos ? (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                      {pos.status}
                    </span>
                    {pos.outcome && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                        {pos.outcome}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-200 leading-snug">
                    {pos.pregunta ?? "—"}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                    <span>
                      <span className="text-neutral-500">Entrada:</span>{" "}
                      {formatNum(pos.precio_entrada, 3)}
                    </span>
                    <span>
                      <span className="text-neutral-500">Invertido:</span>{" "}
                      {formatUsd(pos.cantidad)}
                    </span>
                    <span>
                      <span className="text-neutral-500">PnL:</span>{" "}
                      <span
                        className={
                          Number(pos.pnl_usdc ?? 0) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {pos.pnl_usdc != null ? formatUsd(pos.pnl_usdc) : "—"}
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  No se encontró la posición vinculada.
                </div>
              )}
            </div>
          )}

          {polymarketHref && (
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
          )}

          {t.raw_json && (
            <details className="rounded-lg border border-neutral-800 bg-neutral-900/40">
              <summary className="cursor-pointer px-3 py-2 text-sm text-neutral-300">
                Raw data
              </summary>
              <pre className="px-3 py-2 text-xs text-neutral-400 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(t.raw_json, null, 2)}
              </pre>
            </details>
          )}
        </div>
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
