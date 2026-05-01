"use client";

import { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
      ? "text-red-400"
      : "text-neutral-100";
  return (
    <div className="glass-panel p-5">
      <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
        {label}
      </div>
      <div
        className={`mt-2 text-2xl font-medium tracking-tight tabular-nums ${toneClass}`}
      >
        {value}
      </div>
      {hint && (
        <div className="text-xs text-neutral-500 mt-1.5 tabular-nums">
          {hint}
        </div>
      )}
    </div>
  );
}
