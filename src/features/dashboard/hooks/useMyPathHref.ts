import { LEARNING_PATH_IDS } from "@/common/constants/learningPaths";
import { routes } from "@/common/constants/routes";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

export function useMyPathHref() {
  const { primaryPath } = useCurrentUser();
  const slug = primaryPath?.slug ?? LEARNING_PATH_IDS[0];
  return { myPathHref: `${routes.DASHBOARD_PATHS}/${slug}` };
}
