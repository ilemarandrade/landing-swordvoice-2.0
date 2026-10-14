import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSessionStore } from "@/common/store/useSessionStore";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  path: "iniciated",
  acceptTerms: false,
};

export function useRegisterForm() {
  const signIn = useSessionStore((state) => state.signIn);
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting, isSubmitted },
  } = useForm<RegisterFormValues>({
    defaultValues,
    resolver: zodResolver(registerSchema),
  });
  const password = useWatch({ control, name: "password" });

  // Tras un envío fallido, corregir `password` debe actualizar el error de `confirmPassword`.
  useEffect(() => {
    if (isSubmitted) void trigger("confirmPassword");
  }, [password, isSubmitted, trigger]);

  // Sin backend todavía (roadmap feature 1): abre la sesión local y el
  // SessionGuard del grupo (auth) redirige al dashboard.
  const onSubmit = handleSubmit(({ name, email, path }) => {
    signIn({ name, email, path });
  });

  return { control, onSubmit, isSubmitting };
}
