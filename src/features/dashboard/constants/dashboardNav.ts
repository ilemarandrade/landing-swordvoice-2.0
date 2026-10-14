import { routes } from "@/common/constants/routes";

export type DashboardNavItem = { id: string; label: string; href?: string };

export const dashboardNav: DashboardNavItem[] = [
  { id: "inicio", label: "Inicio", href: routes.DASHBOARD },
  { id: "path", label: "Mi path" },
  { id: "mentor", label: "Mi mentor" },
  { id: "sesiones", label: "Sesiones" },
  { id: "portafolio", label: "Portafolio" },
  { id: "comunidad", label: "Comunidad" },
  { id: "ajustes", label: "Ajustes" },
];
