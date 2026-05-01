"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { BotParams } from "@/lib/types";

const FIELDS: Array<keyof BotParams> = [
  "TAKE_PROFIT_X",
  "STOP_LOSS_PCT",
  "MAX_ENTRADA",
  "MAX_DIARIO",
  "MAX_POSICIONES",
  "MAX_POR_CATEGORIA",
  "MIN_SCORE",
  "PRECIO_MIN",
  "PRECIO_MAX",
  "MIN_LIQUIDEZ",
  "TRAILING_STOP_PCT",
  "TRAILING_MIN_PROFIT_PCT",
  "MAX_POR_MERCADO",
];

const LABELS: Partial<Record<keyof BotParams, string>> = {
  TRAILING_STOP_PCT: "Trailing Stop %",
  TRAILING_MIN_PROFIT_PCT: "Trailing Min Profit %",
  MAX_POR_MERCADO: "Max por mercado $",
};

export default function ParamsEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["control-params"],
    queryFn: async () => {
      try {
        return await apiFetch<BotParams>("/api/control/params");
      } catch {
        return {} as BotParams;
      }
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const v: Record<string, string> = {};
    for (const k of FIELDS) {
      const val = (data as Record<string, unknown>)[k];
      v[k] = val !== undefined && val !== null ? String(val) : "";
    }
    setValues(v);
  }, [data]);

  const mut = useMutation({
    mutationFn: async (payload: Partial<BotParams>) =>
      apiFetch("/api/control/params", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["control-params"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: Partial<BotParams> = {};
    for (const k of FIELDS) {
      const raw = values[k];
      if (raw === "" || raw === undefined) continue;
      const num = Number(raw);
      if (!Number.isNaN(num)) {
        (payload as Record<string, number>)[k] = num;
      }
    }
    mut.mutate(payload);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4"
    >
      <div className="text-sm font-medium">Bot params</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map((k) => (
          <label key={k} className="text-xs text-neutral-400">
            {LABELS[k] ?? k}
            <input
              type="number"
              step="any"
              value={values[k] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [k]: e.target.value }))
              }
              className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-neutral-100"
            />
          </label>
        ))}
      </div>
      {mut.error && (
        <div className="text-xs text-red-400">
          {(mut.error as Error).message}
        </div>
      )}
      {mut.isSuccess && (
        <div className="text-xs text-emerald-400">Saved.</div>
      )}
      <button
        type="submit"
        disabled={mut.isPending}
        className="bg-white text-black text-sm font-medium rounded px-3 py-1.5 disabled:opacity-50"
      >
        {mut.isPending ? "Saving…" : "Save params"}
      </button>
    </form>
  );
}
