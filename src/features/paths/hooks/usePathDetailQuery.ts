import { useQuery } from "@tanstack/react-query";
import { pathDetailQueryOptions } from "@/features/paths/hooks/pathQueryOptions";

export function usePathDetailQuery(slug: string) {
  return useQuery(pathDetailQueryOptions(slug));
}
