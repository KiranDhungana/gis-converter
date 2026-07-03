import type { ChangeEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { C, selStyle } from "@/lib/dashboard-theme";

export type SelectOption = string | { value: string; label: string };

export function Select({
  value,
  onChange,
  options,
  render,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: readonly SelectOption[];
  render?: (option: SelectOption) => ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={onChange} style={selStyle}>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <option key={v} value={v} style={{ background: C.panel }}>
              {render ? render(o) : l}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={16}
        color={C.faint}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
