import {
  GeoJSONIcon,
  GeoTIFFIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

export default function HeroStack() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(52,209,126,0.18),transparent_70%)] blur-2xl"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel-2)]/90 p-5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] backdrop-blur">
        <div className="topo-grid absolute inset-0 opacity-30" aria-hidden />

        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-signal/70" />
            </div>
            <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-mute">
              Converting
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--ink)]/60 p-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-signal/12 text-signal">
                <GeoJSONIcon width={22} height={22} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-white">
                  GeoJSON
                </span>
                <span className="block text-[11px] text-mute">input.geojson</span>
              </span>
            </div>

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-signal text-[#04130b]">
              <ArrowRightIcon width={16} height={16} />
            </span>

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-signal/30 bg-signal/[0.06] p-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-signal/12 text-signal">
                <GeoTIFFIcon width={22} height={22} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-white">
                  GeoTIFF
                </span>
                <span className="block text-[11px] text-mute">output.tif</span>
              </span>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[#0a1512]">
            <svg viewBox="0 0 320 180" className="h-44 w-full">
              <defs>
                <linearGradient id="hs-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(52,209,126,0.28)" />
                  <stop offset="100%" stopColor="rgba(52,209,126,0.02)" />
                </linearGradient>
              </defs>

              {[40, 80, 120, 160, 200, 240, 280].map((x) => (
                <line
                  key={`v${x}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="180"
                  stroke="rgba(111,227,155,0.07)"
                />
              ))}
              {[36, 72, 108, 144].map((y) => (
                <line
                  key={`h${y}`}
                  x1="0"
                  y1={y}
                  x2="320"
                  y2={y}
                  stroke="rgba(111,227,155,0.07)"
                />
              ))}

              <path
                d="M0 130 C 40 90, 80 110, 120 95 C 165 78, 200 120, 250 100 C 285 86, 305 104, 320 96 L 320 180 L 0 180 Z"
                fill="url(#hs-fill)"
                stroke="var(--signal)"
                strokeWidth="1.5"
              />

              <path
                d="M30 150 C 80 120, 110 60, 160 70 C 210 80, 240 40, 295 55"
                fill="none"
                stroke="var(--leaf)"
                strokeWidth="2"
                strokeDasharray="6 8"
                style={{ animation: "dashFlow 1.2s linear infinite" }}
              />

              <circle cx="30" cy="150" r="4" fill="var(--signal)" />
              <circle cx="160" cy="70" r="4" fill="var(--leaf)" />
              <circle cx="295" cy="55" r="4" fill="var(--signal)" />
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-signal-dk to-leaf" />
            </div>
            <span className="text-xs font-semibold text-signal">78%</span>
          </div>
        </div>
      </div>

      <div className="float-mid absolute -right-4 -top-5 hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] px-4 py-3 shadow-xl sm:block">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal/12 text-signal">
            <CheckCircleIcon width={18} height={18} />
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-semibold text-white">
              CRS reprojected
            </span>
            <span className="block text-[10px] text-mute">EPSG:4326 → 3857</span>
          </span>
        </div>
      </div>

      <div
        className="float-slow absolute -bottom-6 -left-4 hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] px-4 py-3 shadow-xl sm:block"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-signal/12 text-signal">
            <span
              className="absolute inset-0 rounded-lg bg-signal/30"
              style={{ animation: "ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }}
              aria-hidden
            />
            <span className="relative h-2 w-2 rounded-full bg-signal" />
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-semibold text-white">
              2,481 features
            </span>
            <span className="block text-[10px] text-mute">processed</span>
          </span>
        </div>
      </div>
    </div>
  );
}
