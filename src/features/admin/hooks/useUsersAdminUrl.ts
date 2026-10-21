import { useRouter } from "next/navigation";
import type { AcademyRole } from "@/common/api/auth.schema";
import { routes } from "@/common/constants/routes";
import type { UsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

export function useUsersAdminUrl(current: UsersAdminParams) {
  const router = useRouter();

  const navigate = (changes: Partial<UsersAdminParams>) => {
    const next = { ...current, ...changes };
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.academyRole) params.set("academyRole", next.academyRole);
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
    // Cambiar el filtro de rol vuelve a la página 1; la búsqueda se conserva por el spread de `current`.
    setAcademyRole: (academyRole: AcademyRole | null) =>
      navigate({ academyRole, page: 1 }),
    setPage: (page: number) => navigate({ page }),
    openUser: (userId: string) => navigate({ userId }),
    closeUser: () => navigate({ userId: null }),
  };
}
