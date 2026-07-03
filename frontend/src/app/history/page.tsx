import type { Metadata } from "next";
import AppShell from "@/components/layout/app-shell";
import { HistoryList } from "@/components/history/history-list";

export const metadata: Metadata = {
  title: "History — GIS Data Converter",
};

export default function HistoryPage() {
  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold text-white">Conversion history</h1>
      <p className="mt-1 text-sm text-mute">Re-download past results or inspect failures.</p>
      <HistoryList />
    </AppShell>
  );
}
