import {
  getAssociatedCompanies,
  getBlogPosts,
  getProductCategories,
  getProducts
} from "@/lib/cms-data";
import { absoluteUrl, toIsoDate } from "@/lib/seo";

/**
 * Built per request so products, categories, partner companies, and blog posts
 * published in the CMS appear without a redeploy.
 *
 * This is a route handler rather than `app/sitemap.ts` because Next 14's
 * metadata sitemap cannot emit `<image:image>` entries, and image search is a
 * real entry point for product names.
 */
export const dynamic = "force-dynamic";

type SitemapEntry = {
  path: string;
  lastModified?: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
  images?: { url: string; title: string }[];
};

const staticRoutes: SitemapEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/medical-equipment-supplier-in-nepal", changeFrequency: "weekly", priority: 0.95 },
  { path: "/solutions", changeFrequency: "weekly", priority: 0.9 },
  { path: "/partner-companies", changeFrequency: "monthly", priority: 0.8 },
  { path: "/surgical-instruments", changeFrequency: "monthly", priority: 0.8 },
  { path: "/cleaning-solutions", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/industries", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 }
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function image(url: string | null | undefined, title: string) {
  return url ? [{ url: absoluteUrl(url), title }] : [];
}

function renderEntry(entry: SitemapEntry) {
  const images = (entry.images ?? [])
    .map(
      (item) =>
        `<image:image><image:loc>${escapeXml(item.url)}</image:loc><image:title>${escapeXml(item.title)}</image:title></image:image>`
    )
    .join("");

  return [
    "<url>",
    `<loc>${escapeXml(absoluteUrl(entry.path))}</loc>`,
    // Only real edit dates are emitted; a lastmod that is always "now" teaches
    // Google to ignore the field.
    entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : "",
    `<changefreq>${entry.changeFrequency}</changefreq>`,
    `<priority>${entry.priority.toFixed(1)}</priority>`,
    images,
    "</url>"
  ].join("");
}

export async function GET() {
  const [products, categories, companies, posts] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getAssociatedCompanies(),
    getBlogPosts()
  ]);

  const entries: SitemapEntry[] = [
    ...staticRoutes,
    ...categories.map((category) => ({
      path: `/categories/${category.slug}`,
      lastModified: toIsoDate(category.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: image(category.imageUrl, `${category.name} in Nepal`)
    })),
    ...companies.map((company) => ({
      path: `/partner-companies/${company.slug}`,
      lastModified: toIsoDate(company.updatedAt),
      changeFrequency: "monthly" as const,
      // Distributor pages are a main organic entry point.
      priority: 0.9,
      images: image(company.logoUrl, `${company.name} distributor in Nepal`)
    })),
    ...products.map((product) => ({
      path: `/products/${product.slug}`,
      lastModified: toIsoDate(product.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: image(product.imageUrl, `${product.name} in Nepal`)
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: toIsoDate(post.updatedAt) ?? toIsoDate(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: image(post.coverImageUrl, post.coverImageAlt || post.title)
    }))
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map(renderEntry),
    "</urlset>"
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Short CDN cache: new CMS content shows up within minutes.
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600"
    }
  });
}
