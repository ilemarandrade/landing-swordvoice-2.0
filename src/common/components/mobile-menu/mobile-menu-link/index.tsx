import Link from "next/link";
import type { MouseEvent } from "react";
import type { MobileMenuItem } from "@/common/components/mobile-menu/types";
import { Typography } from "@/common/components/typography";

type MobileMenuLinkProps = {
  item: MobileMenuItem;
  compact: boolean;
  onSelect: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-primary focus-visible:outline-offset-2";

function getLabelColor(item: MobileMenuItem): string {
  if (!item.href) return "text-white/40";
  if (item.isActive) return "text-primary";
  return "text-white hover:text-primary";
}

export function MobileMenuLink({
  item,
  compact,
  onSelect,
}: MobileMenuLinkProps) {
  const { href } = item;
  const rowClass = compact
    ? "flex min-h-11 items-center justify-center gap-2 my-0"
    : "flex max-h-max items-center justify-center gap-2 my-4";

  const content = (
    <>
      {compact && item.isActive && (
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
      )}
      <Typography
        as="span"
        variant="h5"
        className={`font-medium font-sedgwick no-underline ${getLabelColor(item)}`}
      >
        {item.label}
      </Typography>
      {!href && (
        <span className="font-sans text-[11px] uppercase tracking-wider border border-white/25 rounded-full px-2">
          Pronto
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <span aria-disabled="true" className={rowClass}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={item.isActive ? "page" : undefined}
      onClick={(event) => onSelect(event, href)}
      className={`${rowClass} ${FOCUS_RING}`}
    >
      {content}
    </Link>
  );
}
