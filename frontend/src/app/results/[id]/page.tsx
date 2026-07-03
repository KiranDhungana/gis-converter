import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import { ResultDetail } from "@/components/history/result-detail";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conversion result — GIS Data Converter",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <Link href={ROUTES.history} className="text-sm font-medium text-signal hover:underline">
        ← Back to history
      </Link>
      <ResultDetail taskId={id} />
    </AppShell>
  );
}
