import { z } from "zod";

const GITHUB_URL = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/;
const LINKEDIN_URL =
  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?$/;
const FREECODECAMP_USERNAME = /^[a-zA-Z0-9_-]{3,30}$/;

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

// Vacío es válido en los opcionales: significa borrar el campo.
const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message);

const optionalUrl = (isValid: (value: string) => boolean, message: string) =>
  z
    .string()
    .trim()
    .max(300, "La URL no puede superar 300 caracteres")
    .refine((value) => value === "" || isValid(value), message);

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresa tu nombre")
    .max(80, "El nombre no puede superar 80 caracteres"),
  bio: optionalText(500, "La bio no puede superar 500 caracteres"),
  githubUrl: optionalUrl(
    (value) => GITHUB_URL.test(value),
    "Usa el formato https://github.com/tu-usuario",
  ),
  linkedinUrl: optionalUrl(
    (value) => LINKEDIN_URL.test(value),
    "Usa el formato https://www.linkedin.com/in/tu-perfil",
  ),
  portfolioUrl: optionalUrl(isHttpsUrl, "Usa una URL que empiece por https://"),
  freeCodeCampUsername: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || FREECODECAMP_USERNAME.test(value),
      "Entre 3 y 30 caracteres: letras, números, - o _",
    ),
  professionalTitle: optionalText(
    80,
    "El título no puede superar 80 caracteres",
  ),
  shortDescription: optionalText(
    280,
    "La descripción no puede superar 280 caracteres",
  ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
