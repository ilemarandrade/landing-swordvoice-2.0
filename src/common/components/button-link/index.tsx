import Link from "next/link";
import { buttonClassName } from "@/common/components/button";

type ButtonLinkProps = {
  href: string;
  label: string;
  fullWidth?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  label,
  fullWidth,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${buttonClassName(fullWidth)} ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}
