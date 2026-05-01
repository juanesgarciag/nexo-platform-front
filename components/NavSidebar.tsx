"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/positions", label: "Positions" },
  { href: "/trades", label: "Trades" },
  { href: "/whales", label: "Whales" },
  { href: "/turnover", label: "Turnover" },
  { href: "/deposits", label: "Deposits" },
  { href: "/control", label: "Control" },
  { href: "/processes", label: "Processes" },
];

export default function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-800 bg-neutral-950 flex flex-col">
      <div className="p-4 border-b border-neutral-800">
        <div className="text-lg font-semibold">NexoPlatform</div>
        <div className="text-xs text-neutral-500">local dashboard</div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 rounded-md text-sm ${
                active
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="m-2 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-md text-left"
      >
        Sign out
      </button>
    </aside>
  );
}
