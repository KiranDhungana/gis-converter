import Header from "@/components/layout/header";
import HeroStack from "@/components/shared/hero-stack";
import {
  GeoJSONIcon,
  CSVIcon,
  GeoTIFFIcon,
  COGIcon,
  ShapefileIcon,
  KMLIcon,
  GeoPackageIcon,
  UploadIcon,
  SlidersIcon,
  CheckCircleIcon,
  ShieldIcon,
  BoltIcon,
  GaugeIcon,
  HistoryIcon,
  ArrowRightIcon,
  GridIcon,
  LogoMark,
} from "@/components/ui/icons";

const FORMATS = [
  { icon: GeoJSONIcon, name: "GeoJSON", kind: "Vector" },
  { icon: CSVIcon, name: "CSV", kind: "Tabular" },
  { icon: GeoTIFFIcon, name: "GeoTIFF", kind: "Raster" },
  { icon: COGIcon, name: "COG", kind: "Optimized GeoTIFF" },
  { icon: ShapefileIcon, name: "Shapefile", kind: "Vector" },
  { icon: KMLIcon, name: "KML / KMZ", kind: "Google Earth" },
  { icon: GeoPackageIcon, name: "GeoPackage", kind: "Vector / Raster" },
];

const STEPS = [
  {
    n: 1,
    icon: UploadIcon,
    title: "Upload your file",
    body: "Drag and drop your GIS file, or browse to upload. Most common formats are detected automatically.",
  },
  {
    n: 2,
    icon: SlidersIcon,
    title: "Configure conversion",
    body: "Choose the output format, coordinate reference system, and any conversion options you need.",
  },
  {
    n: 3,
    icon: CheckCircleIcon,
    title: "Convert & download",
    body: "Get your converted file in seconds and download it instantly — no waiting, no signup required.",
  },
];

const FEATURES = [
  {
    icon: GaugeIcon,
    title: "High performance",
    body: "Powered by GDAL/OGR for fast, reliable conversions across vector and raster formats alike.",
  },
  {
    icon: ShieldIcon,
    title: "Data security",
    body: "Your files are processed securely and are never stored permanently. They're deleted after conversion.",
  },
  {
    icon: SlidersIcon,
    title: "Advanced options",
    body: "Fine-tune your output with professional-grade parameters: CRS, resampling, compression, and more.",
  },
  {
    icon: HistoryIcon,
    title: "Conversion history",
    body: "Access your past conversions and re-download results anytime from your account dashboard.",
  },
];

const HERO_BADGES = [
  { icon: ShieldIcon, title: "Secure & private", sub: "Your data is safe" },
  { icon: BoltIcon, title: "Lightning fast", sub: "Optimized conversions" },
  { icon: CheckCircleIcon, title: "Accurate results", sub: "Reliable & precise" },
];

