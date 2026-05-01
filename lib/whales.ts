export const WHALE_NAMES: Record<string, string> = {
  "0x2005d16a84ceefa912": "RN1 (CS2/tenis)",
  "0x204f72f35326db9321": "Swisstony (deportes)",
  "0x2a2c53bd278c04da99": "Sports model",
  "0x6a72f61820b26b1fe4": "kch123 (live)",
  "0xde17f7144fbd0eddb26": "BTC oracle",
  "0x6ffb4354cbe6e0f998": "leaderboard",
  "0x8904971e9b2f84d71c7": "leaderboard",
  "0x9d84ce0306f8551e02": "leaderboard",
  "0x5bffcf561bcae83af6": "leaderboard",
  "0xcc500cbcc8b7cf5bd2": "leaderboard",
};

export const PRIORITY_WHALES = new Set<string>([
  "0x2005d16a84ceefa912",
  "0x204f72f35326db9321",
]);

export type ScoreMeta = {
  label: string;
  emoji: string;
  color: string; // tailwind text color class
  border: string; // tailwind border color class
  bg: string; // tailwind bg tint
};

export const SCORE_META: Record<number, ScoreMeta> = {
  7: {
    label: "Señal máxima",
    emoji: "🔥",
    color: "text-red-500",
    border: "border-red-500/40",
    bg: "bg-red-500/5",
  },
  6: {
    label: "Alta convicción",
    emoji: "💎",
    color: "text-purple-400",
    border: "border-purple-400/40",
    bg: "bg-purple-400/5",
  },
  5: {
    label: "Señal fuerte",
    emoji: "⚡",
    color: "text-yellow-400",
    border: "border-yellow-400/40",
    bg: "bg-yellow-400/5",
  },
  4: {
    label: "Consenso confirmado",
    emoji: "✅",
    color: "text-emerald-400",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/5",
  },
  3: {
    label: "Ballena de confianza",
    emoji: "👁️",
    color: "text-sky-400",
    border: "border-sky-400/40",
    bg: "bg-sky-400/5",
  },
  2: {
    label: "Señal débil",
    emoji: "📡",
    color: "text-blue-400",
    border: "border-blue-400/40",
    bg: "bg-blue-400/5",
  },
  1: {
    label: "Trade especulativo",
    emoji: "🔍",
    color: "text-neutral-400",
    border: "border-neutral-700",
    bg: "bg-neutral-900/40",
  },
  0: {
    label: "Whale anónima",
    emoji: "🌊",
    color: "text-neutral-500",
    border: "border-neutral-800",
    bg: "bg-neutral-900/30",
  },
};

export function getWhaleName(addr: string | null | undefined): string | null {
  if (!addr) return null;
  return WHALE_NAMES[addr] ?? null;
}

export function getScoreMeta(score: number | null | undefined): ScoreMeta {
  if (score == null || Number.isNaN(Number(score))) return SCORE_META[0];
  const s = Math.max(0, Math.min(7, Math.round(Number(score))));
  return SCORE_META[s] ?? SCORE_META[0];
}

export function truncateAddr(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
