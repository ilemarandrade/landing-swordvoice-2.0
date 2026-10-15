import Link from "next/link";
import type { NavItem } from "@/common/constants/navLinks";

type FooterColumnProps = {
  title: string;
  links: NavItem[];
};

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <nav aria-label={title} className="flex flex-[0_1_180px] flex-col gap-3">
      <h2 className="mb-1 font-sedgwick text-[22px] text-secondary">
        {title}
      </h2>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-[15px] text-[#E6E6EE] no-underline hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
