"use client";

import { Deposit } from "@/lib/types";
import { formatDate, formatUsd } from "@/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export default function DepositsTable({ deposits }: { deposits: Deposit[] }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async (id: number) =>
      apiFetch(`/api/deposits/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["pnl-summary"] });
    },
  });

  if (!deposits.length) {
    return (
      <div className="glass-panel text-sm text-neutral-500 py-10 text-center">
        No deposits.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-x-auto scrollbar-thin -mx-4 sm:mx-0 rounded-none sm:rounded-xl">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium border-b border-white/5">
          <tr>
            <th className="text-left px-3 py-3">Fecha</th>
            <th className="text-left px-3 py-3">Source</th>
            <th className="text-left px-3 py-3">Tipo</th>
            <th className="text-right px-3 py-3">Cantidad</th>
            <th className="text-left px-3 py-3">Nota</th>
            <th className="text-left px-3 py-3">Tx</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((d) => (
            <tr
              key={d.id}
              className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
                {formatDate(d.fecha)}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    d.source === "auto"
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      : "bg-white/5 text-neutral-300 border-white/10"
                  }`}
                >
                  {d.source}
                </span>
              </td>
              <td className="px-3 py-2.5">{d.tipo}</td>
              <td
                className={`px-3 py-2.5 text-right tabular-nums ${
                  d.tipo === "deposito"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {d.tipo === "deposito" ? "+" : "-"}
                {formatUsd(d.cantidad_usdc)}
              </td>
              <td className="px-3 py-2.5 text-neutral-400">{d.nota ?? "—"}</td>
              <td className="px-3 py-2.5">
                {d.tx_hash ? (
                  <a
                    href={`https://polygonscan.com/tx/${d.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:text-accent-hover hover:underline text-xs tabular-nums"
                  >
                    {d.tx_hash.slice(0, 8)}…
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2.5 text-right">
                {d.source === "manual" && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this deposit?")) del.mutate(d.id);
                    }}
                    className="text-xs h-7 px-2.5 rounded-md border border-white/10 bg-white/5 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
