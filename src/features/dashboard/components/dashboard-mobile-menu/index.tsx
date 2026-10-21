"use client";
import Link from "next/link";
import LogoSwordvoice from "@/common/assets/icons/LogoSwordvoice";
import { buttonClassName } from "@/common/components/button";
import { MobileMenu, type MobileMenuItem } from "@/common/components/mobile-menu";
import { routes } from "@/common/constants/routes";
import { AccountBlock } from "@/features/dashboard/components/dashboard-mobile-menu/account-block";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";
import { useActiveNavItem } from "@/features/dashboard/hooks/useActiveNavItem";
import { useVisibleNavItems } from "@/features/dashboard/hooks/useVisibleNavItems";

// Variante outline: sobreescribe el relleno negro/primary de buttonClassName.
const outlineClassName =
  "!bg-transparent !text-white hover:!bg-transparent hover:!text-primary";

export function DashboardMobileMenu() {
  const { activeItem } = useActiveNavItem();
  const { items } = useVisibleNavItems();
  const { signOut } = useAccountMenu();

  const menuItems: MobileMenuItem[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    isActive: item.id === activeItem.id,
  }));

  return (
    <MobileMenu
      compact
      className="md:hidden"
      items={menuItems}
      logo={
        <Link href={routes.HOME} aria-label="Ir al inicio">
          <LogoSwordvoice className="h-12 w-auto" />
        </Link>
      }
      title={activeItem.label}
      header={(close) => <AccountBlock onNavigate={close} />}
      footer={(close) => (
        <button
          type="button"
          onClick={() => {
            close();
            signOut();
          }}
          className={`${buttonClassName()} ${outlineClassName} my-4`}
        >
          Cerrar sesión
        </button>
      )}
    />
  );
}
