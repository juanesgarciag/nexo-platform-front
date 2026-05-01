"use client";

import { Heartbeat } from "@/lib/types";
import { formatAge, formatDate } from "@/lib/format";

function statusFor(last_tick: string): {
  color: string;
  label: string;
} {
  const ms = Date.now() - new Date(last_tick).getTime();
  const sec = ms / 1000;
  if (sec < 30) return { color: "bg-emerald-500", label: "ok" };
  if (sec < 120) return { color: "bg-yellow-500", label: "lagging" };
  return { color: "bg-red-500", label: "stale" };
}

export default function ProcessesPanel({
  heartbeats,
}: {
  heartbeats: Heartbeat[];
}) {
  if (!heartbeats.length) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center">
        No heartbeats received yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {heartbeats.map((h) => {
        const s = statusFor(h.last_tick);
        return (
          <div
            key={h.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{h.loop}</div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label}
              </div>
            </div>
            <div className="mt-3 text-xs text-neutral-500 space-y-1">
              <div>last_tick: {formatDate(h.last_tick)}</div>
              <div>age: {formatAge(h.last_tick)}</div>
              {h.errors_last !== null && (
                <div>errors: {h.errors_last}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
