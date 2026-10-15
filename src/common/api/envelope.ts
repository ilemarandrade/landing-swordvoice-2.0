import { z } from "zod";

export function paginatedSchema<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    items: z.array(item),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });
}
