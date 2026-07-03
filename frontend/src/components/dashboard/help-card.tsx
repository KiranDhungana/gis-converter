"use client";

import { ExternalLink } from "lucide-react";
import { C } from "@/lib/dashboard-theme";
import { Panel } from "@/components/ui/panel";

export function HelpCard() {
  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 8 }}>Need Help?</div>
      <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5, marginBottom: 14 }}>
        Learn how conversions work and explore examples in our docs.
      </div>
      <button
        type="button"
        style={{
          width: "100%",
          padding: "10px",
          background: "transparent",
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        View Documentation <ExternalLink size={14} />
      </button>
    </Panel>
  );
}
