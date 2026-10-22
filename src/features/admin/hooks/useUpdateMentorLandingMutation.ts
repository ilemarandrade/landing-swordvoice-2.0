import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { notifyError } from "@/common/errors/notifyError";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { mentorLandingSchema } from "@/features/admin/schemas/mentorLanding.schema";

type UpdateMentorLandingRequest = {
  userId: string;
  showOnLanding: boolean;
  landingOrder: number | null;
};

async function updateMentorLanding({
  userId,
  showOnLanding,
  landingOrder,
}: UpdateMentorLandingRequest) {
  const { data } = await apiClient.patch(
    `/mentors/${encodeURIComponent(userId)}/landing`,
    { showOnLanding, landingOrder },
  );
  return mentorLandingSchema.parse(data);
}

export function useUpdateMentorLandingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMentorLanding,
    onSuccess: (landing, variables) => {
      queryClient.setQueryData(
        ["mentors", variables.userId, "landing"],
        landing,
      );
      void queryClient.invalidateQueries({
        queryKey: ["mentors"],
        exact: true,
      });
      toast.success(adminMessages.LANDING_SAVED);
    },
    onError: (error) => {
      // Sin permisos de admin: al recargar /auth/me el AdminGuard saca al usuario del área.
      if (isApiErrorCode(error, "FORBIDDEN")) {
        void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      // LANDING_ORDER_TAKEN se muestra bajo el campo "Posición" (lo hace el formulario).
      if (isApiErrorCode(error, "LANDING_ORDER_TAKEN")) {
        return;
      }
      notifyError(error);
    },
  });
}
