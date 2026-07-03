import type { User } from "@/types";
import { ROUTES } from "@/lib/routes";
import {
  clearToken,
  ensureAuthToken,
  resetToGuestSession,
  saveToken,
} from "@/lib/api/token";

const USER_STORAGE_KEY = "gis_converter_user";
export { USER_STORAGE_KEY };
const AUTH_CHANGE_EVENT = "gis-auth-change";

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user?: User;
}

function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function saveUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    notifyAuthChange();
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    if (typeof parsed.id === "string" && typeof parsed.email === "string") {
      return { id: parsed.id, email: parsed.email, name: parsed.name };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearStoredUser(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_STORAGE_KEY);
    notifyAuthChange();
  }
  await resetToGuestSession();
}

async function parseAuthError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string; error?: string };
    return body.detail ?? body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

async function persistAuthResponse(data: AuthResponse): Promise<User | null> {
  saveToken(data.access_token);
  if (data.user) {
    saveUser(data.user);
    return data.user;
  }
  return null;
}

export async function signIn(email: string, password: string): Promise<User> {
  const res = await fetch(ROUTES.api.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res));
  }

  const data = (await res.json()) as AuthResponse;
  const user = await persistAuthResponse(data);
  if (!user) {
    throw new Error("Login response missing user profile");
  }
  return user;
}

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const res = await fetch(ROUTES.api.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    throw new Error(await parseAuthError(res));
  }

  const data = (await res.json()) as AuthResponse;
  const user = await persistAuthResponse(data);
  if (!user) {
    throw new Error("Registration response missing user profile");
  }
  return user;
}

export { ensureAuthToken };
