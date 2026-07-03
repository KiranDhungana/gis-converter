"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthNav } from "@/components/auth/auth-nav";
import { ROUTES } from "@/lib/routes";
import { LogoMark, MenuIcon, CloseIcon, ArrowRightIcon } from "@/components/ui/icons";

const NAV = [
  { label: "Formats", href: `${ROUTES.home}#supported-formats` },
  { label: "How it works", href: `${ROUTES.home}#how-it-works` },
  { label: "Features", href: `${ROUTES.home}#features` },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "border-[var(--line)] bg-[var(--ink)]/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <span className="text-signal">
            <LogoMark width={28} height={28} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold text-white">
              GIS Data
            </span>
            <span className="-mt-0.5 block text-[11px] tracking-wide text-mute">
              Converter
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-[#aebfb6] transition-colors hover:text-signal"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <AuthNav className="text-sm font-medium text-[#aebfb6] transition-colors hover:text-signal" />
          <Link
            href={ROUTES.dashboard}
            className="group inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-[#04130b] transition-all hover:bg-leaf"
          >
            Start Converting
            <ArrowRightIcon
              width={15}
              height={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] text-white md:hidden"
        >
          {open ? (
            <CloseIcon width={20} height={20} />
          ) : (
            <MenuIcon width={20} height={20} />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--ink)]/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[#aebfb6] transition-colors hover:bg-white/5 hover:text-signal"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--line)] pt-4">
              <AuthNav
                onNavigate={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[#aebfb6] transition-colors hover:bg-white/5 hover:text-signal"
              />
              <Link
                href={ROUTES.dashboard}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-4 py-3 text-sm font-semibold text-[#04130b] transition-all hover:bg-leaf"
              >
                Start Converting
                <ArrowRightIcon width={15} height={15} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
