import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresa tu nombre y apellido")
    .max(120, "El nombre no puede superar 120 caracteres"),
  email: z
    .string()
    .trim()
    .pipe(z.email("Ingresa un correo electrónico válido")),
  message: z
    .string()
    .trim()
    .min(1, "Escribe un mensaje")
    .max(2000, "El mensaje no puede superar 2000 caracteres"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const contactResponseSchema = z.object({ ok: z.literal(true) });
