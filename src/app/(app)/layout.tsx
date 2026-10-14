import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";
import { DashboardLayout } from "@/features/dashboard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="private">
      <DashboardLayout>{children}</DashboardLayout>
    </SessionGuard>
  );
}
