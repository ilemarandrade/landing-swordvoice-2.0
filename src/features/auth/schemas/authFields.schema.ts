import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .max(254, "El correo no puede superar 254 caracteres")
  .pipe(z.email("Ingresa un correo electrónico válido"));

// Las contraseñas no se recortan: los espacios forman parte de ellas.
export const newPasswordField = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña no puede superar 128 caracteres");
