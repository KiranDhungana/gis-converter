import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { LogoMark } from "@/components/ui/icons";

const NAV = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "History", href: ROUTES.history },
  { label: "Settings", href: ROUTES.settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5">
            <span className="text-signal">
              <LogoMark width={26} height={26} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold text-white">
                GIS Data
              </span>
              <span className="-mt-0.5 block text-[11px] text-mute">Converter</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#aebfb6] transition-colors hover:text-signal"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
