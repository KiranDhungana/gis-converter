"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROUTES } from "@/lib/routes";
import { signIn } from "@/services/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      await signIn(email, password);
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#aebfb6]">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-lg border border-[var(--line)] bg-[var(--ink)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-signal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#aebfb6]">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="••••••••"
            className="rounded-lg border border-[var(--line)] bg-[var(--ink)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-signal"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-signal px-4 py-3 text-sm font-semibold text-[#04130b] transition-colors hover:bg-leaf disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-mute">
        No account needed to convert files.{" "}
        <Link href={ROUTES.dashboard} className="font-medium text-signal hover:underline">
          Start converting
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-mute">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.signup} className="font-medium text-signal hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
