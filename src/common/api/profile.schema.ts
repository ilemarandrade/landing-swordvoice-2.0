import { z } from "zod";

const optional = z.string().nullable();

export const profileSchema = z.object({
  name: z.string(),
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
