"use client";
import Link from "next/link";
import LogoSwordvoice from "@/common/assets/icons/LogoSwordvoice";
import { routes } from "@/common/constants/routes";
import { RankCard } from "@/features/dashboard/components/dashboard-sidebar/rank-card";
import { SidebarNavItem } from "@/features/dashboard/components/dashboard-sidebar/sidebar-nav-item";
import { dashboardNav } from "@/features/dashboard/constants/dashboardNav";
import { useActiveNavItem } from "@/features/dashboard/hooks/useActiveNavItem";
import { useMyPathHref } from "@/features/dashboard/hooks/useMyPathHref";

export function DashboardSidebar() {
  const { activeItem } = useActiveNavItem();
  const { myPathHref } = useMyPathHref();

  return (
    <aside className="flex min-w-0 flex-col gap-2 border-white/10 bg-black/90 md:w-60 md:flex-none md:border-r md:pb-6">
      <div className="flex h-[85px] items-center border-b border-white/10 px-6">
        <Link
          href={routes.HOME}
          className="flex items-center gap-4 text-white no-underline hover:text-primary"
        >
          <LogoSwordvoice className="h-12 w-auto" />
          <span className="font-sedgwick text-xl">Swordvoice</span>
        </Link>
      </div>
      <nav
        aria-label="Principal"
        className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible md:py-4"
      >
        {dashboardNav.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item.id === "path" ? { ...item, href: myPathHref } : item}
            isActive={item.id === activeItem.id}
          />
        ))}
      </nav>
      <RankCard />
    </aside>
  );
}
