import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import {
  applyUpdatedUser,
  handlePathRoleError,
} from "@/features/admin/utils/pathRoleCache";

type RemovePathRoleRequest = { userId: string; pathId: string };

async function removePathRole({ userId, pathId }: RemovePathRoleRequest) {
  const { data } = await apiClient.delete(
    `/users/${encodeURIComponent(userId)}/path-roles/${encodeURIComponent(
      pathId,
    )}`,
  );
  return userSchema.parse(data);
}

export function useRemovePathRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePathRole,
    onSuccess: (user) => {
      applyUpdatedUser(queryClient, user);
      toast.success(adminMessages.ROLE_REMOVED);
    },
    onError: (error, { userId }) => {
      // Otro admin ya lo quitó: no es un error, solo hay que recargar el usuario.
      if (isApiErrorCode(error, "PATH_ROLE_NOT_FOUND")) {
        void queryClient.invalidateQueries({
          queryKey: ["users", userId],
          exact: true,
        });
        return;
      }
      handlePathRoleError(queryClient, error);
    },
  });
}
