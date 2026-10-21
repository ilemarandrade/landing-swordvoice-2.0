import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { profileSchema } from "@/common/api/profile.schema";
import { notifyError } from "@/common/errors/notifyError";
import { profileMessages } from "@/features/profile/constants/profileMessages";
import type { ProfilePatch } from "@/features/profile/utils/toProfilePatch";

async function updateProfile(patch: ProfilePatch) {
  const { data } = await apiClient.patch("/profiles/me", patch);
  return profileSchema.parse(data);
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile, patch) => {
      queryClient.setQueryData(["profiles", "me"], profile);
      // El nombre también vive en /auth/me (saludo, iniciales).
      if (patch.name !== undefined) {
        void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      toast.success(profileMessages.PROFILE_UPDATED);
    },
    // Estos errores de validación del backend se muestran bajo su campo.
    onError: (error) => {
      if (
        !isApiErrorCode(error, "FREECODECAMP_USERNAME_TAKEN") &&
        !isApiErrorCode(error, "EXPERIENCE_START_IN_FUTURE")
      )
        notifyError(error);
    },
  });
}
