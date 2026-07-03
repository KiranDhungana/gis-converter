"use client";

import { Braces, Grid3x3, Layers3, Network, Compass, ChevronRight } from "lucide-react";
import { C } from "@/lib/dashboard-theme";
import { Panel } from "@/components/ui/panel";

const SUPPORTED = [
  { icon: Braces, label: "GeoJSON ↔ CSV" },
  { icon: Grid3x3, label: "GeoTIFF → COG" },
  { icon: Layers3, label: "Raster → GeoJSON" },
  { icon: Network, label: "GeoJSON → Raster" },
  { icon: Compass, label: "Reprojection (EPSG)" },
];

export function SupportedConversions() {
  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 15 }}>
        Supported Conversions
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {SUPPORTED.map(({ icon: Icon, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5 }}
          >
            <Icon size={17} color={C.green} /> {label}
          </div>
        ))}
      </div>
      <button
        type="button"
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: C.green,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
        }}
      >
        View all supported conversions <ChevronRight size={14} />
      </button>
    </Panel>
  );
}
