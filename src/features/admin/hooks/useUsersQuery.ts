import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { paginatedSchema } from "@/common/api/envelope";

export const USERS_PAGE_SIZE = 20;

export type UsersFilter = { search: string; page: number };

async function getUsers({ search, page }: UsersFilter) {
  const { data } = await apiClient.get("/users", {
    params: { page, limit: USERS_PAGE_SIZE, ...(search ? { search } : {}) },
  });
  return paginatedSchema(userSchema).parse(data);
}

export function useUsersQuery(filter: UsersFilter) {
  return useQuery({
    queryKey: ["users", filter],
    queryFn: () => getUsers(filter),
    // La tabla no parpadea al cambiar de página o de búsqueda.
    placeholderData: keepPreviousData,
  });
}
