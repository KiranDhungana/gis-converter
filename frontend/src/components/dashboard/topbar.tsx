"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, HelpCircle, Bell, Sun, ChevronDown } from "lucide-react";
import { useAuthUser } from "@/components/auth/auth-provider";
import { ROUTES } from "@/lib/routes";
import { C } from "@/lib/dashboard-theme";
import { clearStoredUser } from "@/services/auth";

export function DashboardTopbar() {
  const user = useAuthUser();
  const router = useRouter();
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "User";
  const initials = name.slice(0, 1).toUpperCase();

  function handleLogout() {
    clearStoredUser();
    router.push(ROUTES.home);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 13 }}>
        <LayoutDashboard size={15} /> Dashboard
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <HelpCircle size={19} color={C.sub} />
        <div style={{ position: "relative" }}>
          <Bell size={19} color={C.sub} />
          <span
            style={{
              position: "absolute",
              top: -1,
              right: -1,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.green,
            }}
          />
        </div>
        <Sun size={19} color={C.sub} />
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: C.greenDim,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600 }} title={user?.email ?? ""}>
            {name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "none",
              background: "transparent",
              color: C.sub,
              fontSize: 12.5,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Log out
          </button>
          <ChevronDown size={15} color={C.sub} style={{ opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
