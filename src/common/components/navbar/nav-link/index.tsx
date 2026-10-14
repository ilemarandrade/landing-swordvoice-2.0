import type { MouseEvent } from "react";
import { Typography } from "@/common/components/typography";
import type { NavItem } from "@/common/constants/navLinks";

type NavLinkProps = {
  item: NavItem;
  variant: "h5" | "h6";
  className: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function NavLink({ item, variant, className, onNavigate }: NavLinkProps) {
  return (
    <a
      href={item.href}
      className="no-underline"
      onClick={(event) => onNavigate(event, item.href)}
    >
      <Typography variant={variant} className={className}>
        {item.label}
      </Typography>
    </a>
  );
}
