"use client";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { MobileMenu } from "@/common/components/mobile-menu";
import { AccountLink } from "@/common/components/navbar/account-link";
import { NavbarLogo } from "@/common/components/navbar/navbar-logo";
import { NavLink } from "@/common/components/navbar/nav-link";
import { navAnimation } from "@/common/constants/animations/navAnimation";
import { mobileNavLinks, navLinks } from "@/common/constants/navLinks";
import { useIsMobile } from "@/common/hooks/useIsMobile";

const mobileItems = mobileNavLinks.map((link) => ({
  id: link.href,
  label: link.label,
  href: link.href,
}));

type NavbarProps = {
  changeLogo: boolean;
};

export function Navbar({ changeLogo }: NavbarProps) {
  const isMobile = useIsMobile();

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    anchor: string,
  ) => {
    const target = document.querySelector<HTMLElement>(
      anchor === "/" ? "#home" : anchor.slice(1),
    );
    // Fuera de la landing la sección no existe: navegación normal a "/#seccion".
    if (!target) return;
    event.preventDefault();
    const navbarOffset = isMobile ? 110 : 85;
    window.scrollTo({
      top: target.offsetTop - navbarOffset,
      behavior: "smooth",
    });
  };

  return (
    // Sin fondo en mobile: MobileMenu ya pinta su barra (bg-blurry); un fondo aquí oscurecería el doble.
    <div className="fixed top-0 left-0 z-30 h-[85px] w-full md:flex md:justify-between md:bg-blurry">
      <div className="hidden md:contents">
        <NavbarLogo changeLogo={changeLogo} />
      </div>

      <motion.div
        initial="offscreen"
        // animate (no whileInView): el estado offscreen saca el bloque del viewport
        // (top: -100px), así que el IntersectionObserver nunca lo vería entrar.
        animate="onscreen"
        variants={navAnimation.nav}
        className="hidden md:flex mx-8 gap-6 flex items-center"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            item={link}
            variant="h6"
            className="font-medium text-white no-underline font-sedgwick hover:text-primary"
            onNavigate={handleClick}
          />
        ))}
        <AccountLink />
      </motion.div>

      <MobileMenu
        className="md:hidden"
        items={mobileItems}
        logo={<NavbarLogo changeLogo={changeLogo} />}
        onNavigate={handleClick}
        footer={(close) => <AccountLink className="my-4" onNavigate={close} />}
      />
    </div>
  );
}
