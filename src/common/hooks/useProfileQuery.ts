import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { profileSchema } from "@/common/api/profile.schema";
import { useSession } from "@/common/hooks/useSession";

async function getProfile() {
  const { data } = await apiClient.get("/profiles/me");
  return profileSchema.parse(data);
}

export function useProfileQuery() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["profiles", "me"],
    queryFn: getProfile,
    enabled: status === "authenticated",
  });
}
