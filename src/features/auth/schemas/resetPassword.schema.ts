import { z } from "zod";
import { newPasswordField } from "@/features/auth/schemas/authFields.schema";

export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(128, "La contraseña no puede superar 128 caracteres"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
