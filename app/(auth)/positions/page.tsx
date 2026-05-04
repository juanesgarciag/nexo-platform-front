"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, apiFetchWithMeta } from "@/lib/api";
import { Position, HedgedPositions } from "@/lib/types";
import PositionsTable from "@/components/PositionsTable";
import PositionDetailModal from "@/components/PositionDetailModal";
import Pagination from "@/components/Pagination";
import { formatNum, formatUsd } from "@/lib/format";

export type LivePriceMap = Record<
  string,
  {
    curPrice: number | null;
    currentValue: number | null;
    cashPnl: number | null;
    percentPnl: number | null;
    endDate: string | null;
    size: number | null;
    title: string | null;
    outcome: string | null;
  }
>;

type Tab = "open" | "pending_redeem" | "closed" | "hedged" | "all";

const TAB_LABELS: Record<Tab, string> = {
  open: "Open",
  pending_redeem: "Sin redimir",
  closed: "Closed",
  hedged: "Hedged",
  all: "All",
};

export default function PositionsPage() {
  const [tab, setTab] = useState<Tab>("open");
  const [categoria, setCategoria] = useState("");
  const [confianza, setConfianza] = useState("");
  const [hasPnl, setHasPnl] = useState<"" | "yes" | "no">("");
  const [modo, setModo] = useState<"" | "live_binary" | "hedge">("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [sortBy, setSortBy] = useState<"ts_entrada" | "pregunta" | "outcome" | "pnl_usdc" | "end_date">("ts_entrada");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const limit = 50;

  // Debounce search 250ms para no spamear el back en cada tecla
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [tab, categoria, confianza, hasPnl, modo, searchDebounced]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", tab);
    if (categoria) p.set("categoria", categoria);
    if (confianza) p.set("confianza", confianza);
    if (hasPnl) p.set("has_pnl", hasPnl);
    if (searchDebounced) p.set("pregunta", searchDebounced);
    if (modo === "live_binary") {
      p.set("portfolio_mode", "live_binary");
    } else if (modo === "hedge") {
      p.set("hedge_opened", "true");
    }
    p.set("sort_by", sortBy);
    p.set("sort_dir", sortDir);
    p.set("limit", String(limit));
    p.set("offset", String(page * limit));
    return p.toString();
  }, [tab, categoria, confianza, hasPnl, modo, searchDebounced, sortBy, sortDir, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["positions", params],
    queryFn: () => apiFetchWithMeta<Position[]>(`/api/positions?${params}`),
    refetchInterval: 10000,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const liveQ = useQuery({
    queryKey: ["live-prices"],
    queryFn: () => apiFetch<LivePriceMap>("/api/positions/live/prices"),
    refetchInterval: 10000,
    refetchOnMount: "always",
    staleTime: 0,
    enabled: tab === "open" || tab === "all",
  });

  const hedgedQ = useQuery({
    queryKey: ["positions-hedged"],
    queryFn: () => apiFetch<HedgedPositions>("/api/positions/hedged"),
    refetchInterval: 10000,
    refetchOnMount: "always",
    staleTime: 0,
    enabled: tab === "hedged",
  });

  function clearFilters() {
    setCategoria("");
    setConfianza("");
    setHasPnl("");
    setModo("");
    setSearch("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Positions</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-sm bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-1.5"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
        {(["open", "pending_redeem", "closed", "hedged", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-sm rounded-md border ${
              tab === t
                ? "bg-neutral-800 border-neutral-700"
                : "border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
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
        <label className="text-xs text-neutral-400">
          Modo
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as "" | "live_binary" | "hedge")}
            className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5"
          >
            <option value="">all</option>
            <option value="live_binary">live binary</option>
            <option value="hedge">hedge</option>
          </select>
        </label>
      </div>

      {tab === "hedged" ? (
        hedgedQ.isLoading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : (
          <HedgedPairsView data={hedgedQ.data} onSelect={setSelectedPositionId} />
        )
      ) : (
        <>
          {isLoading ? (
            <div className="text-sm text-neutral-500">Loading…</div>
          ) : (
            <PositionsTable
              positions={data?.data ?? []}
              onSelect={setSelectedPositionId}
              livePrices={liveQ.data ?? {}}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={(by, dir) => {
                setSortBy(by);
                setSortDir(dir);
                setPage(0);
              }}
            />
          )}

          <Pagination
            page={page}
            pageSize={limit}
            total={data?.total ?? null}
            onChange={setPage}
          />
        </>
      )}

      <PositionDetailModal
        positionId={selectedPositionId}
        onClose={() => setSelectedPositionId(null)}
      />
    </div>
  );
}


function HedgedPairsView({
  data,
  onSelect,
}: {
  data?: HedgedPositions;
  onSelect: (id: number) => void;
}) {
  if (!data || data.total === 0) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center border border-neutral-800 rounded-xl">
        No hedge pairs detected.
      </div>
    );
  }

  const totalCombinedPnl = data.pairs.reduce(
    (s, p) => s + Number(p.combined_pnl_usdc ?? 0),
    0
  );
  const totalCombinedInv = data.pairs.reduce(
    (s, p) => s + Number(p.combined_invertido ?? 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
          <div className="text-xs text-neutral-400">Pares hedge</div>
          <div className="text-2xl font-mono">{data.total}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
          <div className="text-xs text-neutral-400">Capital invertido</div>
          <div className="text-2xl font-mono">{formatUsd(totalCombinedInv)}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
          <div className="text-xs text-neutral-400">P&L combinado</div>
          <div
            className={`text-2xl font-mono ${
              totalCombinedPnl >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatUsd(totalCombinedPnl)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {data.pairs.map((pair) => {
          const pnl = Number(pair.combined_pnl_usdc ?? 0);
          const inv = Number(pair.combined_invertido ?? 0);
          const isImplicit = pair.hedge_key.startsWith("implicit:");
          return (
            <div
              key={pair.hedge_key}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {pair.primary.pregunta || "—"}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        isImplicit
                          ? "bg-amber-900/40 text-amber-300"
                          : "bg-emerald-900/40 text-emerald-300"
                      }`}
                    >
                      {isImplicit ? "implícito" : "explícito"}
                    </span>
                    <span className="text-neutral-600">
                      {pair.primary.condition_id.slice(0, 14)}…
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-neutral-400">
                    inv {formatUsd(inv)}
                  </div>
                  <div
                    className={`font-mono text-lg ${
                      pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatUsd(pnl)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SidePanel
                  label="Primary"
                  pos={pair.primary}
                  onSelect={() => onSelect(pair.primary.id)}
                />
                {pair.hedge ? (
                  <SidePanel
                    label="Hedge"
                    pos={pair.hedge}
                    onSelect={() => pair.hedge && onSelect(pair.hedge.id)}
                  />
                ) : (
                  <div className="border border-dashed border-neutral-800 rounded p-3 text-xs text-neutral-600 flex items-center justify-center">
                    sin par detectado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SidePanel({
  label,
  pos,
  onSelect,
}: {
  label: string;
  pos: Position;
  onSelect: () => void;
}) {
  const pnl = Number(pos.pnl_usdc ?? 0);
  return (
    <button
      onClick={onSelect}
      className="text-left border border-neutral-800 rounded p-3 hover:bg-neutral-800/40 transition"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
          {pos.outcome}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-neutral-500">Entrada</div>
          <div className="font-mono">{formatNum(pos.precio_entrada, 3)}</div>
        </div>
        <div>
          <div className="text-neutral-500">Actual</div>
          <div className="font-mono">
            {pos.precio_actual !== null ? formatNum(pos.precio_actual, 3) : "—"}
          </div>
        </div>
        <div>
          <div className="text-neutral-500">Invertido</div>
          <div className="font-mono">{formatUsd(pos.cantidad)}</div>
        </div>
        <div>
          <div className="text-neutral-500">PnL</div>
          <div
            className={`font-mono ${
              pnl >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatUsd(pnl)}
          </div>
        </div>
      </div>
    </button>
  );
}
