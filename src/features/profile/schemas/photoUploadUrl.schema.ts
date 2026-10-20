import { z } from "zod";

export const photoUploadUrlSchema = z.object({
  uploadUrl: z.url(),
  key: z.string().min(1),
  expiresIn: z.number(),
});
