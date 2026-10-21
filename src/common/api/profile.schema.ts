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
});

export type Profile = z.infer<typeof profileSchema>;
