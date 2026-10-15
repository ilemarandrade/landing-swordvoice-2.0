import { LEARNING_PATH_IDS } from "@/common/constants/learningPaths";
import { routes } from "@/common/constants/routes";
import { useSessionStore } from "@/common/store/useSessionStore";

export function useMyPathHref() {
  const path = useSessionStore((state) => state.user?.path ?? null);
  return { myPathHref: `${routes.DASHBOARD_PATHS}/${path ?? LEARNING_PATH_IDS[0]}` };
}
