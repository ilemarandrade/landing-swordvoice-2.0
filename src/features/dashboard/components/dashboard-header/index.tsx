"use client";
import { AccountMenu } from "@/features/dashboard/components/dashboard-header/account-menu";
import { useActiveNavItem } from "@/features/dashboard/hooks/useActiveNavItem";

export function DashboardHeader() {
  const { activeItem } = useActiveNavItem();

  return (
    <header className="hidden h-[85px] items-center justify-between gap-4 border-b border-white/10 bg-blurry px-10 md:flex">
      <h1 className="text-xl font-bold">{activeItem.label}</h1>
      <AccountMenu />
    </header>
  );
}
