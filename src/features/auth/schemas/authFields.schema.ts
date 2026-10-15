import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .max(254, "El correo no puede superar 254 caracteres")
  .pipe(z.email("Ingresa un correo electrónico válido"));
