import type { NavItem } from "@/common/constants/navLinks";
import { routes } from "@/common/constants/routes";
import { CONTACT_EMAIL } from "@/common/constants/site";

export const accountLinks: NavItem[] = [
  { href: routes.LOGIN, label: "Iniciar sesión" },
  { href: routes.REGISTER, label: "Registrarme" },
  { href: routes.RECOVER_PASSWORD, label: "Recuperar contraseña" },
];

export const legalLinks: NavItem[] = [
  { href: routes.TERMS, label: "Términos y condiciones" },
  { href: routes.PRIVACY, label: "Política de privacidad" },
  { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
];
