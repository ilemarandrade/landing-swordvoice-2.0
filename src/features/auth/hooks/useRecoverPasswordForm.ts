import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from "@/features/auth/schemas/recoverPassword.schema";

export function useRecoverPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  // Sin backend todavía (roadmap feature 1): solo muestra la confirmación.
  const onSubmit = handleSubmit(() => setIsSent(true));

  return {
    control,
    onSubmit,
    isSubmitting,
    isSent,
    resend: () => setIsSent(false),
  };
}
