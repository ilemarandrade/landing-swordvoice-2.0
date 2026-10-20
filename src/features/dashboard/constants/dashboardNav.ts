import { routes } from "@/common/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href?: string;
  activePrefix?: string;
};

export const dashboardNav: DashboardNavItem[] = [
  { id: "inicio", label: "Inicio", href: routes.DASHBOARD },
  {
    id: "usuarios",
    label: "Usuarios",
    href: routes.DASHBOARD_ADMIN_USERS,
    activePrefix: routes.DASHBOARD_ADMIN,
  },
  { id: "path", label: "Mi path", href: routes.DASHBOARD_PATHS, activePrefix: routes.DASHBOARD_PATHS },
  { id: "mentor", label: "Mi mentor" },
  { id: "sesiones", label: "Sesiones" },
  { id: "portafolio", label: "Portafolio" },
  { id: "comunidad", label: "Comunidad" },
  { id: "perfil", label: "Mi perfil", href: routes.DASHBOARD_PROFILE },
  { id: "ajustes", label: "Ajustes" },
];
