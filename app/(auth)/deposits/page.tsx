"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Deposit, PnlSummary } from "@/lib/types";
import DepositsTable from "@/components/DepositsTable";
import DepositForm from "@/components/DepositForm";
import StatCard from "@/components/StatCard";
import { formatPct, formatUsd } from "@/lib/format";

export default function DepositsPage() {
  const deposits = useQuery({
    queryKey: ["deposits"],
    queryFn: () => apiFetch<Deposit[]>("/api/deposits"),
  });

  const summary = useQuery({
    queryKey: ["pnl-summary"],
    queryFn: () => apiFetch<PnlSummary>("/api/pnl/summary"),
    refetchInterval: 30000,
  });

  const s = summary.data;
  const netPnl = s?.net_real_pnl != null ? Number(s.net_real_pnl) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Depósitos / Retiros</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total depositado"
          value={formatUsd(s?.deposits_total)}
          hint="capital aportado"
        />
        <StatCard
          label="Total retirado"
          value={formatUsd(s?.withdrawals_total)}
          hint="capital sacado"
        />
        <StatCard
          label="Capital neto"
          value={formatUsd(s?.capital_neto)}
          hint="depositos − retiros"
        />
        <StatCard
          label="Ganancia real"
          value={netPnl != null ? formatUsd(netPnl) : "—"}
          hint={
            s?.net_real_pnl_pct != null
              ? `${formatPct(s.net_real_pnl_pct)} · wallet − capital`
              : "wallet − capital"
          }
          tone={
            netPnl == null
              ? undefined
              : netPnl >= 0
              ? "positive"
              : "negative"
          }
        />
      </div>

      <DepositForm />

      {deposits.isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <DepositsTable deposits={deposits.data ?? []} />
      )}
    </div>
  );
}
