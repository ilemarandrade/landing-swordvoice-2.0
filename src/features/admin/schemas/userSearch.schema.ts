import { z } from "zod";

export const userSearchSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, "La búsqueda no puede superar 100 caracteres"),
});

export type UserSearchFormValues = z.infer<typeof userSearchSchema>;
