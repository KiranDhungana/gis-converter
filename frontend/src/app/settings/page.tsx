"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { useAuthUser } from "@/components/auth/auth-provider";
import { ROUTES } from "@/lib/routes";
import { clearStoredUser } from "@/services/auth";

export default function SettingsPage() {
  const user = useAuthUser();
  const router = useRouter();

  const displayName = useMemo(() => user?.name?.trim() || "User", [user]);
  const email = user?.email ?? "Not signed in";

  function handleLogout() {
    clearStoredUser();
    router.push(ROUTES.home);
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-mute">Manage your account and conversion defaults.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="font-display text-base font-semibold text-white">Profile</h2>
          <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-[#aebfb6]">
            Display name
            <input
              value={displayName}
              readOnly
              className="rounded-lg border border-[var(--line)] bg-[var(--ink)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-signal"
            />
          </label>
          <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-[#aebfb6]">
            Email
            <input
              type="email"
              value={email}
              readOnly
              className="rounded-lg border border-[var(--line)] bg-[var(--ink)] px-3.5 py-2.5 text-sm text-white outline-none focus:border-signal"
            />
          </label>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 rounded-lg border border-red-400/50 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-400/10"
          >
            Log out
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
          <h2 className="font-display text-base font-semibold text-white">
            Conversion defaults
          </h2>
          <label className="mt-4 flex items-center justify-between text-sm text-[#aebfb6]">
            Default CRS
            <span className="font-medium text-white">EPSG:3857</span>
          </label>
          <label className="mt-4 flex items-center justify-between text-sm text-[#aebfb6]">
            Keep files after conversion
            <span className="font-medium text-white">No</span>
          </label>
        </section>
      </div>

      <button
        type="button"
        className="mt-8 rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-[#04130b] transition-colors hover:bg-leaf"
      >
        Save changes
      </button>
    </AppShell>
  );
}
