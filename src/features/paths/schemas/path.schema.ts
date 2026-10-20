import { z } from "zod";

export const certificationProviderSchema = z.enum(["FREECODECAMP"]);

export const requiredCertificationSchema = z.object({
  id: z.string(),
  provider: certificationProviderSchema,
  externalId: z.string(),
  name: z.string(),
  url: z.string(),
});

export const topicCertificationSchema = requiredCertificationSchema.extend({
  isActive: z.boolean(),
  modules: z.array(
    z.object({
      externalId: z.string(),
      title: z.string(),
      position: z.number(),
    }),
  ),
});

export const subtopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().nullable(),
  description: z.string().nullable(),
  position: z.number(),
});

export const topicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  position: z.number(),
  isOptional: z.boolean(),
  certifications: z.array(topicCertificationSchema),
  subtopics: z.array(subtopicSchema),
});

export const pathDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  version: z.number(),
  isCurrent: z.boolean(),
  requiredCertifications: z.array(requiredCertificationSchema),
  topics: z.array(topicSchema),
});

export const pathProgressSchema = z.object({
  completedSubtopicIds: z.array(z.string()),
  earnedCertificationIds: z.array(z.string()),
});

export type CertificationProvider = z.infer<typeof certificationProviderSchema>;
export type RequiredCertification = z.infer<typeof requiredCertificationSchema>;
export type TopicCertification = z.infer<typeof topicCertificationSchema>;
export type Subtopic = z.infer<typeof subtopicSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type PathDetail = z.infer<typeof pathDetailSchema>;
export type PathProgress = z.infer<typeof pathProgressSchema>;
