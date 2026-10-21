"use client";
import { Button } from "@/common/components/button";
import { usePathsQuery } from "@/common/hooks/usePathsQuery";
import { PathRoleRow } from "@/features/admin/components/users-admin/user-panel/path-role-row";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import type { PathRoleType } from "@/features/admin/constants/pathRoleLabels";
import { useAssignPathRoleMutation } from "@/features/admin/hooks/useAssignPathRoleMutation";
import { useDialog } from "@/features/admin/hooks/useDialog";
import { useRemovePathRoleMutation } from "@/features/admin/hooks/useRemovePathRoleMutation";
import { useUserQuery } from "@/features/admin/hooks/useUserQuery";

type UserPanelProps = { userId: string; onClose: () => void };

export function UserPanel({ userId, onClose }: UserPanelProps) {
  const { closeButtonRef } = useDialog(onClose);
  const user = useUserQuery(userId);
  const paths = usePathsQuery();
  const assign = useAssignPathRoleMutation();
  const remove = useRemovePathRoleMutation();

  const isSaving = (pathId: string) =>
    (assign.isPending && assign.variables?.pathId === pathId) ||
    (remove.isPending && remove.variables?.pathId === pathId);

  const changeRole = (pathId: string, role: PathRoleType | null) => {
    if (role) assign.mutate({ userId, pathId, role });
    else remove.mutate({ userId, pathId });
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-panel-title"
        className="relative flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-white/15 bg-black p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="user-panel-title" className="text-2xl font-bold">
            {user.data?.name ?? "Usuario"}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-3 font-semibold text-primary hover:text-[#FFA34D]"
          >
            Cerrar
          </button>
        </div>
        {user.isNotFound ? (
          <p role="alert">{adminMessages.USER_NOT_FOUND}</p>
        ) : user.isError ? (
          <div role="alert" className="flex flex-col items-start gap-4">
            <p>{adminMessages.USER_LOAD_FAILED}</p>
            <Button
              type="button"
              label="Reintentar"
              onClick={() => void user.refetch()}
            />
          </div>
        ) : !user.data || !paths.data ? (
          <p role="status">Cargando…</p>
        ) : (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
              <dt className="text-[#C9C9D6]">Correo</dt>
              <dd>{user.data.email}</dd>
              <dt className="text-[#C9C9D6]">Confirmado</dt>
              <dd>{user.data.emailVerified ? "Sí" : "No"}</dd>
              <dt className="text-[#C9C9D6]">Rol global</dt>
              <dd>
                {user.data.role === "ADMIN" ? "Administrador" : "Usuario"}
              </dd>
            </dl>
            <h3 className="mt-2 text-lg font-bold text-primary">
              Roles por path
            </h3>
            {paths.data.items.map((path) => (
              <PathRoleRow
                key={path.id}
                pathName={path.name}
                currentRole={
                  user.data.pathRoles.find(
                    (pathRole) => pathRole.path.id === path.id,
                  )?.role ?? null
                }
                disabled={isSaving(path.id)}
                onChange={(role) => changeRole(path.id, role)}
              />
            ))}
          </>
        )}
      </aside>
    </div>
  );
}
