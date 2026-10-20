import { dashboardNav } from "@/features/dashboard/constants/dashboardNav";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";
import { useMyPathHref } from "@/features/dashboard/hooks/useMyPathHref";

export function useVisibleNavItems() {
  const { isAdmin, hasPathRoles } = useCurrentUser();
  const { myPathHref } = useMyPathHref();

  const items = dashboardNav
    // "Usuarios" solo para admin; "Mi path" solo con un path asignado.
    .filter(
      (item) =>
        (item.id !== "usuarios" || isAdmin) &&
        (item.id !== "path" || hasPathRoles),
    )
    .map((item) => (item.id === "path" ? { ...item, href: myPathHref } : item));

  return { items };
}
