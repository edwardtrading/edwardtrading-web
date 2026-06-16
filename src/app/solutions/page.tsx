import type { Metadata } from "next";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageHero } from "@/components/sections/page-hero";
import { CategoryCard } from "@/components/products/category-card";
import { Reveal } from "@/components/ui/reveal";
import { getPageContent, getProductCategories } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("solutions");

  return {
    title: content.metaTitle || "Solutions",
    description: content.metaDescription || content.description
  };
}

export default async function SolutionsPage() {
  const [content, categories] = await Promise.all([
    getPageContent("solutions"),
    getProductCategories()
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
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.slug} delay={index * 0.05}>
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </section>
      <ContactCta />
    </>
  );
}
