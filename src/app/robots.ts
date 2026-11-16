import type { MetadataRoute } from "next";

// Under construction only the coming-soon page is public (every other route redirects to it)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://www.savaclub.co/sitemap.xml",
    host: "https://www.savaclub.co",
  };
}
