import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { legalHeaderLinks } from "@/features/legal/constants/headerLinks";

export function LegalHeader() {
  return (
    <header className="flex min-h-[85px] flex-wrap items-center justify-between gap-4 bg-black px-4 py-3 md:px-12">
      <Link
        href={routes.HOME}
        className="font-sedgwick text-[32px] text-white no-underline"
      >
        Swordvoice
      </Link>
      <nav aria-label="Principal" className="flex flex-wrap gap-6">
        {legalHeaderLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-sedgwick text-lg text-white no-underline hover:text-primary md:text-xl"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
