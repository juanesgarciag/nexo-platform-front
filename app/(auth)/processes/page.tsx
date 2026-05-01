"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Heartbeat } from "@/lib/types";
import ProcessesPanel from "@/components/ProcessesPanel";

export default function ProcessesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["processes"],
    queryFn: () => apiFetch<Heartbeat[]>("/api/processes"),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Processes</h1>
      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <ProcessesPanel heartbeats={data ?? []} />
      )}
    </div>
  );
}
