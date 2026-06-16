import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageHero } from "@/components/sections/page-hero";
import { ProductGrid } from "@/components/products/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { getCmsResources, getPageContent, getProductsByCategory } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("cleaning-solutions");

  return {
    title: content.metaTitle || "Cleaning Solutions",
    description: content.metaDescription || content.description
  };
}

export default async function CleaningSolutionsPage() {
  const [content, products, categories] = await Promise.all([
    getPageContent("cleaning-solutions"),
    getProductsByCategory("cleaning-solutions"),
    getCmsResources("cleaning_categories")
  ]);

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        image={content.imageUrl}
        ctaLabel={content.ctaLabel || "Contact Edward Trading"}
        ctaHref={content.ctaHref || "/contact"}
      />
      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <Reveal>
            <h2 className="font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Cleaning categories we support
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              Cleaning outcomes depend on matching the right product to the
              surface, facility type, usage frequency, and safety expectations.
              Edward Trading Pvt. Ltd. helps buyers identify suitable
              categories for daily cleaning and planned maintenance.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category, index) => (
              <Reveal key={category.key} delay={index * 0.05}>
                <div className="flex min-h-24 gap-3 rounded-lg border border-charcoal/10 bg-light-gray p-5">
                  <CheckCircle2
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  />
                  <p className="text-sm font-semibold leading-6 text-charcoal">
                    {category.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-light-gray py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Products
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Cleaning solution products
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              Product cards display only the product image and name. Open any
              product to view its full details.
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
