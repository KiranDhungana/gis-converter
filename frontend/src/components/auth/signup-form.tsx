"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROUTES } from "@/lib/routes";
import { signUp } from "@/services/auth";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      await signUp(email, password, name);
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#aebfb6]">
          Name
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            className="rounded-lg border border-[var(--line)] bg-[var(--ink)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-signal"
          />
        </label>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-mute">
        Just want to convert a file?{" "}
        <Link href={ROUTES.dashboard} className="font-medium text-signal hover:underline">
          Skip signup and start converting
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-mute">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-signal hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
