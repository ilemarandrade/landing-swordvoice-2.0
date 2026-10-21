import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/common/constants/routes";
import { useMeQuery } from "@/common/hooks/useMeQuery";

// Barrera de UI: la API responde 403 a quien no es admin.
export function useAdminAccess() {
  const router = useRouter();
  const { data } = useMeQuery();
  const isAdmin = data?.academyRole === "ADMIN";
  const mustRedirect = data !== undefined && !isAdmin;

  useEffect(() => {
    if (mustRedirect) router.replace(routes.DASHBOARD);
  }, [mustRedirect, router]);

  return { canRender: isAdmin };
}
