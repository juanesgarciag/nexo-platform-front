"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ChevronsLeft,
  ChevronsRight,
  Cpu,
  Fish,
  LayoutDashboard,
  LineChart,
  LogOut,
  Repeat,
  SlidersHorizontal,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import { useSidebar } from "@/components/SidebarContext";

const ACCENT = "#7c5cff";
const STORAGE_KEY = "nexo:sidebar:collapsed";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const links: NavLink[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/positions", label: "Positions", icon: LineChart },
  { href: "/trades", label: "Trades", icon: ArrowLeftRight },
  { href: "/whales", label: "Whales", icon: Fish },
  { href: "/turnover", label: "Turnover", icon: Repeat },
  { href: "/deposits", label: "Deposits", icon: Wallet },
  { href: "/control", label: "Control", icon: SlidersHorizontal },
  { href: "/processes", label: "Processes", icon: Cpu },
];

export default function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "1") setCollapsed(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed, hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  function logout() {
    clearToken();
    setMobileOpen(false);
    router.replace("/login");
  }

  const lgWidthClass = collapsed ? "lg:w-16" : "lg:w-56";

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`group/aside fixed inset-y-0 left-0 z-50 w-64 ${lgWidthClass} shrink-0 border-r border-white/5 bg-neutral-950/95 lg:bg-neutral-950/80 backdrop-blur-xl flex flex-col transform transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:transform-none lg:transition-all ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(180deg, rgba(124,92,255,0.06) 0%, rgba(0,0,0,0) 40%)",
          }}
        />

        <div className="relative h-14 px-4 flex items-center border-b border-white/5">
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{
                backgroundColor: ACCENT,
                boxShadow: `0 0 12px ${ACCENT}`,
              }}
            />
            <span
              className={`text-sm font-semibold tracking-tight text-white whitespace-nowrap transition-all duration-200 ease-out ${
                collapsed ? "lg:opacity-0 lg:-translate-x-2 lg:w-0" : "opacity-100"
              }`}
            >
              NexoPlatform
            </span>
          </div>
        </div>

        <nav className="relative flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? l.label : undefined}
                className={`relative group flex items-center gap-3 h-9 rounded-md px-2.5 text-sm font-medium tracking-tight transition-all duration-200 ease-out ${
                  active
                    ? "bg-white/5 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full"
                    style={{
                      backgroundColor: ACCENT,
                      boxShadow: `0 0 8px ${ACCENT}`,
                    }}
                  />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                    active
                      ? "text-white"
                      : "text-neutral-500 group-hover:text-white"
                  }`}
                  strokeWidth={2}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ease-out ${
                    collapsed
                      ? "lg:opacity-0 lg:-translate-x-1 lg:w-0 lg:overflow-hidden"
                      : "opacity-100"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="relative px-2 pb-3 pt-2 border-t border-white/5">
          <button
            onClick={logout}
            title={collapsed ? "Sign out" : undefined}
            className="group flex w-full items-center gap-3 h-9 rounded-md px-2.5 text-sm font-medium tracking-tight text-neutral-500 hover:text-white hover:bg-white/5 transition-all duration-200 ease-out"
          >
            <LogOut
              className="h-4 w-4 shrink-0 text-neutral-600 group-hover:text-white transition-colors duration-200"
              strokeWidth={2}
            />
            <span
              className={`whitespace-nowrap transition-all duration-200 ease-out ${
                collapsed
                  ? "lg:opacity-0 lg:-translate-x-1 lg:w-0 lg:overflow-hidden"
                  : "opacity-100"
              }`}
            >
              Sign out
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 h-6 w-6 rounded-full border border-white/10 bg-neutral-900/90 backdrop-blur text-neutral-400 hover:text-white hover:border-white/20 hidden lg:flex items-center justify-center opacity-0 group-hover/aside:opacity-100 transition-all duration-200 ease-out shadow-lg shadow-black/40"
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
          )}
        </button>
      </aside>
    </>
  );
}
