import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import type { Profile } from "@/common/api/profile.schema";
import { profileMessages } from "@/features/profile/constants/profileMessages";
import { useUpdateProfileMutation } from "@/features/profile/hooks/useUpdateProfileMutation";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas/profileForm.schema";
import {
  toProfileFormValues,
  toProfilePatch,
} from "@/features/profile/utils/toProfilePatch";

export function useProfileForm(
  profile: Profile,
  { isMentor }: { isMentor: boolean },
) {
  const { mutate, isPending } = useUpdateProfileMutation();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { dirtyFields, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: toProfileFormValues(profile),
    resolver: zodResolver(profileFormSchema),
  });

  const onSubmit = handleSubmit((values) =>
    mutate(toProfilePatch(values, dirtyFields, { isMentor }), {
      // Lo guardado pasa a ser el nuevo punto de partida (sin cambios pendientes).
      onSuccess: (updated) => reset(toProfileFormValues(updated)),
      onError: (error) => {
        if (isApiErrorCode(error, "FREECODECAMP_USERNAME_TAKEN")) {
          setError("freeCodeCampUsername", {
            message: profileMessages.FREECODECAMP_TAKEN,
          });
        }
        if (isApiErrorCode(error, "EXPERIENCE_START_IN_FUTURE")) {
          setError("experienceStartedAt", {
            message: profileMessages.EXPERIENCE_START_IN_FUTURE,
          });
        }
      },
    }),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    canSubmit: isDirty && !isPending,
  };
}
