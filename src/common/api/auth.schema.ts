import { z } from "zod";

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

export const academyRoleSchema = z.enum([
  "ADMIN",
  "MENTOR",
  "APPRENTICE",
  "NEWCOMER",
]);

export type AcademyRole = z.infer<typeof academyRoleSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  academyRole: academyRoleSchema,
  emailVerified: z.boolean(),
  pathRoles: z.array(
    z.object({
      path: z.object({ id: z.string(), slug: z.string(), name: z.string() }),
      role: academyRoleSchema.extract(["MENTOR", "APPRENTICE"]),
    }),
  ),
});

export type User = z.infer<typeof userSchema>;
export type PathRole = User["pathRoles"][number];
export type PathRoleType = PathRole["role"];
