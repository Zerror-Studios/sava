import type { MetadataRoute } from "next";

// Under construction only the coming-soon page is public. At launch, list the store's pages here
// (siteRoutes from src/config/site.ts, categories and products from src/services/catalog.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.savaclub.co",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
