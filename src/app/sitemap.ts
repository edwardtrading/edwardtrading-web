import type { MetadataRoute } from "next";
import {
  getAssociatedCompanies,
  getBlogPosts,
  getProductCategories,
  getProducts
} from "@/lib/cms-data";
import { site } from "@/lib/site-data";

const routes = [
  "",
  "/about",
  "/solutions",
  "/cleaning-solutions",
  "/partner-companies",
  "/surgical-instruments",
  "/industries",
  "/blog",
  "/contact"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, companies, posts] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getAssociatedCompanies(),
    getBlogPosts()
  ]);
  const staticRoutes = routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.8
  }));

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      url: `${site.url}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...companies.map((company) => ({
      url: `${site.url}/partner-companies/${company.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      // Distributor pages are the main organic entry point, so they rank above
      // the rest of the generated routes.
      priority: 0.9
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...products.map((product) => ({
      url: `${site.url}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6
    }))
  ];
}
