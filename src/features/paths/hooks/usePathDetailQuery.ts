import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/common/api/ApiError";
import { pathDetailQueryOptions } from "@/features/paths/hooks/pathQueryOptions";

export function usePathDetailQuery(slug: string) {
  const query = useQuery(pathDetailQueryOptions(slug));
  const isNotFound =
    query.error instanceof ApiError && query.error.status === 404;
  return { ...query, isNotFound };
}
