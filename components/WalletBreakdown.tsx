"use client";

import { useEffect, useRef, useState } from "react";
import { WalletAccount } from "@/lib/types";
import { formatUsd, formatNum } from "@/lib/format";

function useFlashOnChange<T>(value: T): boolean {
  const [flash, setFlash] = useState(false);
  const prev = useRef<T>(value);
  useEffect(() => {
    const a = JSON.stringify(prev.current);
    const b = JSON.stringify(value);
    if (a !== b) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return flash;
}

export default function WalletBreakdown({
  accounts,
  fetchedAt,
  isFetching,
}: {
  accounts: WalletAccount[];
  fetchedAt?: string;
  isFetching?: boolean;
}) {
  if (!accounts?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {accounts.map((a) => {
        const hasFunds =
          Number(a.cash_usdc || 0) > 0 ||
          Number(a.polymarket_cash || 0) > 0 ||
          Number(a.position_value || 0) > 0;
        return (
          <AccountCard
            key={a.label}
            account={a}
            hasFunds={hasFunds}
            isFetching={isFetching}
            fetchedAt={fetchedAt}
          />
        );
      })}
    </div>
  );
}

function AccountCard({
  account: a,
  hasFunds,
  isFetching,
  fetchedAt,
}: {
  account: WalletAccount;
  hasFunds: boolean;
  isFetching?: boolean;
  fetchedAt?: string;
}) {
  const flashTotal = useFlashOnChange(a.total);
  const flashCash = useFlashOnChange(a.cash_usdc);
  const flashPoly = useFlashOnChange(a.polymarket_cash);
  const flashPos = useFlashOnChange(a.position_value);
  const ts = fetchedAt ? new Date(fetchedAt) : null;
  const tsStr =
    ts && !Number.isNaN(ts.getTime()) ? ts.toLocaleTimeString() : "—";
  return (
    <div
      className={`bg-neutral-950/60 border rounded-lg p-3 ${
        hasFunds ? "border-neutral-700" : "border-neutral-800 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-neutral-500">
              {a.label === "eoa" ? "MetaMask (EOA)" : "Proxy (Safe)"}
            </span>
            {isFetching && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                title="actualizando…"
              />
            )}
          </div>
          <div className="text-xs text-neutral-500 truncate" title={a.address}>
            {a.address.slice(0, 6)}…{a.address.slice(-4)}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-sm font-semibold transition-colors duration-500 ${
              flashTotal ? "text-emerald-300" : "text-neutral-200"
            }`}
          >
            {formatUsd(a.total)}
          </div>
          <div className="text-[9px] text-neutral-600">{tsStr}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-neutral-900/60 rounded px-2 py-1.5">
          <div className="text-[9px] text-neutral-500 uppercase">On-chain</div>
          <div
            className={`font-mono transition-colors duration-500 ${
              flashCash ? "text-blue-200" : "text-blue-300"
            }`}
          >
            {formatUsd(a.cash_usdc)}
          </div>
        </div>
        <div className="bg-neutral-900/60 rounded px-2 py-1.5">
          <div className="text-[9px] text-neutral-500 uppercase">Polymarket</div>
          <div
            className={`font-mono transition-colors duration-500 ${
              flashPoly ? "text-emerald-200" : "text-emerald-300"
            }`}
          >
            {formatUsd(a.polymarket_cash)}
          </div>
        </div>
        <div className="bg-neutral-900/60 rounded px-2 py-1.5">
          <div className="text-[9px] text-neutral-500 uppercase">Posiciones</div>
          <div
            className={`font-mono transition-colors duration-500 ${
              flashPos ? "text-yellow-200" : "text-yellow-300"
            }`}
          >
            {formatUsd(a.position_value)}
          </div>
        </div>
      </div>
      {Number(a.matic || 0) > 0.01 && (
        <div className="text-[10px] text-neutral-500 mt-1.5">
          MATIC: {formatNum(a.matic, 2)}
        </div>
      )}
    </div>
  );
}
