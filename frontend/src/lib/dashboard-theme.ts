import type { CSSProperties } from "react";

/**
 * Dark "GitHub-style" palette used across the converter dashboard.
 * Kept separate from the marketing/landing tokens in globals.css.
 */
export const C = {
  bg: "#0d1117",
  panel: "#161b22",
  panel2: "#1c2230",
  border: "#27303d",
  borderSoft: "#222a35",
  green: "#3fb950",
  greenDim: "#2ea043",
  text: "#e6edf3",
  sub: "#8b949e",
  faint: "#6e7681",
  input: "#0f141b",
} as const;

export const selStyle: CSSProperties = {
  width: "100%",
  appearance: "none",
  background: C.input,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "11px 36px 11px 13px",
  fontSize: 14,
  outline: "none",
  cursor: "pointer",
  boxSizing: "border-box",
};

export const inpStyle: CSSProperties = {
  ...selStyle,
  padding: "11px 13px",
  cursor: "text",
  appearance: "auto",
};
