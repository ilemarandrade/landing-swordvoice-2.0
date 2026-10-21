import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { type PathRoleType, userSchema } from "@/common/api/auth.schema";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import {
  applyUpdatedUser,
  handlePathRoleError,
} from "@/features/admin/utils/pathRoleCache";

type AssignPathRoleRequest = {
  userId: string;
  pathId: string;
  role: PathRoleType;
};

async function assignPathRole({ userId, pathId, role }: AssignPathRoleRequest) {
  const { data } = await apiClient.put(
    `/users/${encodeURIComponent(userId)}/path-roles/${encodeURIComponent(
      pathId,
    )}`,
    { role },
  );
  return userSchema.parse(data);
}

export function useAssignPathRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignPathRole,
    onSuccess: (user) => {
      applyUpdatedUser(queryClient, user);
      toast.success(adminMessages.ROLE_ASSIGNED);
    },
    onError: (error) => handlePathRoleError(queryClient, error),
  });
}
