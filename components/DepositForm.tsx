"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export default function DepositForm() {
  const qc = useQueryClient();
  const [tipo, setTipo] = useState<"deposito" | "retiro">("deposito");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [nota, setNota] = useState("");
  const [txHash, setTxHash] = useState("");

  const mut = useMutation({
    mutationFn: async () =>
      apiFetch("/api/deposits", {
        method: "POST",
        body: JSON.stringify({
          tipo,
          cantidad: Number(cantidad),
          fecha: new Date(fecha).toISOString(),
          nota: nota || null,
          tx_hash: txHash || null,
        }),
      }),
    onSuccess: () => {
      setCantidad("");
      setNota("");
      setTxHash("");
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["pnl-summary"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cantidad) return;
    mut.mutate();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-3"
    >
      <div className="text-sm font-medium">New manual deposit</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs text-neutral-400">
          Tipo
          <select
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value as "deposito" | "retiro")
            }
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          >
            <option value="deposito">Depósito</option>
            <option value="retiro">Retiro</option>
          </select>
        </label>
        <label className="text-xs text-neutral-400">
          Cantidad (USDC)
          <input
            type="number"
            step="0.01"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
            required
          />
        </label>
        <label className="text-xs text-neutral-400">
          Fecha
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
            required
          />
        </label>
        <label className="text-xs text-neutral-400">
          Tx hash (opcional)
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          />
        </label>
      </div>
      <label className="block text-xs text-neutral-400">
        Nota
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
        />
      </label>
      {mut.error && (
        <div className="text-xs text-red-400">
          {(mut.error as Error).message}
        </div>
      )}
      <button
        type="submit"
        disabled={mut.isPending}
        className="bg-white text-black text-sm font-medium rounded px-3 py-1.5 disabled:opacity-50"
      >
        {mut.isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
