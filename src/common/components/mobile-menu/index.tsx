"use client";
import type { MouseEvent, ReactNode } from "react";
import Hamburguer from "@/common/assets/icons/Hamburguer";
import { MobileMenuLink } from "@/common/components/mobile-menu/mobile-menu-link";
import type { MobileMenuItem } from "@/common/components/mobile-menu/types";
import { useMobileMenu } from "@/common/hooks/useMobileMenu";

export type { MobileMenuItem } from "@/common/components/mobile-menu/types";

const DEFAULT_BACKGROUND = "/backgrounds/homeBackground.jpg";

type MobileMenuProps = {
  items: MobileMenuItem[];
  logo: ReactNode;
  title?: string;
  background?: string;
  header?: ReactNode | ((close: () => void) => ReactNode);
  footer?: ReactNode | ((close: () => void) => ReactNode);
  compact?: boolean;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  className?: string;
};

export function MobileMenu({
  items,
  logo,
  title,
  background = DEFAULT_BACKGROUND,
  header,
  footer,
  compact = false,
  onNavigate,
  className = "",
}: MobileMenuProps) {
  const { isOpen, toggle, close } = useMobileMenu();

  const handleSelect = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    onNavigate?.(event, href);
    close();
  };

  const headerNode = typeof header === "function" ? header(close) : header;
  const footerNode = typeof footer === "function" ? footer(close) : footer;

  const toggleButton = (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      onClick={toggle}
      className="flex cursor-pointer rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <Hamburguer className="hover:animate-spin-slow" />
    </button>
  );

  const closedClassName = `relative flex h-[85px] w-full bg-blurry ${
    compact ? "items-center justify-start pl-8" : "justify-center"
  }`;
  const openClassName = compact
    ? "fixed inset-0 z-30 flex h-[100dvh] flex-col items-center overflow-hidden bg-blurry bg-cover bg-center after:absolute after:inset-0 after:bg-blue300"
    : "fixed inset-0 z-30 flex flex-col items-center bg-blurry bg-cover bg-center after:absolute after:inset-0 after:bg-blue300";

  const logoWrapperClassName = isOpen
    ? `relative z-10 flex justify-center ${compact ? "flex-none pt-8" : ""}`
    : "contents";

  const toggleWrapperClassName = compact
    ? "absolute right-4 top-1/2 -translate-y-1/2"
    : "absolute right-4 top-8";

  const scrollClassName =
    "flex w-full flex-1 min-h-0 flex-col items-center overflow-y-auto overscroll-contain px-1 pb-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&>*]:flex-none";

  const menuContent = (
    <>
      {headerNode ? <div className="w-full">{headerNode}</div> : null}

      <nav
        aria-label="Principal"
        className={`flex w-full flex-col ${
          compact ? "mt-4" : "mt-4 items-center"
        }`}
      >
        {items.map((item) => (
          <MobileMenuLink
            key={item.id}
            item={item}
            compact={compact}
            onSelect={handleSelect}
          />
        ))}
      </nav>

      {footerNode ? (
        <div className="flex w-full justify-center">{footerNode}</div>
      ) : null}
    </>
  );

  // El logo queda en la misma posición del árbol en ambos estados para que no
  // se remonte (y no repita su animación de entrada) al abrir o cerrar.
  return (
    <div
      className={`${isOpen ? openClassName : closedClassName} ${className}`}
      style={isOpen ? { backgroundImage: `url('${background}')` } : undefined}
    >
      <div className={logoWrapperClassName}>{logo}</div>

      {!isOpen && compact && title && (
        <span className="ml-4 text-lg font-bold text-white">{title}</span>
      )}
      {!isOpen && <div className={toggleWrapperClassName}>{toggleButton}</div>}

      {isOpen && (
        <div
          className={`relative z-10 flex flex-col items-center border-2 border-blue200 border-b-transparent rounded-t-[10px] ${
            compact
              ? "flex-1 min-h-0 self-stretch mx-4 mt-6 px-4 pt-6"
              : "p-10"
          }`}
        >
          {compact ? (
            <>
              {toggleButton}
              <div className={scrollClassName}>{menuContent}</div>
            </>
          ) : (
            <>
              {toggleButton}
              {menuContent}
            </>
          )}
        </div>
      )}
    </div>
  );
}
