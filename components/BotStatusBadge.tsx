"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";
import { apiFetch } from "@/lib/api";

type BotState = {
  paused: boolean;
  reason?: string | null;
  since?: string | null;
};

const POLL_MS = 15000;

export default function BotStatusBadge() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["control-state"],
    queryFn: () => apiFetch<BotState>("/api/control/state"),
    refetchInterval: POLL_MS,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const pauseMut = useMutation({
    mutationFn: () => apiFetch("/api/control/pause", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["control-state"] }),
  });
  const resumeMut = useMutation({
    mutationFn: () => apiFetch("/api/control/resume", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["control-state"] }),
  });

  const pending = pauseMut.isPending || resumeMut.isPending;

  if (isLoading) {
    return (
      <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md border border-white/10 bg-white/5 text-xs text-neutral-400">
        <span className="h-2 w-2 rounded-full bg-neutral-500 animate-pulse" />
        Bot…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="flex items-center gap-1 h-9 pl-3 pr-1 rounded-md border border-amber-500/30 bg-amber-500/5 text-xs"
        title="No se pudo consultar el estado del bot. Click para ver detalle."
      >
        <Link
          href="/control"
          className="flex items-center gap-2 text-amber-300 hover:text-amber-200"
        >
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="hidden sm:inline font-medium">Bot ?</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Pausar el bot?")) pauseMut.mutate();
          }}
          disabled={pending}
          className="ml-1 h-7 w-7 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
          aria-label="Pausar bot"
        >
          <Pause className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Reanudar el bot?")) resumeMut.mutate();
          }}
          disabled={pending}
          className="h-7 w-7 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
          aria-label="Reanudar bot"
        >
          <Play className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    );
  }

  const paused = data.paused;
  const tooltip = paused
    ? `Pausado${data.reason ? ` · ${data.reason}` : ""}${
        data.since ? ` · ${new Date(data.since).toLocaleString()}` : ""
      } · Click para detalle`
    : "Bot activo · Click para detalle";

  function toggle() {
    const verb = paused ? "reanudar" : "pausar";
    if (!window.confirm(`¿Seguro que quieres ${verb} el bot?`)) return;
    if (paused) resumeMut.mutate();
    else pauseMut.mutate();
  }

  return (
    <div
      className="flex items-center gap-2 h-9 pl-3 pr-1 rounded-md border border-white/10 bg-white/5 text-xs"
      title={tooltip}
    >
      <Link
        href="/control"
        className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${
          paused ? "text-amber-300" : "text-emerald-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            paused
              ? "bg-amber-400"
              : "bg-emerald-400 shadow-[0_0_8px_currentColor]"
          }`}
        />
        <span className="hidden sm:inline font-medium">
          {paused ? "Pausado" : "Activo"}
        </span>
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="ml-1 h-7 w-7 rounded flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
        aria-label={paused ? "Reanudar bot" : "Pausar bot"}
      >
        {paused ? (
          <Play className="h-3.5 w-3.5" strokeWidth={2.25} />
        ) : (
          <Pause className="h-3.5 w-3.5" strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}
