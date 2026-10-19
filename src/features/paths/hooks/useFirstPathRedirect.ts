import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/common/constants/routes";
import { usePathsQuery } from "@/features/paths/hooks/usePathsQuery";

export function useFirstPathRedirect() {
  const router = useRouter();
  const { data, isError, refetch } = usePathsQuery();
  const firstSlug = data?.items[0]?.slug;

  useEffect(() => {
    if (firstSlug !== undefined) router.replace(`${routes.PATHS}/${firstSlug}`);
  }, [firstSlug, router]);

  return {
    isError,
    refetch,
    isEmpty: data !== undefined && data.items.length === 0,
  };
}
