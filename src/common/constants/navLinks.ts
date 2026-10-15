import { routes } from "@/common/constants/routes";

export type NavItem = { label: string; href: string };

export const navLinks: NavItem[] = [
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];

export const mobileNavLinks: NavItem[] = [
  { href: routes.HOME, label: "Home" },
  ...navLinks,
];
