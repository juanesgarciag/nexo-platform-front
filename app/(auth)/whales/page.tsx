"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { WhaleAgg, ScoreAgg } from "@/lib/types";
import { formatUsd } from "@/lib/format";
import { SCORE_META, getScoreMeta, truncateAddr } from "@/lib/whales";

type StatusFilter = "closed" | "open" | "all";
type SortKey =
  | "whale"
  | "priority"
  | "trades"
  | "wl"
  | "wr"
  | "invertido"
  | "pnl";

function pnlColor(v: string | number | null | undefined): string {
  const n = v == null ? 0 : Number(v);
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-neutral-300";
}

export default function WhalesPage() {
  const [status, setStatus] = useState<StatusFilter>("closed");
  const [sortKey, setSortKey] = useState<SortKey>("pnl");
  const [sortDesc, setSortDesc] = useState(true);

  const byWhaleQ = useQuery({
    queryKey: ["whales-by-whale", status],
    queryFn: () =>
      apiFetch<WhaleAgg[]>(`/api/whales/by-whale?status=${status}`),
    refetchInterval: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const byScoreQ = useQuery({
    queryKey: ["whales-by-score", status],
    queryFn: () =>
      apiFetch<ScoreAgg[]>(`/api/whales/by-score?status=${status}`),
    refetchInterval: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const scoresByNum = useMemo(() => {
    const map = new Map<number, ScoreAgg>();
    (byScoreQ.data ?? []).forEach((s) => map.set(Number(s.score), s));
    return map;
  }, [byScoreQ.data]);

  const sortedWhales = useMemo(() => {
    const rows = [...(byWhaleQ.data ?? [])];
    rows.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "whale":
          av = a.whale_name ?? a.whale_addr;
          bv = b.whale_name ?? b.whale_addr;
          break;
        case "priority":
          av = a.is_priority ? 1 : 0;
          bv = b.is_priority ? 1 : 0;
          break;
        case "trades":
          av = a.trades;
          bv = b.trades;
          break;
        case "wl":
          av = a.wins - a.losses;
          bv = b.wins - b.losses;
          break;
        case "wr":
          av = a.win_rate;
          bv = b.win_rate;
          break;
        case "invertido":
          av = Number(a.capital_invertido);
          bv = Number(b.capital_invertido);
          break;
        case "pnl":
          av = Number(a.pnl_real ?? a.pnl_bruto ?? 0);
          bv = Number(b.pnl_real ?? b.pnl_bruto ?? 0);
          break;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      return sortDesc
        ? Number(bv) - Number(av)
        : Number(av) - Number(bv);
    });
    return rows;
  }, [byWhaleQ.data, sortKey, sortDesc]);

  function toggleSort(k: SortKey) {
    if (k === sortKey) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(k);
      setSortDesc(true);
    }
  }

  function sortArrow(k: SortKey) {
    if (k !== sortKey) return "";
    return sortDesc ? " ↓" : " ↑";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <h1 className="text-2xl font-semibold">Whales &amp; Scoring</h1>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Status:</span>
          {(["closed", "open", "all"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-md border ${
                status === s
                  ? "border-neutral-600 bg-neutral-800 text-white"
                  : "border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Por Score */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400">
          Por Score
        </h2>
        {byScoreQ.isLoading ? (
          <div className="text-sm text-neutral-500 py-6 text-center">
            Cargando…
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((sc) => {
              const meta = SCORE_META[sc];
              const agg = scoresByNum.get(sc);
              const empty = !agg || agg.trades === 0;
              const pnl = agg?.pnl_real ?? agg?.pnl_bruto ?? null;
              return (
                <div
                  key={sc}
                  className={`rounded-xl border ${meta.border} ${meta.bg} p-3 ${
                    empty ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-sm font-semibold ${meta.color}`}>
                      {meta.emoji} {meta.label}
                    </div>
                    <div className={`text-xs font-mono ${meta.color}`}>
                      {sc}
                    </div>
                  </div>
                  {empty ? (
                    <div className="text-xs text-neutral-600">Sin datos</div>
                  ) : (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Trades</span>
                        <span className="font-mono">{agg!.trades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">W / L</span>
                        <span className="font-mono">
                          <span className="text-emerald-400/80">
                            {agg!.wins}
                          </span>
                          <span className="text-neutral-600"> / </span>
                          <span className="text-red-400/80">
                            {agg!.losses}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Win rate</span>
                        <span className="font-mono">
                          {Number(agg!.win_rate).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Invertido</span>
                        <span className="font-mono">
                          {formatUsd(agg!.capital_invertido)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">PnL real</span>
                        <span className={`font-mono ${pnlColor(pnl)}`}>
                          {pnl == null ? "—" : formatUsd(pnl)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Por Ballena */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400">
          Por Ballena
        </h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          {byWhaleQ.isLoading ? (
            <div className="text-sm text-neutral-500 py-6 text-center">
              Cargando…
            </div>
          ) : sortedWhales.length === 0 ? (
            <div className="text-sm text-neutral-500 py-6 text-center">
              Sin ballenas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                    <th
                      className="text-left py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("whale")}
                    >
                      Ballena{sortArrow("whale")}
                    </th>
                    <th
                      className="text-center py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("priority")}
                    >
                      Prio{sortArrow("priority")}
                    </th>
                    <th
                      className="text-right py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("trades")}
                    >
                      Trades{sortArrow("trades")}
                    </th>
                    <th
                      className="text-right py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("wl")}
                    >
                      W / L{sortArrow("wl")}
                    </th>
                    <th
                      className="text-right py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("wr")}
                    >
                      WR%{sortArrow("wr")}
                    </th>
                    <th
                      className="text-right py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("invertido")}
                    >
                      Invertido{sortArrow("invertido")}
                    </th>
                    <th
                      className="text-right py-2 px-2 font-normal cursor-pointer select-none"
                      onClick={() => toggleSort("pnl")}
                    >
                      PnL real{sortArrow("pnl")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWhales.map((w) => {
                    const pnl = w.pnl_real ?? w.pnl_bruto;
                    return (
                      <tr
                        key={w.whale_addr}
                        className={`border-b border-neutral-900 hover:bg-neutral-900/50 ${
                          w.is_priority
                            ? "border-l-2 border-l-yellow-500/60"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-2">
                          <div className="flex flex-col">
                            <span className="text-neutral-200">
                              {w.whale_name ?? "—"}
                            </span>
                            <span
                              className="text-[10px] font-mono text-neutral-500"
                              title={w.whale_addr}
                            >
                              {truncateAddr(w.whale_addr)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {w.is_priority ? (
                            <span
                              className="text-yellow-400"
                              title="Priority whale"
                            >
                              ⭐
                            </span>
                          ) : (
                            <span className="text-neutral-700">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {w.trades}
                          {w.open > 0 && (
                            <span
                              className="text-[10px] text-blue-400/80 ml-1"
                              title={`${w.open} abiertas`}
                            >
                              (+{w.open})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          <span className="text-emerald-400/80">{w.wins}</span>
                          <span className="text-neutral-600"> / </span>
                          <span className="text-red-400/80">{w.losses}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {Number(w.win_rate).toFixed(0)}%
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {formatUsd(w.capital_invertido)}
                        </td>
                        <td
                          className={`py-2 px-2 text-right font-mono ${pnlColor(pnl)}`}
                          title={`bruto bot: ${formatUsd(w.pnl_bruto)}`}
                        >
                          {pnl == null ? "—" : formatUsd(pnl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
