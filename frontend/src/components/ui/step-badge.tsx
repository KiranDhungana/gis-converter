import { C } from "@/lib/dashboard-theme";

export function StepBadge({ n }: { n: number }) {
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: C.green,
        color: "#06210d",
        fontSize: 13,
        fontWeight: 800,
        display: "grid",
        placeItems: "center",
      }}
    >
      {n}
    </span>
  );
}
