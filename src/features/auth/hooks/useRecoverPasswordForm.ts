import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useForgotPasswordMutation } from "@/features/auth/hooks/useForgotPasswordMutation";
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from "@/features/auth/schemas/recoverPassword.schema";

export function useRecoverPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const { mutate, isPending } = useForgotPasswordMutation();
  const { control, handleSubmit } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  // La API responde igual exista o no la cuenta.
  const onSubmit = handleSubmit(({ email }) =>
    mutate(email, { onSuccess: () => setIsSent(true) }),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    isSent,
    resend: () => setIsSent(false),
  };
}
