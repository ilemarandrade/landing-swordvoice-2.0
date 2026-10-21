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

// AAAA-MM-DD que existe de verdad (descarta 2019-02-30 o 2019-13-01).
function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

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
  bio: optionalText(1500, "La bio no puede superar 1500 caracteres"),
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
    150,
    "La descripción no puede superar 150 caracteres",
  ),
  experienceStartedAt: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isRealDate(value),
      "Usa una fecha válida",
    )
    .refine(
      // Solo compara fechas bien formadas; las inválidas ya tienen su mensaje.
      (value) => !isRealDate(value) || value <= todayUtc(),
      "La fecha no puede ser futura",
    ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
