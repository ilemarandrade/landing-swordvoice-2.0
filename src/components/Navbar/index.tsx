"use client";
import routes from "@/constants/routes";
import Logo from "@/assets/icons/Logo";
import { MouseEvent, RefObject, useEffect, useState } from "react";
import Hamburguer from "@/assets/icons/Hamburguer";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { Typography } from "../Typography";
import { motion, AnimatePresence } from "framer-motion";
import { navAnimation } from "@/constants/animations/navAnimation";
import LogoSwordvoice from "@/assets/icons/LogoSwordvoice";

const MotionLogo = motion(Logo);
const MotionLogoSV = motion(LogoSwordvoice);
interface INavItem {
  label: string;
  href: string;
}
interface INav {
  changeLogo: boolean;
}
const links: INavItem[] = [
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];

const linksResponsive: INavItem[] = [
  { href: routes.HOME, label: "Home" },
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];
const Navbar = (changeLogo: INav) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile && showMenu) {
      setShowMenu(false);
    }
  }, [isMobile, showMenu]);

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    ancla: string,
  ) => {
    event.preventDefault();
    const isHome = ancla === "/";

    if (isMobile) {
      setShowMenu(false);
    }

    const addPx = !isMobile ? 85 : 110;
    const desplazamiento =
      // @ts-ignore
      document.querySelector(isHome ? "#home" : ancla.slice(1))?.offsetTop -
      addPx;

    window.scrollTo({ top: desplazamiento, behavior: "smooth" });
  };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true }}
      className={`z-30 bg-blurry fixed flex justify-center ${
        !showMenu
          ? `w-full md:justify-between h-[85px] `
          : `bg-center after:inset-0 after:absolute after:bg-blue300 bg-[url('/backgrounds/homeBackground.jpg')] flex-col items-center w-screen h-full`
      }`}
    >
      {!changeLogo.changeLogo ? (
        <AnimatePresence>
          <MotionLogo
            className="w-[50%] md:w-[20%] mx-4 my-8 z-10"
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
            className="m-8 z-10"
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

      <motion.div
        variants={navAnimation.nav}
        className="hidden md:flex mx-8 mt-5 gap-[40px] py-4"
      >
        {links.map((link: INavItem, index: number) => (
          <a
            href={link.href}
            key={index}
            className="no-underline"
            onClick={(event) => handleClick(event, link.href)}
          >
            <Typography
              variant="h6"
              className="font-medium text-white no-underline font-sedgwick hover:text-primary"
            >
              {link.label}
            </Typography>
          </a>
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
            {linksResponsive.map((link: INavItem, index: number) => (
              <a
                href={link.href}
                key={index}
                className="no-underline"
                onClick={(event) => handleClick(event, link.href)}
              >
                <Typography
                  variant="h5"
                  className="font-medium text-white no-underline font-sedgwick my-4 hover:text-primary"
                >
                  {link.label}
                </Typography>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Navbar;
