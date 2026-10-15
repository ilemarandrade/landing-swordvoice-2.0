export const pathKeys = {
  all: ["paths"] as const,
  list: () => ["paths", "list"] as const,
  detail: (slug: string) => ["paths", "detail", slug] as const,
};
