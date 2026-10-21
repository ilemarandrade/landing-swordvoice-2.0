import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { type AcademyRole, userSchema } from "@/common/api/auth.schema";
import { paginatedSchema } from "@/common/api/envelope";

export const USERS_PAGE_SIZE = 20;

export type UsersFilter = {
  search: string;
  page: number;
  academyRole: AcademyRole | null;
};

async function getUsers({ search, page, academyRole }: UsersFilter) {
  const { data } = await apiClient.get("/users", {
    params: {
      page,
      limit: USERS_PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(academyRole ? { academyRole } : {}),
    },
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
