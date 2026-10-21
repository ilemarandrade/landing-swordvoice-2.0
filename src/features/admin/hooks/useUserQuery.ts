import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";

async function getUser(id: string) {
  const { data } = await apiClient.get(`/users/${encodeURIComponent(id)}`);
  return userSchema.parse(data);
}

export function useUserQuery(id: string | null) {
  const query = useQuery({
    queryKey: ["users", id],
    queryFn: () => getUser(id ?? ""),
    enabled: id !== null,
  });
  return {
    ...query,
    isNotFound: isApiErrorCode(query.error, "USER_NOT_FOUND"),
  };
}
