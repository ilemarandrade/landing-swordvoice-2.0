import { queryOptions } from "@tanstack/react-query";
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
  });
}
