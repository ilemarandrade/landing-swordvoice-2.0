import { usePathname } from "next/navigation";
import { dashboardNav } from "@/features/dashboard/constants/dashboardNav";

export function useActiveNavItem() {
  const pathname = usePathname();
  const activeItem =
    dashboardNav.find(
      (item) =>
        item.href === pathname ||
        (item.activePrefix !== undefined && pathname.startsWith(item.activePrefix)),
    ) ?? dashboardNav[0];
  return { activeItem };
}
