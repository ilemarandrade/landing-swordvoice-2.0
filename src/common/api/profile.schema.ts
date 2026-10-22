import { z } from "zod";
import { academyRoleSchema } from "@/common/api/auth.schema";

const optional = z.string().nullable();

export const profileSchema = z.object({
  name: z.string(),
  academyRole: academyRoleSchema,
  photoUrl: optional,
  bio: optional,
  githubUrl: optional,
  portfolioUrl: optional,
  linkedinUrl: optional,
  freeCodeCampUsername: optional,
  professionalTitle: optional,
  shortDescription: optional,
  // Opcional: el backend antiguo aún no lo devuelve.
  experienceStartedAt: z.string().nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
