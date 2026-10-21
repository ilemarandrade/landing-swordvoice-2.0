import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";

const defaultValues: LoginFormValues = { email: "", password: "" };

export function useLoginForm() {
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { mutate, isPending } = useLoginMutation();
  const resendMutation = useResendVerificationMutation();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  // Al guardar los tokens, el SessionGuard del grupo (guest) redirige al dashboard.
  const onSubmit = handleSubmit((values) => {
    setUnverifiedEmail(null);
    mutate(values, {
      onError: (error) => {
        if (isApiErrorCode(error, "EMAIL_NOT_VERIFIED")) setUnverifiedEmail(values.email);
      },
    });
  });

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    unverifiedEmail,
    resendVerification: () => {
      if (unverifiedEmail) resendMutation.mutate(unverifiedEmail);
    },
    isResending: resendMutation.isPending,
  };
}
