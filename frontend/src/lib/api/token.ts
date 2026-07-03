const TOKEN_STORAGE_KEY = "gis_converter_token";
const AUTH_CHANGE_EVENT = "gis-auth-change";

function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    notifyAuthChange();
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    notifyAuthChange();
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function ensureAuthToken(): Promise<string> {
  const existing = getStoredToken();
  if (existing) return existing;

  const res = await fetch("/api/v1/auth/guest", { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to create guest session");
  }

  const data = (await res.json()) as { access_token: string };
  saveToken(data.access_token);
  return data.access_token;
}

export async function resetToGuestSession(): Promise<void> {
  clearToken();
  await ensureAuthToken();
}
