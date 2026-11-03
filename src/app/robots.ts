import type { MetadataRoute } from "next";
import { site } from "@/lib/site-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The CMS is already noindex; keeping crawlers out saves crawl budget.
      disallow: ["/admin"]
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}
