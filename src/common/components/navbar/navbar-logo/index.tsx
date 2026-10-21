"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/common/assets/icons/Logo";
import LogoSwordvoice from "@/common/assets/icons/LogoSwordvoice";
import { routes } from "@/common/constants/routes";

const MotionLogo = motion(Logo);
const MotionLogoSV = motion(LogoSwordvoice);

type NavbarLogoProps = {
  changeLogo: boolean;
};

export function NavbarLogo({ changeLogo }: NavbarLogoProps) {
  return (
    <Link
      href={routes.HOME}
      aria-label="Ir al inicio"
      className={`z-10 flex ${
        // 50vw (no %) para que el ancho sea el mismo dentro del MobileMenu abierto,
        // donde el logo está en un contenedor de ancho intrínseco.
        !changeLogo ? "mx-4 my-8 w-[50vw] md:w-[20%]" : ""
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
  );
}
