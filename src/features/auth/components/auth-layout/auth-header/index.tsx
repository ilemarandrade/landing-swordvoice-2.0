import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthHeaderLink } from "@/features/auth/components/auth-layout/auth-header/auth-header-link";

export function AuthHeader() {
  return (
    <header className="relative z-10 flex h-[85px] items-center justify-between gap-4 bg-blurry px-4 md:px-12">
      <Link
        href={routes.HOME}
        className="font-sedgwick text-[32px] text-white no-underline"
      >
        Swordvoice
      </Link>
      <AuthHeaderLink />
    </header>
  );
}
