import type { MetadataRoute } from "next";

import { routes } from "@/common/constants/routes";
import { SITE_URL } from "@/common/constants/site";

type SitemapPage = {
  path: string;
  priority: number;
  changeFrequency: "monthly" | "yearly";
};

const pages: SitemapPage[] = [
  { path: routes.HOME, priority: 1, changeFrequency: "monthly" },
  { path: routes.REGISTER, priority: 0.8, changeFrequency: "monthly" },
  { path: routes.LOGIN, priority: 0.5, changeFrequency: "yearly" },
  { path: routes.TERMS, priority: 0.3, changeFrequency: "yearly" },
  { path: routes.PRIVACY, priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
