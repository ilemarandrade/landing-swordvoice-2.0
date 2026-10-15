import { isServer, queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/common/api/ApiError";
import { pathKeys } from "@/features/paths/constants/queryKeys";
import {
  getPathDetail,
  getPaths,
} from "@/features/paths/services/pathsService";

export function pathsQueryOptions() {
  return queryOptions({ queryKey: pathKeys.list(), queryFn: getPaths, retry: isServer ? false : undefined });
}

export function pathDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: pathKeys.detail(slug),
    queryFn: () => getPathDetail(slug),
    // En el servidor no se reintenta; en el cliente, nunca ante un 404.
    retry: (failureCount, error) =>
      !isServer &&
      !(error instanceof ApiError && error.status === 404) &&
      failureCount < 2,
  });
}
