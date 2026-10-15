import { z } from "zod";

// Cada variable se lee de forma literal para que Next la incruste en el cliente.
export const publicEnv = z
  .object({
    NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000/api/v1"),
  })
  .parse({ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL });
