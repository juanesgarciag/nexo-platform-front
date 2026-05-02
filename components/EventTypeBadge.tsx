"use client";

const SPORT_EMOJI: Record<string, string> = {
  futbol: "⚽",
  tenis: "🎾",
  NBA: "🏀",
  NHL: "🏒",
  beisbol: "⚾",
  rugby: "🏉",
  cricket: "🏏",
  esports: "🎮",
  NFL: "🏈",
  F1: "🏎️",
};

const TYPE_STYLE: Record<string, string> = {
  deportes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  crypto: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  politica: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  tecnologia: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  otros: "bg-neutral-700/30 text-neutral-300 border-neutral-700",
};

const TYPE_EMOJI: Record<string, string> = {
  deportes: "🏟️",
  crypto: "₿",
  politica: "🗳️",
  tecnologia: "💻",
  otros: "•",
};

export default function EventTypeBadge({
  eventType,
  eventSport,
  className = "",
}: {
  eventType?: string | null;
  eventSport?: string | null;
  className?: string;
}) {
  if (!eventType) {
    return <span className={`text-neutral-600 ${className}`}>—</span>;
  }
  const styleCls = TYPE_STYLE[eventType] ?? TYPE_STYLE.otros;
  // Si es deportes y hay deporte específico, mostrar emoji deporte + nombre
  if (eventType === "deportes" && eventSport) {
    const emoji = SPORT_EMOJI[eventSport] ?? "🏟️";
    return (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${styleCls} ${className}`}
        title={`Deportes · ${eventSport}`}
      >
        {emoji} {eventSport}
      </span>
    );
  }
  // Otro tipo (crypto, politica, etc) o deportes sin sport específico
  const emoji = TYPE_EMOJI[eventType] ?? TYPE_EMOJI.otros;
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${styleCls} ${className}`}
      title={eventType}
    >
      {emoji} {eventType}
    </span>
  );
}
