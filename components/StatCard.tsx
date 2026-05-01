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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
      {hint && <div className="text-xs text-neutral-500 mt-1">{hint}</div>}
    </div>
  );
}
