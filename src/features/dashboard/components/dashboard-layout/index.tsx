import type { ReactNode } from "react";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-layout/dashboard-header";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-layout/dashboard-sidebar";

type DashboardLayoutProps = { children: ReactNode };

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white md:flex-row">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-10">{children}</main>
      </div>
    </div>
  );
}
