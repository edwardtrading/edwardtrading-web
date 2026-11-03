import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { PageHero } from "@/components/sections/page-hero";
import {
  getAssociatedCompanies,
  getProductCategoryBySlug,
  getProductsByCategory
} from "@/lib/cms-data";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  resolveCategoryPresentation
} from "@/lib/seo";
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

  const presentation = resolveCategoryPresentation(category);

  return buildMetadata({
    metaTitle: category.metaTitle,
    fallbackTitle: presentation.fallbackTitle,
    metaDescription: category.metaDescription,
    descriptionSources: [presentation.fallbackDescription],
    keywords: presentation.keywords,
    path: `/categories/${category.slug}`,
    images: [category.imageUrl]
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [category, products, companies] = await Promise.all([
    getProductCategoryBySlug(params.slug),
    getProductsByCategory(params.slug),
    getAssociatedCompanies()
  ]);

  if (!category) {
    notFound();
  }

  const presentation = resolveCategoryPresentation(category);
  const brands = companies.filter((company) =>
    products.some((product) => product.companySlug === company.slug)
  );

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
    },
    faqJsonLd(presentation.faqs)
  ].filter(Boolean);

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
        eyebrow={`${category.name} Supplier in Nepal`}
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

      <section className="bg-light-gray py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <HelpCircle aria-hidden className="h-4 w-4" />
              Buying in Nepal
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal">
              {category.name} supplier in Nepal
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              {site.name} supplies {category.name.toLowerCase()} to hospitals,
              clinics, hotels, and institutional buyers from Kathmandu, with
              delivery coordinated across Nepal. Tell us the products, quantities,
              and timeline you need and we will confirm pricing and availability.
            </p>
            {brands.length > 0 ? (
              <p className="mt-5 text-sm font-semibold leading-7 text-charcoal">
                Brands in this category:{" "}
                {brands.map((brand, index) => (
                  <span key={brand.slug}>
                    {index > 0 ? ", " : ""}
                    <Link
                      href={`/partner-companies/${brand.slug}`}
                      className="text-primary underline underline-offset-2"
                    >
                      {brand.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
          <div className="grid gap-3">
            {presentation.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-charcoal/10 bg-white p-5"
              >
                <summary className="cursor-pointer list-none font-heading text-base font-bold text-charcoal group-open:text-primary">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
