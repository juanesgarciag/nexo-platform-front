"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetchWithMeta } from "@/lib/api";
import { Trade } from "@/lib/types";
import TradesTable from "@/components/TradesTable";
import Pagination from "@/components/Pagination";

export default function TradesPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [resultado, setResultado] = useState("");
  const [confianza, setConfianza] = useState("");
  const [hasPnl, setHasPnl] = useState<"" | "yes" | "no">("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  // Debounce search 250ms
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [from, to, categoria, resultado, confianza, hasPnl, searchDebounced]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set("from", new Date(from).toISOString());
    if (to) p.set("to", new Date(to).toISOString());
    if (categoria) p.set("categoria", categoria);
    if (resultado) p.set("resultado", resultado);
    if (confianza) p.set("confianza", confianza);
    if (hasPnl) p.set("has_pnl", hasPnl);
    if (searchDebounced) p.set("pregunta", searchDebounced);
    p.set("limit", String(limit));
    p.set("offset", String(page * limit));
    return p.toString();
  }, [from, to, categoria, resultado, confianza, hasPnl, searchDebounced, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["trades", params],
    queryFn: () => apiFetchWithMeta<Trade[]>(`/api/trades?${params}`),
  });

  function clearFilters() {
    setFrom("");
    setTo("");
    setCategoria("");
    setResultado("");
    setConfianza("");
    setHasPnl("");
    setSearch("");
  }

  function exportCsv() {
    const rows = data?.data ?? [];
    const headers = [
      "id",
      "ts",
      "tipo",
      "outcome",
      "precio",
      "cantidad",
      "pnl_pct",
      "categoria",
      "confianza",
      "razon",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((t) =>
        headers
          .map((h) => {
            const v = (t as Record<string, unknown>)[h];
            if (v === null || v === undefined) return "";
            const s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trades</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-sm bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5"
          >
            Limpiar filtros
          </button>
          <button
            onClick={exportCsv}
            className="text-sm bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pregunta… (ej: Barcelona, Bitcoin, Will Real Madrid)"
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 pl-10 outline-none focus:border-neutral-600 text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
          🔎
        </span>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs px-2 py-1 rounded"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <label className="text-xs text-neutral-400">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          />
        </label>
        <label className="text-xs text-neutral-400">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          />
        </label>
        <label className="text-xs text-neutral-400">
          Categoría
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          />
        </label>
        <label className="text-xs text-neutral-400">
          Resultado
          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          >
            <option value="">all</option>
            <option value="win">win</option>
            <option value="loss">loss</option>
          </select>
        </label>
        <label className="text-xs text-neutral-400">
          Confianza
          <input
            type="text"
            value={confianza}
            onChange={(e) => setConfianza(e.target.value)}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          />
        </label>
        <label className="text-xs text-neutral-400">
          PnL
          <select
            value={hasPnl}
            onChange={(e) => setHasPnl(e.target.value as "" | "yes" | "no")}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          >
            <option value="">all</option>
            <option value="yes">con PnL</option>
            <option value="no">sin PnL</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <TradesTable trades={data?.data ?? []} />
      )}

      <Pagination
        page={page}
        pageSize={limit}
        total={data?.total ?? null}
        onChange={setPage}
      />
    </div>
  );
}
