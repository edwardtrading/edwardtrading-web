import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageHero } from "@/components/sections/page-hero";
import { ProductGrid } from "@/components/products/product-grid";
import { Reveal } from "@/components/ui/reveal";
import { getCmsResources, getPageContent, getProductsByCategory } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("surgical-instruments");

  return {
    title: content.metaTitle || "Surgical Instruments",
    description: content.metaDescription || content.description
  };
}

export default async function SurgicalInstrumentsPage() {
  const [content, products, items] = await Promise.all([
    getPageContent("surgical-instruments"),
    getProductsByCategory("surgical-instruments"),
    getCmsResources("healthcare_items")
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
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <Reveal>
            <h2 className="font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Healthcare supply needs clarity and consistency.
            </h2>
            <p className="mt-6 text-base leading-8 text-slate">
              Medical teams need supply partners who communicate clearly around
              product categories, quality expectations, availability, and repeat
              requirements. Edward Trading Pvt. Ltd. helps coordinate these
              conversations with practical care.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => (
              <Reveal key={item.key} delay={index * 0.06}>
                <div className="h-full rounded-lg border border-charcoal/10 bg-light-gray p-6">
                  <CheckCircle2
                    aria-hidden
                    className="h-5 w-5 text-primary"
                  />
                  <p className="mt-5 text-sm font-semibold leading-6 text-charcoal">
                    {item.value}
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
              Surgical instrument products
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              Open a product to view its details, features, and
              specifications.
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
