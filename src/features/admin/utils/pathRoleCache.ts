import type { QueryClient } from "@tanstack/react-query";
import type { User } from "@/common/api/auth.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { notifyError } from "@/common/errors/notifyError";

// El detalle se escribe con la respuesta; solo las listas (["users", { search, page }]) se recargan.
export function applyUpdatedUser(queryClient: QueryClient, user: User): void {
  queryClient.setQueryData(["users", user.id], user);
  void queryClient.invalidateQueries({
    queryKey: ["users"],
    predicate: (query) =>
      typeof query.queryKey[1] === "object" && query.queryKey[1] !== null,
  });
}

export function handlePathRoleError(
  queryClient: QueryClient,
  error: unknown,
): void {
  // Sin permisos de admin: al recargar /auth/me el AdminGuard saca al usuario del área.
  if (isApiErrorCode(error, "FORBIDDEN")) {
    void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }
  if (isApiErrorCode(error, "PATH_NOT_FOUND")) {
    void queryClient.invalidateQueries({ queryKey: ["paths"] });
  }
  notifyError(error);
}
