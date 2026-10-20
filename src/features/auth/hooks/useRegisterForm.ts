import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function useRegisterForm() {
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

  // El registro contra la API llega en el sub-proyecto 2 (ver
  // docs/superpowers/specs/2026-10-19-sesion-real-design.md): hasta entonces
  // el formulario solo valida.
  const onSubmit = handleSubmit(() => undefined);

  return { control, onSubmit, isSubmitting };
}
