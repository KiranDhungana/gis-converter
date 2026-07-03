"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ensureAuthToken } from "@/lib/api/token";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void ensureAuthToken().catch(() => {
      /* API may be offline on first paint */
    });
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
