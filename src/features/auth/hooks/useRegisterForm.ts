import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { authMessages } from "@/features/auth/constants/authMessages";
import { useRegisterMutation } from "@/features/auth/hooks/useRegisterMutation";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function useRegisterForm() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();
  const resendMutation = useResendVerificationMutation();
  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { isSubmitted, errors },
  } = useForm<RegisterFormValues>({
    defaultValues,
    resolver: zodResolver(registerSchema),
  });
  const password = useWatch({ control, name: "password" });

  // Tras un envío fallido, corregir `password` debe actualizar el error de `confirmPassword`.
  useEffect(() => {
    if (isSubmitted) void trigger("confirmPassword");
  }, [password, isSubmitted, trigger]);

  const onSubmit = handleSubmit(({ name, email, password }) =>
    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: () => setSentEmail(email),
        onError: (error) => {
          if (isApiErrorCode(error, "EMAIL_TAKEN")) {
            setError("email", { message: authMessages.EMAIL_TAKEN });
          }
        },
      },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: registerMutation.isPending,
    // Desaparece cuando el campo se vuelve a validar al editarlo.
    isEmailTaken: errors.email?.message === authMessages.EMAIL_TAKEN,
    sentEmail,
    resend: () => {
      if (sentEmail) resendMutation.mutate(sentEmail);
    },
    isResending: resendMutation.isPending,
  };
}
