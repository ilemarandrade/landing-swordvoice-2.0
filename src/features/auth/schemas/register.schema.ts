import { z } from "zod";
import {
  emailField,
  newPasswordField,
} from "@/features/auth/schemas/authFields.schema";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ingresa tu nombre y apellido")
      .max(80, "El nombre no puede superar 80 caracteres"),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(128, "La contraseña no puede superar 128 caracteres"),
    acceptTerms: z
      .boolean()
      .refine(
        (accepted) => accepted,
        "Debes aceptar los Términos y la Política de privacidad",
      ),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
