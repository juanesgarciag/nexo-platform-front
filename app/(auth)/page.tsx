"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  ClosedPositionBrief,
  PnlSummary,
  RedeemablesData,
  WalletHistoryPoint,
  WalletSnapshot,
} from "@/lib/types";
import StatCard from "@/components/StatCard";
import PnlChart from "@/components/PnlChart";
import WalletBreakdown from "@/components/WalletBreakdown";
import WalletHistoryChart from "@/components/WalletHistoryChart";
import { formatDate, formatPct, formatUsd } from "@/lib/format";

function truncate(s: string | null, n = 60): string {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function pnlColor(v: string | number | null | undefined): string {
  const n = v == null ? 0 : Number(v);
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-neutral-300";
}

function ClosedTable({
  rows,
  tone,
  showDate = false,
}: {
  rows: ClosedPositionBrief[];
  tone?: "positive" | "negative";
  showDate?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="text-sm text-neutral-500 py-6 text-center">
        Sin datos
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
            <th className="text-left py-2 px-2 font-normal">Pregunta</th>
            <th className="text-left py-2 px-2 font-normal">Outcome</th>
            <th className="text-right py-2 px-2 font-normal">PnL</th>
            <th className="text-right py-2 px-2 font-normal">%</th>
            <th className="text-left py-2 px-2 font-normal">Categoría</th>
            {showDate && (
              <th className="text-left py-2 px-2 font-normal">Fecha</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const color =
              tone === "positive"
                ? "text-emerald-400"
                : tone === "negative"
                ? "text-red-400"
                : pnlColor(r.pnl_usdc);
            return (
              <tr
                key={`${r.condition_id}-${i}`}
                className="border-b border-neutral-900 hover:bg-neutral-900/50"
              >
                <td className="py-2 px-2 max-w-xs truncate" title={r.pregunta ?? ""}>
                  {truncate(r.pregunta, 50)}
                </td>
                <td className="py-2 px-2 text-neutral-400">{r.outcome ?? "—"}</td>
                <td className={`py-2 px-2 text-right font-mono ${color}`}>
                  {formatUsd(r.pnl_usdc)}
                </td>
                <td className={`py-2 px-2 text-right font-mono ${color}`}>
                  {formatPct(r.pnl_pct)}
                </td>
                <td className="py-2 px-2 text-neutral-400">{r.categoria ?? "—"}</td>
                {showDate && (
                  <td className="py-2 px-2 text-neutral-400 whitespace-nowrap">
                    {formatDate(r.ts_salida)}
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

export default function DashboardPage() {
  const summary = useQuery({
    queryKey: ["pnl-summary"],
    queryFn: () => apiFetch<PnlSummary>("/api/pnl/summary"),
    refetchInterval: 10000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const wallet = useQuery({
    queryKey: ["wallet-snapshot"],
    queryFn: () => apiFetch<WalletSnapshot>("/api/wallet/snapshot"),
    refetchInterval: 5000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const redeemables = useQuery({
    queryKey: ["redeemables"],
    queryFn: () => apiFetch<RedeemablesData>("/api/wallet/redeemables"),
    refetchInterval: 30000,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const walletHistory = useQuery({
    queryKey: ["wallet-history", 30],
    queryFn: () =>
      apiFetch<WalletHistoryPoint[]>("/api/wallet/history?days=30"),
    refetchInterval: 60000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const s = summary.data;
  const w = wallet.data;
  const realizedPnl = s?.realized_pnl != null ? Number(s.realized_pnl) : 0;
  const netPnl = s?.net_real_pnl != null ? Number(s.net_real_pnl) : null;
  const capitalNeto = s?.capital_neto != null ? Number(s.capital_neto) : 0;
  const winRate = s ? Number(s.win_rate) : 0;
  const trades = s?.trades_total ?? 0;
  const wins = Math.round((winRate / 100) * trades);

  const walletTotalNum = w ? Number(w.total) : 0;
  const fetchedAt = w?.fetched_at ? new Date(w.fetched_at) : null;
  const fetchedTime = fetchedAt && !Number.isNaN(fetchedAt.getTime())
    ? fetchedAt.toLocaleTimeString()
    : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-gradient-to-br from-emerald-950/40 to-neutral-900 border border-emerald-900/60 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wide text-emerald-400">
                Saldo real
              </div>
              <div className="mt-2 text-4xl font-semibold text-emerald-300">
                {wallet.isLoading && !w
                  ? "Cargando…"
                  : w && walletTotalNum > 0
                  ? formatUsd(w.total)
                  : "—"}
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                <span className="text-blue-300">On-chain {formatUsd(w?.total_cash)}</span>
                {" · "}
                <span className="text-emerald-300">Polymarket {formatUsd(w?.total_polymarket_cash)}</span>
                {" · "}
                <span className="text-yellow-300">Posiciones {formatUsd(w?.total_position_value)}</span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                actualizado: {fetchedTime}
                {wallet.isFetching && w ? " (refrescando…)" : ""}
              </div>
            </div>
          </div>
          {w?.accounts && (
            <WalletBreakdown
              accounts={w.accounts}
              fetchedAt={w.fetched_at}
              isFetching={wallet.isFetching}
            />
          )}
        </section>

        <section
          className={`rounded-xl p-5 border ${
            s?.net_real_pnl != null && Number(s.net_real_pnl) >= 0
              ? "bg-gradient-to-br from-emerald-950/40 to-neutral-900 border-emerald-900/60"
              : "bg-gradient-to-br from-red-950/40 to-neutral-900 border-red-900/60"
          }`}
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400">
            Ganancia / pérdida real
          </div>
          <div
            className={`mt-2 text-4xl font-semibold ${
              s?.net_real_pnl != null && Number(s.net_real_pnl) >= 0
                ? "text-emerald-300"
                : "text-red-300"
            }`}
          >
            {s?.net_real_pnl != null ? formatUsd(s.net_real_pnl) : "—"}
          </div>
          <div
            className={`text-sm mt-1 ${
              s?.net_real_pnl_pct != null && Number(s.net_real_pnl_pct) >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {s?.net_real_pnl_pct != null ? formatPct(s.net_real_pnl_pct) : "—"}
          </div>
          <div className="text-xs text-neutral-400 mt-3 space-y-0.5">
            <div>
              Capital aportado:{" "}
              <span className="text-neutral-200">
                {formatUsd(s?.capital_neto)}
              </span>
            </div>
            <div>
              Depositado: {formatUsd(s?.deposits_total)}{" "}
              {Number(s?.withdrawals_total ?? 0) > 0 && (
                <>· Retirado: {formatUsd(s?.withdrawals_total)}</>
              )}
            </div>
            <div className="text-[10px] text-neutral-500 pt-1">
              wallet actual − capital aportado
            </div>
          </div>
        </section>
      </div>

      {(() => {
        const rd = redeemables.data;
        const totalRedeem = Number(rd?.total_redeemable ?? 0);
        if (totalRedeem <= 0) return null;
        return (
          <div className="rounded-xl border border-amber-800/60 bg-gradient-to-br from-amber-950/30 to-neutral-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-amber-400">
                  Listo para cobrar
                </div>
                <div className="text-2xl font-semibold text-amber-300 mt-1">
                  {formatUsd(rd?.total_redeemable)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  Ya incluido en &quot;Posiciones&quot; — al reclamar pasa a cash disponible
                </div>
              </div>
              {Number(rd?.total_mergeable ?? 0) > 0 && (
                <div className="text-right">
                  <div className="text-[10px] text-neutral-500 uppercase">
                    Mergeable
                  </div>
                  <div className="text-sm text-neutral-300">
                    {formatUsd(rd?.total_mergeable)}
                  </div>
                </div>
              )}
            </div>
            {rd?.accounts && (
              <div className="mt-3 space-y-1.5">
                {rd.accounts.map((acc) =>
                  acc.redeemable.length > 0 ? (
                    <details
                      key={acc.label}
                      className="rounded border border-neutral-800 bg-neutral-900/40"
                    >
                      <summary className="cursor-pointer px-3 py-1.5 text-xs text-neutral-300">
                        {acc.label.toUpperCase()} — {acc.redeemable.length} posiciones,{" "}
                        {formatUsd(acc.redeemable_total)}
                      </summary>
                      <div className="px-3 pb-2 space-y-0.5">
                        {acc.redeemable.map((p, i) => (
                          <div
                            key={i}
                            className="text-[11px] flex justify-between text-neutral-400"
                          >
                            <span className="truncate max-w-[70%]">
                              {p.outcome} · {p.title}
                            </span>
                            <span className="text-amber-300 font-mono">
                              {formatUsd(p.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null
                )}
              </div>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Balance USDC"
          value={formatUsd(s?.wallet_cash ?? null)}
          hint="cash on-chain"
        />
        <StatCard
          label="Valor posiciones"
          value={formatUsd(s?.wallet_positions_value ?? null)}
          hint="MTM real"
        />
        <StatCard
          label="PnL neto real"
          value={netPnl != null ? formatUsd(netPnl) : "—"}
          hint={
            s?.net_real_pnl_pct != null
              ? `${formatPct(s.net_real_pnl_pct)} · wallet − capital`
              : "wallet − capital aportado"
          }
          tone={
            netPnl == null ? undefined : netPnl >= 0 ? "positive" : "negative"
          }
        />
        <StatCard
          label="Win rate"
          value={s ? `${winRate.toLocaleString(undefined, { maximumFractionDigits: 1 })}%` : "—"}
          hint={s ? `${wins} / ${trades} resueltos` : ""}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">
            PnL bruto rotaciones
          </div>
          <div
            className={`text-sm font-medium mt-0.5 ${
              realizedPnl >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatUsd(s?.realized_pnl ?? null)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            Σ pnl_usdc cerrados ({trades})
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">
            Capital aportado
          </div>
          <div className="text-sm font-medium mt-0.5 text-neutral-200">
            {formatUsd(s?.capital_neto)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            depósitos − retiros
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">
            Saldo wallet
          </div>
          <div className="text-sm font-medium mt-0.5 text-neutral-200">
            {formatUsd(s?.wallet_total)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            cash + posiciones
          </div>
        </div>
      </div>

      <WalletHistoryChart data={walletHistory.data ?? []} />

      <PnlChart data={s?.history ?? []} capitalNeto={capitalNeto} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm uppercase tracking-wide text-emerald-400 mb-3">
            Top winners
          </h2>
          <ClosedTable rows={s?.top_winners ?? []} tone="positive" />
        </section>
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm uppercase tracking-wide text-red-400 mb-3">
            Top losers
          </h2>
          <ClosedTable rows={s?.top_losers ?? []} tone="negative" />
        </section>
      </div>

      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400 mb-3">
          Recientes cerradas
        </h2>
        <ClosedTable rows={s?.recent_closed ?? []} showDate />
      </section>
    </div>
  );
}
