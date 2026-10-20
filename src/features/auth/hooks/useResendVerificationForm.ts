import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from "@/features/auth/schemas/recoverPassword.schema";

export function useResendVerificationForm() {
  const { mutate, isPending } = useResendVerificationMutation();
  const { control, handleSubmit } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  const onSubmit = handleSubmit(({ email }) => mutate(email));

  return { control, onSubmit, isSubmitting: isPending };
}
