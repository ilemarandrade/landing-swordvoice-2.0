import { useMeQuery } from "@/common/hooks/useMeQuery";

export function useCurrentUser() {
  const { data } = useMeQuery();
  // pathRoles viene ordenado por nombre del path: el primero es el principal.
  const primary = data?.pathRoles[0] ?? null;
  return {
    name: data?.name ?? "",
    primaryPath: primary && {
      slug: primary.path.slug,
      name: primary.path.name,
    },
    primaryRole: primary?.role ?? null,
    isAdmin: data?.role === "ADMIN",
    hasPathRoles: primary !== null,
  };
}
