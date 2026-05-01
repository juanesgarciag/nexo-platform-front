"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, apiFetchWithMeta } from "@/lib/api";
import { Position } from "@/lib/types";
import PositionsTable from "@/components/PositionsTable";
import PositionDetailModal from "@/components/PositionDetailModal";
import Pagination from "@/components/Pagination";

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

type Tab = "open" | "pending_redeem" | "closed" | "all";

const TAB_LABELS: Record<Tab, string> = {
  open: "Open",
  pending_redeem: "Sin redimir",
  closed: "Closed",
  all: "All",
};

export default function PositionsPage() {
  const [tab, setTab] = useState<Tab>("open");
  const [categoria, setCategoria] = useState("");
  const [confianza, setConfianza] = useState("");
  const [hasPnl, setHasPnl] = useState<"" | "yes" | "no">("");
  const [modo, setModo] = useState<"" | "live_binary" | "hedge">("");
  const [page, setPage] = useState(0);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const limit = 50;

  useEffect(() => {
    setPage(0);
  }, [tab, categoria, confianza, hasPnl, modo]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("status", tab);
    if (categoria) p.set("categoria", categoria);
    if (confianza) p.set("confianza", confianza);
    if (hasPnl) p.set("has_pnl", hasPnl);
    if (modo === "live_binary") {
      p.set("portfolio_mode", "live_binary");
    } else if (modo === "hedge") {
      p.set("hedge_opened", "true");
    }
    p.set("limit", String(limit));
    p.set("offset", String(page * limit));
    return p.toString();
  }, [tab, categoria, confianza, hasPnl, modo, page]);

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

  function clearFilters() {
    setCategoria("");
    setConfianza("");
    setHasPnl("");
    setModo("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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

      <div className="flex gap-2">
        {(["open", "pending_redeem", "closed", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-md border ${
              tab === t
                ? "bg-neutral-800 border-neutral-700"
                : "border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
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

      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <PositionsTable positions={data?.data ?? []} onSelect={setSelectedPositionId} livePrices={liveQ.data ?? {}} />
      )}

      <Pagination
        page={page}
        pageSize={limit}
        total={data?.total ?? null}
        onChange={setPage}
      />

      <PositionDetailModal
        positionId={selectedPositionId}
        onClose={() => setSelectedPositionId(null)}
      />
    </div>
  );
}
