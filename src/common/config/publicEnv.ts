import { z } from "zod";

const LOCAL_API_URL = "http://localhost:4000/api/v1";

// En producción la URL es obligatoria; en desarrollo y tests cae a la API local.
const apiUrlSchema =
  process.env.NODE_ENV === "production"
    ? z.url()
    : z.url().default(LOCAL_API_URL);

// Client IDs públicos de OAuth (el secret solo vive en la API). Vacío = no configurado.
const optionalClientId = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: apiUrlSchema,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: optionalClientId,
  NEXT_PUBLIC_GITHUB_CLIENT_ID: optionalClientId,
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: optionalClientId,
});

// Cada variable se lee de forma literal para que Next la incruste en el cliente.
export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
});
