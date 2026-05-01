type Numeric = number | string | null | undefined;

function toNum(n: Numeric): number | null {
  if (n === null || n === undefined || n === "") return null;
  const v = typeof n === "number" ? n : Number(n);
  return Number.isNaN(v) ? null : v;
}

export function formatUsd(n: Numeric, digits = 2): string {
  const v = toNum(n);
  if (v === null) return "—";
  return `$${v.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatPct(n: Numeric, digits = 2): string {
  const v = toNum(n);
  if (v === null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

export function formatNum(n: Numeric, digits = 2): string {
  const v = toNum(n);
  if (v === null) return "—";
  return v.toFixed(digits);
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export function formatAge(from: string | Date | null | undefined): string {
  if (!from) return "—";
  const date = typeof from === "string" ? new Date(from) : from;
  if (Number.isNaN(date.getTime())) return "—";
  const ms = Date.now() - date.getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  return `${d}d`;
}
