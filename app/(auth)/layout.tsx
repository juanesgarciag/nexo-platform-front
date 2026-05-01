"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import NavSidebar from "@/components/NavSidebar";
import WalletConnect from "@/components/WalletConnect";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";
import { apiFetch } from "@/lib/api";

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/positions": "Positions",
  "/trades": "Trades",
  "/whales": "Whales",
  "/turnover": "Turnover",
  "/deposits": "Deposits",
  "/control": "Control",
  "/processes": "Processes",
};

function getPageLabel(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  if (pathname === "/") return PAGE_LABELS["/"];
  const match = Object.keys(PAGE_LABELS)
    .filter((k) => k !== "/")
    .find((k) => pathname.startsWith(k));
  return match ? PAGE_LABELS[match] : "Dashboard";
}

function HamburgerButton() {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      aria-label="Open navigation"
      className="lg:hidden h-9 w-9 rounded-md border border-white/10 bg-white/5 hover:border-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
    >
      <Menu className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageLabel = getPageLabel(pathname);

  return (
    <div className="min-h-screen flex">
      <NavSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 bg-neutral-950/60 backdrop-blur-xl flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <HamburgerButton />
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-400 min-w-0">
              <ChevronRight className="h-3.5 w-3.5 text-neutral-600 shrink-0" strokeWidth={2.25} />
              <span className="font-medium tracking-tight text-white truncate">
                {pageLabel}
              </span>
            </div>
          </div>
          <WalletConnect />
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 overflow-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/auth/me")
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) return null;

  return (
    <SidebarProvider>
      <AuthShell>{children}</AuthShell>
    </SidebarProvider>
  );
}
