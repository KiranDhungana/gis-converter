import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/lib/routes";
import { LogoMark } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sign up — GIS Data Converter",
};

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--ink)] px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href={ROUTES.home} className="mb-8 flex items-center justify-center gap-2.5">
          <span className="text-signal">
            <LogoMark width={30} height={30} />
          </span>
          <span className="font-display text-lg font-semibold text-white">
            GIS Data Converter
          </span>
        </Link>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-7">
          <h1 className="font-display text-xl font-bold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-mute">
            Optional — you can convert files without signing up.
          </p>
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
