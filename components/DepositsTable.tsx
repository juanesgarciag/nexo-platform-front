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
      <div className="text-sm text-neutral-500 py-8 text-center">
        No deposits.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th className="text-left px-3 py-2">Fecha</th>
            <th className="text-left px-3 py-2">Source</th>
            <th className="text-left px-3 py-2">Tipo</th>
            <th className="text-right px-3 py-2">Cantidad</th>
            <th className="text-left px-3 py-2">Nota</th>
            <th className="text-left px-3 py-2">Tx</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((d) => (
            <tr
              key={d.id}
              className="border-t border-neutral-800 hover:bg-neutral-900/50"
            >
              <td className="px-3 py-2 whitespace-nowrap">
                {formatDate(d.fecha)}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    d.source === "auto"
                      ? "bg-blue-950 text-blue-300 border border-blue-900"
                      : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                  }`}
                >
                  {d.source}
                </span>
              </td>
              <td className="px-3 py-2">{d.tipo}</td>
              <td
                className={`px-3 py-2 text-right ${
                  d.tipo === "deposito"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {d.tipo === "deposito" ? "+" : "-"}
                {formatUsd(d.cantidad_usdc)}
              </td>
              <td className="px-3 py-2">{d.nota ?? "—"}</td>
              <td className="px-3 py-2">
                {d.tx_hash ? (
                  <a
                    href={`https://polygonscan.com/tx/${d.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline text-xs"
                  >
                    {d.tx_hash.slice(0, 8)}…
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {d.source === "manual" && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this deposit?")) del.mutate(d.id);
                    }}
                    className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-red-900"
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
