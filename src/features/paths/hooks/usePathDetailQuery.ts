import { useQueries, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { pathDetailSchema } from "@/features/paths/schemas/path.schema";

async function getPathDetail(slug: string) {
  const { data } = await apiClient.get(`/paths/${encodeURIComponent(slug)}`);
  return pathDetailSchema.parse(data);
}

const pathDetailQuery = (slug: string) => ({
  queryKey: ["paths", slug],
  queryFn: () => getPathDetail(slug),
});

export function usePathDetailQuery(slug: string) {
  const query = useQuery(pathDetailQuery(slug));
  const isNotFound =
    query.error instanceof ApiError && query.error.status === 404;
  return { ...query, isNotFound };
}

export function usePathDetailsQueries(slugs: string[]) {
  return useQueries({ queries: slugs.map(pathDetailQuery) });
}
