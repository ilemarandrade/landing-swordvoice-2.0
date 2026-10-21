import { useRouter } from "next/navigation";
import { routes } from "@/common/constants/routes";
import type { UsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

export function useUsersAdminUrl(current: UsersAdminParams) {
  const router = useRouter();

  const navigate = (changes: Partial<UsersAdminParams>) => {
    const next = { ...current, ...changes };
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.userId) params.set("user", next.userId);
    const query = params.toString();
    router.replace(
      query
        ? `${routes.DASHBOARD_ADMIN_USERS}?${query}`
        : routes.DASHBOARD_ADMIN_USERS,
      { scroll: false },
    );
  };

  return {
    // Una búsqueda nueva siempre empieza en la página 1.
    setSearch: (search: string) => navigate({ search, page: 1 }),
    setPage: (page: number) => navigate({ page }),
    openUser: (userId: string) => navigate({ userId }),
    closeUser: () => navigate({ userId: null }),
  };
}
