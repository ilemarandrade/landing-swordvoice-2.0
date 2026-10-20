import { z } from "zod";

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  emailVerified: z.boolean(),
  pathRoles: z.array(
    z.object({
      path: z.object({ id: z.string(), slug: z.string(), name: z.string() }),
      role: z.enum(["MENTOR", "APPRENTICE"]),
    }),
  ),
});

export type User = z.infer<typeof userSchema>;
export type PathRole = User["pathRoles"][number];
