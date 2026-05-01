"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import ParamsEditor from "@/components/ParamsEditor";

type PauseState = { paused: boolean };

export default function ControlPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["control-state"],
    queryFn: async () => {
      try {
        return await apiFetch<PauseState>("/api/control/state");
      } catch {
        return { paused: false };
      }
    },
    refetchInterval: 5000,
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Control</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Bot status</div>
          <div className="text-xs text-neutral-500 mt-1">
            {paused === undefined
              ? "—"
              : paused
              ? "Paused"
              : "Running"}
          </div>
        </div>
        {paused ? (
          <button
            onClick={() => resume.mutate()}
            disabled={resume.isPending}
            className="bg-emerald-500 text-black text-sm font-medium rounded px-3 py-1.5"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={() => pause.mutate()}
            disabled={pause.isPending}
            className="bg-yellow-500 text-black text-sm font-medium rounded px-3 py-1.5"
          >
            Pause
          </button>
        )}
      </div>

      <ParamsEditor />
    </div>
  );
}
