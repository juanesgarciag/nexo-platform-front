"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavSidebar from "@/components/NavSidebar";
import WalletConnect from "@/components/WalletConnect";
import { apiFetch } from "@/lib/api";

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
    <div className="min-h-screen flex">
      <NavSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-neutral-800 flex items-center justify-end px-4">
          <WalletConnect />
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
