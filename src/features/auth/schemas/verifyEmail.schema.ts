import { z } from "zod";

export const verifyEmailSchema = z.object({
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .max(128, "La contraseña no puede superar 128 caracteres"),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
