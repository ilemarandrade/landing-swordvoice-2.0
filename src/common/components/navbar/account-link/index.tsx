"use client";
import Link from "next/link";
import { buttonClassName } from "@/common/components/button";
import { routes } from "@/common/constants/routes";
import { useSession } from "@/common/hooks/useSession";

// Variante outline: sobreescribe el relleno negro/primary de buttonClassName.
// Los `!` garantizan que ganan a las clases base y a sus `hover:`.
const outlineClassName =
  "!bg-transparent !text-white hover:!bg-transparent hover:!text-primary";

type AccountLinkProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AccountLink({ className, onNavigate }: AccountLinkProps) {
  const { status } = useSession();

  // SSR e hidratación: aún no se conoce la sesión, no pintamos nada.
  if (status === "unknown") return null;

  const isAuthenticated = status === "authenticated";

  return (
    <Link
      href={isAuthenticated ? routes.DASHBOARD : routes.LOGIN}
      onClick={onNavigate}
      className={`${buttonClassName()} ${outlineClassName} ${className ?? ""}`}
    >
      {isAuthenticated ? "Ir a mi cuenta" : "Iniciar sesión"}
    </Link>
  );
}
