import { z } from "zod";

const LOCAL_API_URL = "http://localhost:4000/api/v1";

// En producción la URL es obligatoria; en desarrollo y tests cae a la API local.
const apiUrlSchema =
  process.env.NODE_ENV === "production" ? z.url() : z.url().default(LOCAL_API_URL);

// Cada variable se lee de forma literal para que Next la incruste en el cliente.
export const publicEnv = z
  .object({ NEXT_PUBLIC_API_URL: apiUrlSchema })
  .parse({ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL });
