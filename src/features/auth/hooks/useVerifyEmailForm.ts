import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { routes } from "@/common/constants/routes";
import { authMessages } from "@/features/auth/constants/authMessages";
import { useVerifyEmailMutation } from "@/features/auth/hooks/useVerifyEmailMutation";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/features/auth/schemas/verifyEmail.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";

export function useVerifyEmailForm(token: string) {
  const router = useRouter();
  const { mutate, isPending, error } = useVerifyEmailMutation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    defaultValues: { password: "" },
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit = handleSubmit(({ password }) =>
    mutate(
      { token, password },
      {
        onSuccess: () => router.replace(routes.DASHBOARD),
        // El enlace sigue sirviendo: se puede reintentar.
        onError: (mutationError) => {
          if (isApiErrorCode(mutationError, "INVALID_CREDENTIALS")) {
            setError("password", { message: authMessages.WRONG_ACCOUNT_PASSWORD });
          }
        },
      },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    isWrongPassword: errors.password?.message === authMessages.WRONG_ACCOUNT_PASSWORD,
    isLinkExpired: isApiErrorCode(error, "INVALID_EMAIL_TOKEN"),
  };
}
