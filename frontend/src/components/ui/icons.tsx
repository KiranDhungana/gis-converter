import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...props,
});

export function LogoMark(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: 1.6 })}>
      <path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7L12 2.5Z" />
      <path d="M12 2.5v19M3.5 7l8.5 4.8L20.5 7M3.5 17l8.5-4.8 8.5 4.8" />
      <circle cx="12" cy="11.8" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FileBadge({
  label,
  glyph,
  ...props
}: IconProps & { label?: string; glyph?: React.ReactNode }) {
  return (
    <svg {...base({ ...props })}>
      <path d="M6 2.75h7.5L19 8.25V20a1.25 1.25 0 0 1-1.25 1.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75Z" />
      <path d="M13.25 2.9V8.1H18.4" />
      {label ? (
        <text
          x="11.5"
          y="17"
          textAnchor="middle"
          fontSize="5"
          fontWeight="700"
          fill="currentColor"
          stroke="none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </text>
      ) : null}
      {glyph}
    </svg>
  );
}

export function GeoJSONIcon(props: IconProps) {
  return <FileBadge label="JSON" {...props} />;
}

export function CSVIcon(props: IconProps) {
  return <FileBadge label="CSV" {...props} />;
}

export function GeoTIFFIcon(props: IconProps) {
  return <FileBadge label="TIF" {...props} />;
}

export function COGIcon(props: IconProps) {
  return <FileBadge label="COG" {...props} />;
}

export function KMLIcon(props: IconProps) {
  return <FileBadge label="KML" {...props} />;
}

export function GeoPackageIcon(props: IconProps) {
  return <FileBadge label="GPKG" {...props} />;
}

export function ShapefileIcon(props: IconProps) {
  return (
    <FileBadge
      {...props}
      glyph={
        <path
          d="M7.5 16.5 9.8 11l2.4 3 1.8-4 2.5 6.5"
          fill="none"
        />
      }
    />
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="8" cy="17" r="2.2" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.4 2.4L15.5 9.5" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 5.6v5.2c0 4.3 3 7.6 7 9.2 4-1.6 7-4.9 7-9.2V5.6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
    </svg>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17 16 10" />
      <circle cx="12" cy="17" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M5.5 3v3h3" />
      <path d="M12 8v4l3 1.8" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
