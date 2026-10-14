"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/common/constants/routes";

export function AuthHeaderLink() {
  const pathname = usePathname();
  const link =
    pathname === routes.LOGIN
      ? { href: routes.HOME, label: "Volver al inicio" }
      : { href: routes.LOGIN, label: "Iniciar sesión" };

  return (
    <Link
      href={link.href}
      className="font-sedgwick text-lg text-white no-underline hover:text-primary md:text-xl"
    >
      {link.label}
    </Link>
  );
}
