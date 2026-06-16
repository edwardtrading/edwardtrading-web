import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryCard } from "@/components/products/category-card";
import { Reveal } from "@/components/ui/reveal";
import { getPageContent, getProductCategories } from "@/lib/cms-data";

export async function CoreSolutions() {
  const [content, categories] = await Promise.all([
    getPageContent("home-solutions"),
    getProductCategories()
  ]);

  return (
    <section className="bg-light-gray py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.slug} delay={index * 0.05}>
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
