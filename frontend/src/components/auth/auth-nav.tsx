"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useAuthUser } from "@/components/auth/auth-provider";
import { clearStoredUser } from "@/services/auth";

interface AuthNavProps {
  className?: string;
  profileClassName?: string;
  onNavigate?: () => void;
}

function userInitials(user: { name?: string; email: string }): string {
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

export function AuthNav({ className, profileClassName, onNavigate }: AuthNavProps) {
  const user = useAuthUser();
  const router = useRouter();

  function handleLogout() {
    void clearStoredUser();
    onNavigate?.();
    router.push(ROUTES.home);
  }

  if (user) {
    const label = user.name?.trim() || "Profile";
    return (
      <span className="inline-flex items-center gap-3">
        <Link
          href={ROUTES.settings}
          onClick={onNavigate}
          className={profileClassName ?? className}
          title={user.email}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal/20 text-[11px] font-semibold text-signal"
              aria-hidden
            >
              {userInitials(user)}
            </span>
            <span>{label}</span>
          </span>
        </Link>
        <button type="button" onClick={handleLogout} className={className}>
          Log out
        </button>
      </span>
    );
  }

  return (
    <Link href={ROUTES.signup} onClick={onNavigate} className={className}>
      Sign up
    </Link>
  );
}
