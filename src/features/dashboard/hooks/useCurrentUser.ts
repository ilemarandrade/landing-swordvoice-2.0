import { useMeQuery } from "@/common/hooks/useMeQuery";

export function useCurrentUser() {
  const { data } = useMeQuery();
  // pathRoles viene ordenado por nombre del path: el primero es el principal.
  const primary = data?.pathRoles[0] ?? null;
  const apprentice =
    data?.pathRoles.find((pathRole) => pathRole.role === "APPRENTICE") ?? null;
  return {
    name: data?.name ?? "",
    primaryPath: primary && {
      slug: primary.path.slug,
      name: primary.path.name,
    },
    apprenticePath: apprentice && {
      slug: apprentice.path.slug,
      name: apprentice.path.name,
    },
    academyRole: data?.academyRole ?? null,
    isAdmin: data?.academyRole === "ADMIN",
    hasPathRoles: primary !== null,
  };
}
