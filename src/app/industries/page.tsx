import type { Metadata } from "next";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getPageContent } from "@/lib/cms-data";
import { industries } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("industries");

  return {
    title: content.metaTitle || "Areas We Serve",
    description: content.metaDescription || content.description
  };
}

export default async function IndustriesPage() {
  const content = await getPageContent("industries");

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
        <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((industry, index) => {
            const Icon = industry.icon;

            return (
              <Reveal key={industry.title} delay={index * 0.04}>
                <div className="min-h-40 rounded-lg border border-charcoal/10 bg-light-gray p-6 transition hover:border-primary/30 hover:bg-white">
                  <Icon aria-hidden className="h-7 w-7 text-primary" />
                  <h2 className="mt-7 font-heading text-lg font-bold leading-6 text-charcoal">
                    {industry.title}
                  </h2>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
      <ContactCta />
    </>
  );
}
