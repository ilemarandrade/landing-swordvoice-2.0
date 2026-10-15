import Link from "next/link";
import type { DashboardNavItem } from "@/features/dashboard/constants/dashboardNav";

type SidebarNavItemProps = { item: DashboardNavItem; isActive: boolean };

const baseClassName =
  "flex min-h-11 flex-none items-center gap-3 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[15px] no-underline";

export function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  if (!item.href) {
    return (
      <span aria-disabled="true" className={`${baseClassName} text-white/40`}>
        <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full bg-white/25" />
        {item.label}
        <span className="ml-auto text-[11px] uppercase tracking-wider">Pronto</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`${baseClassName} ${
        isActive
          ? "bg-primary/[0.12] font-bold text-primary"
          : "font-medium text-[#E6E6EE] hover:bg-white/5"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 flex-none rounded-full ${isActive ? "bg-primary" : "bg-white/25"}`}
      />
      {item.label}
    </Link>
  );
}
