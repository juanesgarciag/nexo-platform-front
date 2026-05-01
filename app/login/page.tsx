"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

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
        className="w-full max-w-sm space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6"
      >
        <h1 className="text-2xl font-semibold">NexoPlatform</h1>
        <p className="text-sm text-neutral-400">Sign in to continue</p>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wide text-neutral-400">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 outline-none focus:border-neutral-600"
            autoFocus
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wide text-neutral-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 outline-none focus:border-neutral-600"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-medium rounded-md px-3 py-2 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
