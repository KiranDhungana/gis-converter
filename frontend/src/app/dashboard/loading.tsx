import { C } from "@/lib/dashboard-theme";

export default function DashboardLoading() {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: C.bg,
        color: C.sub,
        fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `3px solid ${C.border}`,
            borderTopColor: C.green,
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: 14 }}>Loading dashboard…</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
