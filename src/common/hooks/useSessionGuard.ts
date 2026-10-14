import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { routes } from "@/common/constants/routes";
import { useSessionStore } from "@/common/store/useSessionStore";

export type SessionAccess = "private" | "guest";

const subscribeToHydration = (onChange: () => void) =>
  useSessionStore.persist.onFinishHydration(onChange);
const getIsHydrated = () => useSessionStore.persist.hasHydrated();
// En el servidor no hay localStorage: se asume "aún no hidratado".
const getServerIsHydrated = () => false;

export function useSessionGuard(access: SessionAccess) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getIsHydrated,
    getServerIsHydrated,
  );
  const isAuthenticated = useSessionStore((state) => state.user !== null);
  const mustRedirect =
    isHydrated &&
    (access === "private" ? !isAuthenticated : isAuthenticated);

  useEffect(() => {
    if (mustRedirect) {
      router.replace(access === "private" ? routes.LOGIN : routes.DASHBOARD);
    }
  }, [mustRedirect, access, router]);

  // Las vistas de invitado se renderizan desde el servidor (SEO); las privadas
  // esperan a conocer la sesión para no mostrar contenido protegido.
  const canRender =
    access === "guest" ? !mustRedirect : isHydrated && !mustRedirect;

  return { canRender };
}
