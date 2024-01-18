"use client";
import routes from "@/constants/routes";
import Logo from "@/assets/icons/Logo";
import { MouseEvent, useEffect, useState } from "react";
import Hamburguer from "@/assets/icons/Hamburguer";
import { useIsMobile } from "@/constants/Hooks/useIsMobile";
import { Typography } from "../Typography";

interface NavItem {
  label: string;
  href: string;
}

const links: NavItem[] = [
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];

const linksResponsive: NavItem[] = [
  { href: routes.HOME, label: "Home" },
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];
const Navbar = () => {
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
    <div
      className={`z-10 bg-blurry fixed flex justify-center ${
        !showMenu
          ? `w-full md:justify-between h-[85px] `
          : `bg-center after:inset-0 after:absolute after:bg-blue300 bg-[url('/backgrounds/homeBackground.jpg')] flex-col items-center w-screen h-full`
      }`}
    >
      <Logo className="w-[50%] md:w-[20%] mx-4 my-8 z-10" />
      <div className="hidden md:flex mx-8 mt-5 gap-[40px] py-4">
        {links.map((link: NavItem, index: number) => (
          <a
            href={link.href}
            key={index}
            className="no-underline"
            onClick={(event) => handleClick(event, link.href)}
          >
            <Typography
              variant="h6"
              className="font-medium text-white no-underline font-sedgwick"
            >
              {link.label}
            </Typography>
          </a>
        ))}
      </div>

      <div
        className={`md:hidden ${
          showMenu &&
          `z-10 border-2 border-blue200 border-b-transparent rounded-t-[10px] p-10 flex flex-col items-center`
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
            {linksResponsive.map((link: NavItem, index: number) => (
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
    </div>
  );
};

export default Navbar;
