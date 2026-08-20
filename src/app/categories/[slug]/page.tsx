import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { PageHero } from "@/components/sections/page-hero";
import {
  getProductCategoryBySlug,
  getProductsByCategory
} from "@/lib/cms-data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params
}: CategoryPageProps): Promise<Metadata> {
  const category = await getProductCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false }
    };
  }

  return buildMetadata({
    metaTitle: category.metaTitle,
    fallbackTitle: category.name,
    metaDescription: category.metaDescription,
    descriptionSources: [category.summary, category.description],
    keywords: category.metaKeywords,
    path: `/categories/${category.slug}`,
    images: [category.imageUrl]
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [category, products] = await Promise.all([
    getProductCategoryBySlug(params.slug),
    getProductsByCategory(params.slug)
  ]);

  if (!category) {
    notFound();
  }

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
      { name: category.name, path: `/categories/${category.slug}` }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${category.name} products`,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${site.url}/products/${product.slug}`
      }))
    }
  ];

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.description || category.summary}
        image={category.imageUrl}
        ctaLabel="Contact Edward Trading"
        ctaHref="/contact"
      />
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Products
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              {category.name} products
            </h2>
          </div>
          <ProductGrid
            products={products}
            emptyText="Products linked to this category will appear here after they are published."
          />
        </div>
      </section>
    </>
  );
}
