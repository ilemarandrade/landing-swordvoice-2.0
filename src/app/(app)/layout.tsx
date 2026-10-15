import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";
import { DashboardHeader, DashboardSidebar } from "@/features/dashboard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="private">
      <div className="flex min-h-screen flex-col bg-black text-white md:flex-row">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-10">
            {children}
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
