import Link from "next/link";
import routes from "@/constants/routes";
import Logo from "@/assets/icons/Logo";
import { Typography } from "../Typography";

interface NavItem {
  label: string;
  href: string;
}

const links: NavItem[] = [
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];

const Navbar = () => {
  return (
    <div className="bg-blurry w-full fixed flex justify-between h-[85px] z-20">
      <Logo className="mx-8 mt-8" />
      <div className="mx-8 mt-5 flex gap-[40px] py-4">
        {links.map((link: NavItem, index: number) => (
          <Link href={link.href} key={index} className="no-underline">
            <Typography
              variant="h6"
              className="font-medium text-white no-underline font-sedgwick"
            >
              {link.label}
            </Typography>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
