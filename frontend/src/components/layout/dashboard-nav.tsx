"use client";

import Link from "next/link";
import { AuthNav } from "@/components/auth/auth-nav";

export function DashboardNavLinks() {
  return (
    <div className="dashboard-nav-links">
      <Link href="/dashboard" className="dashboard-nav-link active">
        Converter
      </Link>
      <Link href="/" className="dashboard-nav-link">
        Home
      </Link>
      <AuthNav className="dashboard-nav-link" />
    </div>
  );
}
