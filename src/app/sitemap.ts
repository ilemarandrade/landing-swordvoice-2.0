import type { MetadataRoute } from "next";

import { routes } from "@/common/constants/routes";
import { SITE_URL } from "@/common/constants/site";
import { getPaths } from "@/features/paths";

type SitemapPage = {
  path: string;
  priority: number;
  changeFrequency: "monthly" | "yearly";
};

const pages: SitemapPage[] = [
  { path: routes.HOME, priority: 1, changeFrequency: "monthly" },
  { path: routes.PATHS, priority: 0.9, changeFrequency: "monthly" },
  { path: routes.REGISTER, priority: 0.8, changeFrequency: "monthly" },
  { path: routes.LOGIN, priority: 0.5, changeFrequency: "yearly" },
  { path: routes.TERMS, priority: 0.3, changeFrequency: "yearly" },
  { path: routes.PRIVACY, priority: 0.3, changeFrequency: "yearly" },
];

async function pathPages(): Promise<SitemapPage[]> {
  try {
    const { items } = await getPaths();
    return items.map((p) => ({ path: `${routes.PATHS}/${p.slug}`, priority: 0.9, changeFrequency: "monthly" }));
  } catch {
    // Si la API no responde, el sitemap sale sin los paths individuales.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = [...pages, ...(await pathPages())];
  return all.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
