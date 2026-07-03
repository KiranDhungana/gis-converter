"use client";

import { Lightbulb } from "lucide-react";
import { C } from "@/lib/dashboard-theme";
import { Panel } from "@/components/ui/panel";
import type { ConverterForm } from "@/hooks/use-converter-form";

export function ConversionSummary({ form }: { form: ConverterForm }) {
  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 16 }}>
        Conversion Summary
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {form.summary.map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10 }}>
            <span style={{ color: C.green, fontSize: 13, lineHeight: "18px" }}>✦</span>
            <div>
              <div style={{ fontSize: 12, color: C.faint, marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, wordBreak: "break-word" }}>
                {v}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          padding: 14,
          background: "rgba(227,179,65,0.07)",
          border: "1px solid rgba(227,179,65,0.2)",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: "#e3b341",
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 5,
          }}
        >
          <Lightbulb size={15} /> Tip
        </div>
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
          Lower resolution values increase detail but result in larger file sizes.
        </div>
      </div>
    </Panel>
  );
}
