import { useMeQuery } from "@/common/hooks/useMeQuery";

export function useCurrentUser() {
  const { data } = useMeQuery();
  // pathRoles viene ordenado por nombre; el estado sin roles llega en el sub-proyecto 5.
  const primaryPath = data?.pathRoles[0]?.path ?? null;
  return {
    name: data?.name ?? "",
    primaryPath: primaryPath && { slug: primaryPath.slug, name: primaryPath.name },
  };
}
