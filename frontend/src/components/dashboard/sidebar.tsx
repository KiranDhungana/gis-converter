"use client";

import {
  Layers,
  LayoutDashboard,
  History,
  Loader,
  Boxes,
  Map,
  FileCode2,
  Settings,
  HelpCircle,
  Crown,
  ExternalLink,
} from "lucide-react";
import { C } from "@/lib/dashboard-theme";
import { Panel } from "@/components/ui/panel";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: History, label: "History" },
  { icon: Loader, label: "Running Tasks" },
  { icon: Boxes, label: "Batch Conversion" },
  { icon: Map, label: "Map Preview" },
  { icon: FileCode2, label: "API Docs" },
  { icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "22px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 6px 22px" }}>
        <Layers size={30} color={C.green} />
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>GIS Data</div>
          <div style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>Converter</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 9,
              border: active ? `1px solid ${C.border}` : "1px solid transparent",
              background: active ? C.panel2 : "transparent",
              color: active ? C.green : C.sub,
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <Panel style={{ padding: 14, background: C.panel2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12.5,
              color: C.sub,
              fontWeight: 600,
            }}
          >
            <span>Storage Used</span>
            <span style={{ color: C.text }}>24%</span>
          </div>
          <div style={{ fontSize: 12, color: C.faint, margin: "4px 0 9px" }}>
            2.45 GB / 10 GB
          </div>
          <div style={{ height: 7, borderRadius: 4, background: C.input, overflow: "hidden" }}>
            <div style={{ width: "24%", height: "100%", background: C.green }} />
          </div>
        </Panel>

        <Panel style={{ padding: 16, background: C.panel2 }}>
          <Crown size={22} color="#e3b341" />
          <div style={{ fontWeight: 700, margin: "8px 0 5px" }}>Upgrade to Pro</div>
          <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.45 }}>
            Unlock batch conversion, advanced parameters and priority processing.
          </div>
          <button
            style={{
              marginTop: 12,
              width: "100%",
              padding: "9px",
              background: C.greenDim,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Upgrade Now
          </button>
        </Panel>

        <Panel style={{ padding: 16, background: C.panel2 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <HelpCircle size={20} color={C.sub} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Need Help?</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.4, marginTop: 3 }}>
                Check our documentation or contact support.
              </div>
            </div>
          </div>
          <button
            style={{
              marginTop: 12,
              width: "100%",
              padding: "8px",
              background: "transparent",
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            View Docs <ExternalLink size={13} />
          </button>
        </Panel>
      </div>
    </aside>
  );
}
