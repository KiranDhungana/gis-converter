import type { Metadata } from "next";
import Link from "next/link";
import { DashboardNavLinks } from "@/components/layout/dashboard-nav";

export const metadata: Metadata = {
  title: "Converter — GIS Data Converter",
  description: "Upload and convert geospatial files between vector and raster formats.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <nav className="dashboard-nav">
        <Link href="/" className="dashboard-nav-brand">
          GIS Data Converter
        </Link>
        <DashboardNavLinks />
      </nav>
      {children}
    </div>
  );
}
