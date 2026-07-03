"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { USER_STORAGE_KEY } from "@/services/auth";

const AUTH_CHANGE_EVENT = "gis-auth-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}

/** Primitive snapshot — required by useSyncExternalStore to stay referentially stable. */
function getSnapshot(): string {
  return localStorage.getItem(USER_STORAGE_KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

function parseUser(raw: string): User | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<User>;
    if (typeof parsed.id === "string" && typeof parsed.email === "string") {
      return { id: parsed.id, email: parsed.email, name: parsed.name };
    }
  } catch {
    /* ignore invalid stored user */
  }
  return null;
}

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo(() => parseUser(authRaw), [authRaw]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuthUser(): User | null {
  return useContext(AuthContext);
}
