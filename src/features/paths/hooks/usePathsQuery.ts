import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { paginatedSchema } from "@/common/api/envelope";
import { pathSummarySchema } from "@/features/paths/schemas/path.schema";

// La landing y las pestañas muestran todos los paths: se piden de una vez.
const PATHS_LIMIT = 100;

async function getPaths() {
  const { data } = await apiClient.get("/paths", {
    params: { page: 1, limit: PATHS_LIMIT },
  });
  return paginatedSchema(pathSummarySchema).parse(data);
}

export function usePathsQuery() {
  return useQuery({ queryKey: ["paths"], queryFn: getPaths });
}
