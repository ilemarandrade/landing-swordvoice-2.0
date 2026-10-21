"use client";
import { Button } from "@/common/components/button";
import { UserSearchForm } from "@/features/admin/components/users-admin/user-search-form";
import { UsersPagination } from "@/features/admin/components/users-admin/users-pagination";
import { UsersTable } from "@/features/admin/components/users-admin/users-table";
import { useUserSearchForm } from "@/features/admin/hooks/useUserSearchForm";
import { useUsersAdminUrl } from "@/features/admin/hooks/useUsersAdminUrl";
import { useUsersQuery } from "@/features/admin/hooks/useUsersQuery";
import type { UsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

export function UsersAdmin(params: UsersAdminParams) {
  const { search, page } = params;
  const url = useUsersAdminUrl(params);
  const searchForm = useUserSearchForm(search, url.setSearch);
  const users = useUsersQuery({ search, page });

  return (
    <>
      <h1 className="font-sedgwick text-[32px] md:text-5xl">
        <span className="text-primary">Usuarios</span>
      </h1>
      <UserSearchForm
        control={searchForm.control}
        onSubmit={searchForm.onSubmit}
      />
      {users.isError && !users.data ? (
        <div role="alert" className="flex flex-col items-start gap-4">
          <p>No pudimos cargar los usuarios.</p>
          <Button
            type="button"
            label="Reintentar"
            onClick={() => void users.refetch()}
          />
        </div>
      ) : users.data ? (
        <>
          <UsersTable
            users={users.data.items}
            search={search}
            onOpen={url.openUser}
          />
          <UsersPagination
            page={users.data.meta.page}
            totalPages={users.data.meta.totalPages}
            onPageChange={url.setPage}
          />
        </>
      ) : (
        <p role="status">Cargando usuarios…</p>
      )}
    </>
  );
}
