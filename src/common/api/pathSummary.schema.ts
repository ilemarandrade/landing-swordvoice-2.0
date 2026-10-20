import { z } from "zod";

export const pathSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  currentVersion: z.number(),
});

export type PathSummary = z.infer<typeof pathSummarySchema>;
