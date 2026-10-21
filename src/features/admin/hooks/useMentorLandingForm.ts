import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { useUpdateMentorLandingMutation } from "@/features/admin/hooks/useUpdateMentorLandingMutation";
import {
  mentorLandingFormSchema,
  toMentorLandingPatch,
  type MentorLanding,
  type MentorLandingFormValues,
} from "@/features/admin/schemas/mentorLanding.schema";

function toMentorLandingFormValues(
  landing: MentorLanding,
): MentorLandingFormValues {
  return {
    showOnLanding: landing.showOnLanding,
    landingOrder:
      landing.landingOrder === null ? "" : String(landing.landingOrder),
  };
}

export function useMentorLandingForm(landing: MentorLanding) {
  const { mutate, isPending } = useUpdateMentorLandingMutation();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<MentorLandingFormValues>({
    defaultValues: toMentorLandingFormValues(landing),
    resolver: zodResolver(mentorLandingFormSchema),
  });

  const onSubmit = handleSubmit((values) =>
    mutate(
      { userId: landing.userId, ...toMentorLandingPatch(values) },
      {
        // Lo guardado pasa a ser el nuevo punto de partida (sin cambios pendientes).
        onSuccess: (updated) => reset(toMentorLandingFormValues(updated)),
        onError: (error) => {
          if (isApiErrorCode(error, "LANDING_ORDER_TAKEN")) {
            setError("landingOrder", {
              message: adminMessages.LANDING_ORDER_TAKEN,
            });
          }
        },
      },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    canSubmit: isDirty && !isPending,
  };
}
