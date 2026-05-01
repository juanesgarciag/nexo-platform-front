"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { TurnoverDay } from "@/lib/types";
import StatCard from "@/components/StatCard";
import { formatNum, formatUsd } from "@/lib/format";

function pnlColor(v: string | number | null | undefined): string {
  const n = v == null ? 0 : Number(v);
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-neutral-300";
}

function formatFecha(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TurnoverPage() {
  const q = useQuery({
    queryKey: ["turnover-daily", 30],
    queryFn: () => apiFetch<TurnoverDay[]>("/api/turnover/daily?days=30"),
    refetchInterval: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const rows = q.data ?? [];

  const totals = rows.reduce(
    (acc, r) => {
      acc.num_trades += r.num_trades;
      acc.capital += Number(r.capital_invertido);
      acc.pnl += Number(r.pnl_realizado);
      acc.pnlReal += Number(r.pnl_real_dia ?? 0);
      acc.depositos += Number(r.deposito_neto_dia ?? 0);
      acc.wins += r.trades_ganados;
      acc.losses += r.trades_perdidos;
      if (r.vueltas != null) {
        acc.vueltasSum += Number(r.vueltas);
        acc.vueltasCount += 1;
      }
      return acc;
    },
    {
      num_trades: 0,
      capital: 0,
      pnl: 0,
      pnlReal: 0,
      depositos: 0,
      wins: 0,
      losses: 0,
      vueltasSum: 0,
      vueltasCount: 0,
    },
  );

  const vueltasAvg =
    totals.vueltasCount > 0 ? totals.vueltasSum / totals.vueltasCount : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Turnover</h1>

      <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3 text-xs text-amber-200/90">
        <strong>Nota:</strong> el ledger del bot infla los cierres porque
        re-cicla el mismo mercado varias veces por hora. El{" "}
        <em>PnL real día</em> está calibrado a la realidad on-chain
        (wallet − capital aportado) — los daily values mostrados son una
        estimación proporcional, no la suma cruda del bot. Pasa el cursor
        sobre cada celda para ver el valor bruto reportado.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Trades últimos 30d"
          value={totals.num_trades.toString()}
        />
        <StatCard
          label="Capital total movido"
          value={formatUsd(totals.capital)}
        />
        <StatCard
          label="PnL real 30d"
          value={formatUsd(totals.pnlReal)}
          hint="calibrado al wallet on-chain"
          tone={totals.pnlReal >= 0 ? "positive" : "negative"}
        />
      </div>

      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        {q.isLoading ? (
          <div className="text-sm text-neutral-500 py-6 text-center">
            Cargando…
          </div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-neutral-500 py-6 text-center">
            Sin datos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                  <th className="text-left py-2 px-2 font-normal">Fecha</th>
                  <th className="text-right py-2 px-2 font-normal"># trades</th>
                  <th
                    className="text-right py-2 px-2 font-normal"
                    title="Capital disponible al inicio del día (depósitos − retiros + PnL acumulado anterior)"
                  >
                    Cap. disponible
                  </th>
                  <th className="text-right py-2 px-2 font-normal">
                    Capital invertido
                  </th>
                  <th
                    className="text-right py-2 px-2 font-normal"
                    title="Calibrado al wallet on-chain. El PnL bruto del bot es inflado por re-ciclos del mismo mercado."
                  >
                    PnL real día
                  </th>
                  <th
                    className="text-right py-2 px-2 font-normal"
                    title="capital_invertido / cap_disponible"
                  >
                    Vueltas
                  </th>
                  <th className="text-right py-2 px-2 font-normal">
                    Depósito día
                  </th>
                  <th className="text-right py-2 px-2 font-normal">Wins</th>
                  <th className="text-right py-2 px-2 font-normal">Losses</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.fecha}
                    className="border-b border-neutral-900 hover:bg-neutral-900/50"
                  >
                    <td className="py-2 px-2 whitespace-nowrap">
                      {formatFecha(r.fecha)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {r.num_trades}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-400">
                      {formatUsd(r.capital_disponible)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {formatUsd(r.capital_invertido)}
                    </td>
                    <td
                      className={`py-2 px-2 text-right font-mono ${pnlColor(r.pnl_real_dia)}`}
                      title={
                        `bruto bot: ${formatUsd(r.pnl_realizado)}` +
                        (r.pnl_source === "snapshot"
                          ? " · fuente: snapshot on-chain"
                          : " · fuente: calibrado proporcional")
                      }
                    >
                      {r.pnl_real_dia == null ? "—" : formatUsd(r.pnl_real_dia)}
                      {r.pnl_source === "snapshot" && (
                        <span
                          className="ml-1 text-[9px] text-emerald-500"
                          title="exacto on-chain"
                        >
                          ●
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-300">
                      {r.vueltas == null ? "—" : `${formatNum(r.vueltas, 2)}x`}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-400/80">
                      {Number(r.deposito_neto_dia) === 0
                        ? "—"
                        : formatUsd(r.deposito_neto_dia)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-400/80">
                      {r.trades_ganados}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-red-400/80">
                      {r.trades_perdidos}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-neutral-700 bg-neutral-950/50 font-semibold">
                  <td className="py-2 px-2 uppercase text-xs text-neutral-400">
                    Total
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {totals.num_trades}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-neutral-500">
                    —
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatUsd(totals.capital)}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${pnlColor(totals.pnlReal)}`}
                    title={`bruto bot: ${formatUsd(totals.pnl)}`}
                  >
                    {formatUsd(totals.pnlReal)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-neutral-300">
                    {vueltasAvg == null ? "—" : `${formatNum(vueltasAvg, 2)}x avg`}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400/80">
                    {formatUsd(totals.depositos)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-emerald-400/80">
                    {totals.wins}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-red-400/80">
                    {totals.losses}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
