import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { useSession } from "@/common/hooks/useSession";

async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return userSchema.parse(data);
}

export function useMeQuery() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: status === "authenticated",
  });
}
