import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

const defaultValues: LoginFormValues = { email: "", password: "" };

export function useLoginForm() {
  const { mutate, isPending } = useLoginMutation();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  // Al guardar los tokens, el SessionGuard del grupo (auth) redirige al dashboard.
  const onSubmit = handleSubmit((values) => mutate(values));

  return { control, onSubmit, isSubmitting: isPending };
}
