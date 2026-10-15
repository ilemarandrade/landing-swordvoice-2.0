import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/common/api/ApiError";
import { pathKeys } from "@/features/paths/constants/queryKeys";
import {
  getPathDetail,
  getPaths,
} from "@/features/paths/services/pathsService";

export function pathsQueryOptions() {
  return queryOptions({ queryKey: pathKeys.list(), queryFn: getPaths });
}

export function pathDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: pathKeys.detail(slug),
    queryFn: () => getPathDetail(slug),
    // Un 404 no se reintenta: el path no existe.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  });
}
