"use client";

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number; // 0-indexed
  pageSize: number;
  total: number | null;
  onChange: (p: number) => void;
}) {
  const totalPages =
    total === null ? null : Math.max(1, Math.ceil(total / pageSize));
  const current = page + 1;

  // Build the visible window: first, prev, [window of 5 around current], next, last
  const windowSize = 5;
  let pages: number[] = [];
  if (totalPages !== null) {
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    for (let i = start; i <= end; i++) pages.push(i);
  }

  const btn =
    "min-w-[2.25rem] h-9 px-2 text-sm rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed";
  const activeBtn = "min-w-[2.25rem] h-9 px-2 text-sm rounded bg-emerald-600 text-white";

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="text-xs text-neutral-500">
        {total !== null
          ? `${total.toLocaleString()} total · página ${current}${
              totalPages ? ` de ${totalPages}` : ""
            }`
          : `página ${current}`}
      </div>
      <div className="flex items-center gap-1">
        <button
          className={btn}
          disabled={page === 0}
          onClick={() => onChange(0)}
          title="Primera"
        >
          «
        </button>
        <button
          className={btn}
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          title="Anterior"
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={p === current ? activeBtn : btn}
            onClick={() => onChange(p - 1)}
          >
            {p}
          </button>
        ))}
        <button
          className={btn}
          disabled={totalPages !== null && current >= totalPages}
          onClick={() => onChange(page + 1)}
          title="Siguiente"
        >
          ›
        </button>
        <button
          className={btn}
          disabled={totalPages === null || current >= totalPages}
          onClick={() => totalPages && onChange(totalPages - 1)}
          title="Última"
        >
          »
        </button>
      </div>
    </div>
  );
}
