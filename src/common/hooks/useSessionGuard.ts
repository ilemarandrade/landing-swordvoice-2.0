import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/common/constants/routes";
import { useMeQuery } from "@/common/hooks/useMeQuery";
import { useSession } from "@/common/hooks/useSession";

export type SessionAccess = "private" | "guest";
export type GuardStatus = "loading" | "error" | "ready" | "redirecting";

export function useSessionGuard(access: SessionAccess) {
  const router = useRouter();
  const { status: session } = useSession();
  const me = useMeQuery();
  // Con "unknown" (servidor/hidratación) nunca se redirige.
  const mustRedirect =
    access === "private" ? session === "anonymous" : session === "authenticated";

  useEffect(() => {
    if (mustRedirect) {
      router.replace(access === "private" ? routes.LOGIN : routes.DASHBOARD);
    }
  }, [mustRedirect, access, router]);

  let status: GuardStatus;
  if (mustRedirect) status = "redirecting";
  // Las vistas de invitado se renderizan desde el servidor (SEO).
  else if (access === "guest") status = "ready";
  else if (me.isError) status = "error";
  else if (me.isSuccess) status = "ready";
  else status = "loading";

  return { status, retry: () => void me.refetch() };
}
