import { z } from "zod";

export const mentorSchema = z.object({
  id: z.string(),
  name: z.string(),
  yearsOfExperience: z.number().int().min(0),
  professionalTitle: z.string(),
  shortDescription: z.string(),
  bio: z.string(),
  photoUrl: z.string(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
});

export const mentorsSchema = z.array(mentorSchema);

export type Mentor = z.infer<typeof mentorSchema>;
