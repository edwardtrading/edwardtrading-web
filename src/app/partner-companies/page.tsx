import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getAssociatedCompanies, getPageContent } from "@/lib/cms-data";
import {
  breadcrumbJsonLd,
  buildMetadata,
  resolveCompanyPresentation
} from "@/lib/seo";
import { site } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [content, companies] = await Promise.all([
    getPageContent("partner-companies"),
    getAssociatedCompanies()
  ]);

  // The index page should also answer brand-distributor searches, so the top
  // keyword for each partner company is rolled up here.
  const keywords = [
    ...content.metaKeywords,
    ...companies.flatMap((company) =>
      resolveCompanyPresentation(company).keywords.slice(0, 3)
    )
  ];

  return buildMetadata({
    metaTitle: content.metaTitle,
    fallbackTitle: "Partner Companies & Authorized Distributors in Nepal",
    metaDescription: content.metaDescription,
    descriptionSources: [content.description],
    keywords,
    path: "/partner-companies",
    images: [content.imageUrl]
  });
}

export default async function PartnerCompaniesPage() {
  const [content, companies] = await Promise.all([
    getPageContent("partner-companies"),
    getAssociatedCompanies()
  ]);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Partner Companies", path: "/partner-companies" }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Partner companies distributed by Edward Trading Pvt. Ltd.",
      itemListElement: companies.map((company, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: company.name,
        url: `${site.url}/partner-companies/${company.slug}`
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
        eyebrow={content.eyebrow || "Partner Companies"}
        title={content.title}
        description={content.description}
        image={content.imageUrl}
        ctaLabel={content.ctaLabel || "Contact Edward Trading"}
        ctaHref={content.ctaHref || "/contact"}
      />

      <section className="bg-white py-16 md:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Brands We Represent
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Authorized distribution partners in Nepal
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              Each partner company below has a dedicated page covering the product
              range, the territory served, and how to request pricing or supply
              support from {site.name}.
            </p>
          </div>

          {companies.length === 0 ? (
            <div className="rounded-lg bg-light-gray p-8 text-sm leading-7 text-slate">
              Partner companies added from the CMS will appear here.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company, index) => {
                const presentation = resolveCompanyPresentation(company);

                return (
                  <Reveal key={company.slug} delay={index * 0.05}>
                    <Link
                      href={`/partner-companies/${company.slug}`}
                      className="group flex h-full flex-col rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
                    >
                      <div className="flex min-h-24 items-center justify-center rounded-md bg-light-gray p-4">
                        {company.logoUrl ? (
                          <div className="relative h-16 w-full">
                            <Image
                              src={company.logoUrl}
                              alt={`${company.name} logo`}
                              fill
                              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <Building2 aria-hidden className="h-10 w-10 text-primary" />
                        )}
                      </div>

                      <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                        <ShieldCheck aria-hidden className="h-4 w-4" />
                        {presentation.eyebrow}
                      </p>
                      <h3 className="mt-3 font-heading text-2xl font-extrabold text-charcoal">
                        {company.name}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-7 text-slate">
                        {company.summary || presentation.fallbackDescription}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-charcoal transition group-hover:text-primary">
                        View {company.name} products
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