export default function Page() {
  return (
    <main id="top">
      <Header />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-[var(--ink)]">
        <div className="topo-grid absolute inset-0 opacity-40" aria-hidden />
        <div
          className="absolute right-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(52,209,126,0.16),transparent_65%)] blur-2xl"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          {/* copy */}
          <div className="rise">
            <p className="mb-4 font-display text-sm font-semibold tracking-wide text-signal">
              Convert. Transform. Simplify.
            </p>
            <h1 className="font-display text-[2.7rem] font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
              Powerful GIS Data
              <br />
              Conversion{" "}
              <span className="text-signal">Made Easy</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#aebfb6]">
              Convert your geospatial data between dozens of formats quickly and
              accurately — from GeoJSON to GeoTIFF, raster to vector, and
              everything in between.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-3.5 text-sm font-semibold text-[#04130b] transition-all hover:bg-leaf"
              >
                Start Converting Now
                <ArrowRightIcon
                  width={16}
                  height={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:border-signal/60 hover:text-signal"
              >
                Explore Features
                <GridIcon width={16} height={16} />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-5">
              {HERO_BADGES.map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] bg-[var(--panel-2)] text-signal">
                    <b.icon width={18} height={18} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold text-white">
                      {b.title}
                    </span>
                    <span className="block text-xs text-mute">{b.sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* signature visual */}
          <div className="rise" style={{ animationDelay: "0.12s" }}>
            <HeroStack />
          </div>
        </div>
      </section>

      {/* ============ FORMATS ============ */}
      <section id="supported-formats" className="bg-[var(--paper)] py-20 text-[#0c1714]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-signal-dk">
            Supports multiple formats
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-bold tracking-tight sm:text-[2.4rem]">
            All your geospatial data. One converter.
          </h2>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {FORMATS.map((f) => (
              <div
                key={f.name}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-black/8 bg-white px-4 py-7 text-center transition-all hover:-translate-y-1 hover:border-signal/50 hover:shadow-[0_14px_30px_rgba(31,168,98,0.14)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--paper-2)] text-signal-dk transition-colors group-hover:bg-signal/12">
                  <f.icon width={24} height={24} />
                </span>
                <span className="font-display text-base font-semibold">
                  {f.name}
                </span>
                <span className="text-xs text-[#5e6f68]">{f.kind}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#0c1714] transition-colors hover:border-signal/50 hover:text-signal-dk"
            >
              View all supported formats
              <ArrowRightIcon
                width={16}
                height={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        id="how-it-works"
        className="bg-gradient-to-b from-[var(--paper)] to-[#e9efe9] py-20 text-[#0c1714]"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-signal-dk">
            Simple 3-step process
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight sm:text-[2.4rem]">
            How it works
          </h2>

          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                {/* connector */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-[calc(50%+72px)] top-12 hidden h-px w-[calc(100%-72px)] md:block"
                    aria-hidden
                  >
                    <div className="h-full w-full border-t border-dashed border-[#9fb3a8]" />
                    <ArrowRightIcon
                      width={16}
                      height={16}
                      className="absolute -right-1 -top-2 text-[#9fb3a8]"
                    />
                  </div>
                )}
                <div className="relative">
                  <span className="grid h-24 w-24 place-items-center rounded-full bg-white text-signal-dk shadow-[0_10px_28px_rgba(31,168,98,0.12)] ring-1 ring-black/5">
                    <s.icon width={34} height={34} />
                  </span>
                  <span className="absolute -left-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-signal-dk text-sm font-bold text-white">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#52635c]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section
        id="features"
        className="relative overflow-hidden bg-[var(--panel)] py-20"
      >
        <div className="topo-grid absolute inset-0 opacity-25" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="group">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel-2)] text-signal transition-colors group-hover:border-signal/50">
                  <f.icon width={24} height={24} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9db0a7]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA banner */}
          <div
            id="start"
            className="relative mt-16 overflow-hidden rounded-3xl border border-signal/25 bg-[linear-gradient(120deg,#0f3d2a,#0a2c20_55%,#0d2433)] px-7 py-10 sm:px-12 sm:py-12"
          >
            <div className="topo-grid absolute inset-0 opacity-20" aria-hidden />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to transform your GIS data?
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#b8cabf]">
                  Join thousands of GIS professionals who trust our converter for
                  their daily geospatial work.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <a
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-[#04130b] transition-all hover:bg-leaf"
                  >
                    Get started for free
                    <ArrowRightIcon
                      width={16}
                      height={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                  <span className="text-xs text-[#9db0a7]">
                    No credit card required
                  </span>
                </div>
              </div>

              {/* mini app preview */}
              <div className="relative hidden justify-self-end lg:block">
                <div className="w-[300px] rounded-xl border border-white/10 bg-[#0a1512] p-2 shadow-2xl">
                  <div className="mb-2 flex gap-1.5 px-1.5 pt-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-signal/60" />
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <div className="space-y-2 rounded-lg bg-white/[0.03] p-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-2 rounded bg-white/10"
                          style={{ width: `${60 + ((i * 13) % 40)}%` }}
                        />
                      ))}
                    </div>
                    <div className="relative overflow-hidden rounded-lg bg-[#10271d] p-3">
                      <svg viewBox="0 0 160 120" className="h-full w-full">
                        <path
                          d="M20 80 C 40 30, 70 40, 80 60 C 92 84, 130 70, 140 40 L 140 100 L 20 100 Z"
                          fill="rgba(52,209,126,0.18)"
                          stroke="var(--signal)"
                          strokeWidth="1.5"
                        />
                        <circle cx="80" cy="60" r="3" fill="var(--signal)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[var(--line)] bg-[var(--ink)] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:px-8 md:flex-row">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="text-signal">
              <LogoMark width={26} height={26} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold text-white">
                GIS Data
              </span>
              <span className="-mt-0.5 block text-[11px] text-mute">Converter</span>
            </span>
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#9db0a7]">
            {["About", "Docs", "API", "Support", "Contact"].map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-signal">
                {l}
              </a>
            ))}
          </nav>

          <p className="text-xs text-mute">
            © 2024 GIS Data Converter. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
