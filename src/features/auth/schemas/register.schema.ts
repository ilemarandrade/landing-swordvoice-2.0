import { z } from "zod";
import { LEARNING_PATH_IDS } from "@/common/constants/learningPaths";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ingresa tu nombre y apellido")
      .max(120, "El nombre no puede superar 120 caracteres"),
    email: emailField,
    // Las contraseñas no se recortan: los espacios forman parte de ellas.
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar 72 caracteres")
      .regex(/\d/, "La contraseña debe incluir al menos un número"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(72, "La contraseña no puede superar 72 caracteres"),
    path: z.enum(LEARNING_PATH_IDS, "Elige tu path"),
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
