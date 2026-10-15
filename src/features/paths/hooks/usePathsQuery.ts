import { useQuery } from "@tanstack/react-query";
import { pathsQueryOptions } from "@/features/paths/hooks/pathQueryOptions";

export function usePathsQuery() {
  return useQuery(pathsQueryOptions());
}
