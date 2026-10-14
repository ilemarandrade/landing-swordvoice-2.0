import { z } from "zod";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .max(72, "La contraseña no puede superar 72 caracteres"),
  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
