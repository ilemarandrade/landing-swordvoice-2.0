import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { mentorLandingSchema } from "@/features/admin/schemas/mentorLanding.schema";

async function getMentorLanding(userId: string) {
  const { data } = await apiClient.get(
    `/mentors/${encodeURIComponent(userId)}/landing`,
  );
  return mentorLandingSchema.parse(data);
}

export function useMentorLandingQuery(
  userId: string,
  { enabled }: { enabled: boolean },
) {
  const query = useQuery({
    queryKey: ["mentors", userId, "landing"],
    queryFn: () => getMentorLanding(userId),
    enabled,
  });
  return {
    ...query,
    isNotFound: isApiErrorCode(query.error, "USER_NOT_FOUND"),
  };
}
