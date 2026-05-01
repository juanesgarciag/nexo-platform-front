"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

const ACCENT = "#7c5cff";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await login(username, password);
      setToken(access_token);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="glass-panel w-full max-w-[400px] space-y-5 p-7"
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{
              backgroundColor: ACCENT,
              boxShadow: `0 0 12px ${ACCENT}`,
            }}
          />
          <h1 className="text-xl font-semibold tracking-tight text-white">
            NexoPlatform
          </h1>
        </div>
        <p className="text-sm text-neutral-400 -mt-2">Sign in to continue</p>

        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
            autoFocus
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-accent hover:bg-accent-hover text-white font-medium tracking-tight rounded-md text-sm disabled:opacity-50 transition-colors shadow-glow"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
