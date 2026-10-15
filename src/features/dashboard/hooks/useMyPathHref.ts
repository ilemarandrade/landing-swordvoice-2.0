import { LEARNING_PATH_IDS } from "@/common/constants/learningPaths";
import { routes } from "@/common/constants/routes";
import { useSessionStore } from "@/common/store/useSessionStore";

export function useMyPathHref() {
  const path = useSessionStore((state) => state.user?.path ?? null);
  const slug =
    path && (LEARNING_PATH_IDS as readonly string[]).includes(path)
      ? path
      : LEARNING_PATH_IDS[0];
  return { myPathHref: `${routes.DASHBOARD_PATHS}/${slug}` };
}
