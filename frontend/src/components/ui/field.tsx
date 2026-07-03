import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { C } from "@/lib/dashboard-theme";

export function Field({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12.5,
          fontWeight: 600,
          color: C.sub,
          marginBottom: 8,
        }}
      >
        {label} <Info size={13} color={C.faint} />
      </label>
      {children}
    </div>
  );
}
