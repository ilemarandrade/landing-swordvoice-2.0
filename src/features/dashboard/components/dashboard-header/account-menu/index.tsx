"use client";
import Link from "next/link";
import { Avatar } from "@/common/components/avatar";
import { routes } from "@/common/constants/routes";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

export function AccountMenu() {
  const { isOpen, toggle, name, photoUrl, signOut } = useAccountMenu();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label="Mi cuenta"
        className="rounded-full hover:[&>span]:border-primary"
      >
        <Avatar name={name} photoUrl={photoUrl} size={44} />
      </button>
      <div
        id="account-menu"
        hidden={!isOpen}
        className="absolute right-0 top-14 z-20 w-48 rounded-xl border border-white/15 bg-black p-2"
      >
        <Link
          href={routes.DASHBOARD_PROFILE}
          className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-white no-underline hover:bg-white/10"
        >
          Mi perfil
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="min-h-11 w-full rounded-lg px-3 text-left hover:bg-white/10"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
