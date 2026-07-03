"use client";

import { useEffect } from "react";
import { C } from "@/lib/dashboard-theme";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
          Something went wrong
        </h2>
        <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.5, margin: "0 0 20px" }}>
          The dashboard failed to load. You can try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "11px 22px",
            background: C.greenDim,
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
