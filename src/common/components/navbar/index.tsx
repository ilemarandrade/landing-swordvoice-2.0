"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { type MouseEvent, useEffect, useState } from "react";
import Hamburguer from "@/common/assets/icons/Hamburguer";
import Logo from "@/common/assets/icons/Logo";
import LogoSwordvoice from "@/common/assets/icons/LogoSwordvoice";
import { NavLink } from "@/common/components/navbar/nav-link";
import { navAnimation } from "@/common/constants/animations/navAnimation";
import { mobileNavLinks, navLinks } from "@/common/constants/navLinks";
import { routes } from "@/common/constants/routes";
import { useIsMobile } from "@/common/hooks/useIsMobile";

const MotionLogo = motion(Logo);
const MotionLogoSV = motion(LogoSwordvoice);

type NavbarProps = {
  changeLogo: boolean;
};

export function Navbar({ changeLogo }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile && showMenu) {
      setShowMenu(false);
    }
  }, [isMobile, showMenu]);

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
    if (isMobile) {
      setShowMenu(false);
    }
    const navbarOffset = isMobile ? 110 : 85;
    window.scrollTo({
      top: target.offsetTop - navbarOffset,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true }}
      className={`z-30 bg-blurry fixed top-0 left-0 flex justify-center ${
        !showMenu
          ? `w-full md:justify-between h-[85px] `
          : `bg-center after:inset-0 after:absolute after:bg-blue300 bg-[url('/backgrounds/homeBackground.jpg')] flex-col items-center w-screen h-full`
      }`}
    >
      <Link
        href={routes.HOME}
        aria-label="Ir al inicio"
        className={`z-10 flex ${
          !changeLogo ? "mx-4 my-8 w-[50%] md:w-[20%]" : ""
        }`}
      >
        {!changeLogo ? (
          <AnimatePresence>
            <MotionLogo
              className="w-full"
              transition={{
                duration: 0.5,
                ease: [0, 0.71, 0.2, 1.1],
              }}
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -200 }}
            />
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            <MotionLogoSV
              className="m-8 z-10 h-16"
              transition={{
                duration: 0.5,
                ease: [0, 0.71, 0.2, 1.1],
              }}
              initial={{ x: -370, opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -370, opacity: 0 }}
            />
          </AnimatePresence>
        )}
      </Link>

      <motion.div
        variants={navAnimation.nav}
        className="hidden md:flex mx-8 mt-5 gap-[40px] py-4"
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
      </motion.div>

      <div
        className={`md:hidden ${
          showMenu &&
          `z-30 border-2 border-blue200 border-b-transparent rounded-t-[10px] p-10 flex flex-col items-center`
        }`}
      >
        <div className={`${!showMenu && `absolute right-4 top-8`}`}>
          <Hamburguer
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer hover:animate-spin-slow"
          />
        </div>
        {showMenu && (
          <div className="flex flex-col items-center mt-4">
            {mobileNavLinks.map((link) => (
              <NavLink
                key={link.href}
                item={link}
                variant="h5"
                className="font-medium text-white no-underline font-sedgwick my-4 hover:text-primary"
                onNavigate={handleClick}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
