import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { mentorsSchema } from "@/features/home/schemas/mentor.schema";

async function getMentors() {
  const { data } = await apiClient.get("/mentors");
  return mentorsSchema.parse(data);
}

export function useMentorsQuery() {
  return useQuery({ queryKey: ["mentors"], queryFn: getMentors });
}
