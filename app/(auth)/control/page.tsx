"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ParamsEditor from "@/components/ParamsEditor";

type PauseState = {
  paused: boolean;
  reason?: string | null;
  since?: string | null;
};

export default function ControlPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["control-state"],
    queryFn: () => apiFetch<PauseState>("/api/control/state"),
    refetchInterval: 15000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const pause = useMutation({
    mutationFn: () => apiFetch("/api/control/pause", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["control-state"] }),
  });
  const resume = useMutation({
    mutationFn: () => apiFetch("/api/control/resume", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["control-state"] }),
  });

  const paused = data?.paused;
  const reason = data?.reason ?? null;
  const since = data?.since ?? null;
  const sinceFormatted = since ? new Date(since).toLocaleString() : null;
  const reasonKind: "auto" | "manual" | "other" | null = reason
    ? reason.startsWith("Auto-pausado")
      ? "auto"
      : reason.toLowerCase().includes("manual")
      ? "manual"
      : "other"
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Control</h1>

      <div className="glass-panel p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                isLoading || isError || !data
                  ? "bg-neutral-500"
                  : paused
                  ? "bg-amber-400"
                  : "bg-emerald-400 shadow-[0_0_10px_currentColor]"
              }`}
            />
            <div>
              <div className="text-sm font-medium">
                {isLoading
                  ? "Consultando bot…"
                  : isError || !data
                  ? "Estado desconocido"
                  : paused
                  ? "Bot pausado"
                  : "Bot activo"}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {paused
                  ? "No abre nuevas posiciones. Sigue monitoreando, cubriendo y cerrando lo abierto."
                  : "Operando normalmente."}
              </div>
            </div>
          </div>

          {paused ? (
            <button
              onClick={() => {
                if (window.confirm("¿Reanudar el bot?")) resume.mutate();
              }}
              disabled={resume.isPending}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm font-medium hover:bg-emerald-500/15 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" strokeWidth={2.25} /> Reanudar
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm("¿Pausar el bot?")) pause.mutate();
              }}
              disabled={pause.isPending || !data}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-sm font-medium hover:bg-amber-500/15 disabled:opacity-50 transition-colors"
            >
              <Pause className="h-4 w-4" strokeWidth={2.25} /> Pausar
            </button>
          )}
        </div>

        {paused && (reason || since) && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wide text-amber-300/70 font-medium flex items-center gap-2">
              {reasonKind === "auto"
                ? "Auto-pausado"
                : reasonKind === "manual"
                ? "Pausa manual"
                : "Pausa"}
              {sinceFormatted && (
                <span className="text-neutral-500 normal-case font-normal">
                  · {sinceFormatted}
                </span>
              )}
            </div>
            {reason && (
              <div className="text-sm text-amber-100/90 leading-snug">
                {reason}
              </div>
            )}
            <div className="text-[11px] text-neutral-500 leading-snug pt-1">
              El estado se persiste en <code className="text-neutral-400">/data/PAUSE</code>.
              Si la env var <code className="text-neutral-400">PAUSE=false</code> está fija
              en Railway, el archivo se ignora y reanudar borrará el archivo en cada tick.
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
            No se pudo consultar el estado del bot. Los botones igual intentan pausar/reanudar.
          </div>
        )}
      </div>

      <ParamsEditor />
    </div>
  );
}
