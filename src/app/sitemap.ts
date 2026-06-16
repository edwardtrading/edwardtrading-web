import type { MetadataRoute } from "next";
import {
  getAssociatedCompanies,
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
  "/contact"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, companies] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getAssociatedCompanies()
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
      priority: 0.7
    })),
    ...products.map((product) => ({
      url: `${site.url}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6
    }))
  ];
}
