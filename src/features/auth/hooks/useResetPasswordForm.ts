import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { routes } from "@/common/constants/routes";
import { useResetPasswordMutation } from "@/features/auth/hooks/useResetPasswordMutation";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/resetPassword.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

export function useResetPasswordForm(token: string) {
  const router = useRouter();
  const { mutate, isPending, error } = useResetPasswordMutation();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitted },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
  });
  const password = useWatch({ control, name: "password" });

  // Igual que en el registro: corregir `password` actualiza el error de `confirmPassword`.
  useEffect(() => {
    if (isSubmitted) void trigger("confirmPassword");
  }, [password, isSubmitted, trigger]);

  const onSubmit = handleSubmit(({ password: newPassword }) =>
    mutate(
      { token, password: newPassword },
      { onSuccess: () => router.replace(routes.LOGIN) },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    isLinkExpired: isApiErrorCode(error, "INVALID_EMAIL_TOKEN"),
  };
}
