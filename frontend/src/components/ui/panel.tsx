import type { CSSProperties, ReactNode } from "react";
import { C } from "@/lib/dashboard-theme";

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
