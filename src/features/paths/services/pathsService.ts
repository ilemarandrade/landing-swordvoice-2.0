import { paginatedSchema } from "@/common/api/envelope";
import { request } from "@/common/api/httpClient";
import {
  pathDetailSchema,
  pathSummarySchema,
} from "@/features/paths/schemas/path.schema";

// La landing y las pestañas muestran todos los paths: se piden de una vez.
const PATHS_LIMIT = 100;

export function getPaths() {
  return request("/paths", {
    params: { page: 1, limit: PATHS_LIMIT },
    schema: paginatedSchema(pathSummarySchema),
  });
}

export function getPathDetail(slug: string) {
  return request(`/paths/${encodeURIComponent(slug)}`, {
    schema: pathDetailSchema,
  });
}
