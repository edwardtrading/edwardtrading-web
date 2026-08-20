import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, HelpCircle, ShieldCheck } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import {
  getPartnerCompanyBySlug,
  getProductsByCompany,
  getSiteSettings
} from "@/lib/cms-data";
import { withHeadingIds } from "@/lib/rich-text";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  resolveCompanyPresentation
} from "@/lib/seo";
import { site } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type PartnerCompanyPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params
}: PartnerCompanyPageProps): Promise<Metadata> {
  const company = await getPartnerCompanyBySlug(params.slug);

  if (!company) {
    return {
      title: "Partner Company Not Found",
      robots: { index: false, follow: false }
    };
  }

  const presentation = resolveCompanyPresentation(company);

  return buildMetadata({
    metaTitle: company.metaTitle,
    fallbackTitle: presentation.fallbackTitle,
    metaDescription: company.metaDescription,
    descriptionSources: [presentation.fallbackDescription],
    keywords: presentation.keywords,
    path: `/partner-companies/${company.slug}`,
    images: [company.logoUrl]
  });
}

export default async function PartnerCompanyPage({
  params
}: PartnerCompanyPageProps) {
  const [company, products, settings] = await Promise.all([
    getPartnerCompanyBySlug(params.slug),
    getProductsByCompany(params.slug),
    getSiteSettings()
  ]);

  if (!company) {
    notFound();
  }

  const presentation = resolveCompanyPresentation(company);
  const highlights = company.highlights ?? [];
  const faqs = company.faqs ?? [];
  const content = company.content ? withHeadingIds(company.content) : "";
  const pageUrl = `${site.url}/partner-companies/${company.slug}`;

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Partner Companies", path: "/partner-companies" },
      { name: company.name, path: `/partner-companies/${company.slug}` }
    ]),
    // Declares Edward Trading as the distributing organisation for this brand in
    // this territory, which is the relationship the distributor searches ask about.
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${pageUrl}#distributor`,
      name: site.name,
      url: site.url,
      mainEntityOfPage: pageUrl,
      telephone: settings.phone,
      email: settings.email,
      areaServed: presentation.territory,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: "Kathmandu",
        addressCountry: "NP"
      },
      brand: {
        "@type": "Brand",
        name: company.name,
        logo: company.logoUrl || undefined,
        sameAs: company.websiteUrl || undefined
      },
      description: presentation.fallbackDescription,
      makesOffer: products.slice(0, 12).map((product) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: product.name,
          url: `${site.url}/products/${product.slug}`
        }
      }))
    },
    faqJsonLd(faqs)
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

      <section className="bg-mesh-warm py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck aria-hidden className="h-4 w-4" />
              {presentation.eyebrow}
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-charcoal text-balance md:text-6xl">
              {presentation.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate md:text-lg">
              {company.description || presentation.fallbackDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact">Request {company.name} Pricing</Button>
              {company.websiteUrl ? (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-charcoal/12 bg-white px-5 text-sm font-semibold text-charcoal transition hover:border-primary hover:text-primary"
                >
                  Visit {company.name} website
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center rounded-lg border border-charcoal/10 bg-white p-10 shadow-soft">
            {company.logoUrl ? (
              <div className="relative h-40 w-full">
                <Image
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            ) : (
              <p className="font-heading text-4xl font-extrabold text-charcoal">
                {company.name}
              </p>
            )}
          </div>
        </div>
      </section>

      {highlights.length > 0 ? (
        <section className="border-y border-charcoal/10 bg-white py-12">
          <div className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex gap-3 rounded-lg border border-charcoal/10 bg-light-gray p-5"
              >
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                />
                <p className="text-sm font-semibold leading-6 text-charcoal">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content ? (
        <section className="bg-white py-16 md:py-20">
          <div className="container-page">
            <div
              className="prose prose-lg max-w-3xl prose-headings:font-heading prose-headings:text-charcoal prose-p:text-slate prose-p:leading-8 prose-a:text-primary prose-a:underline prose-strong:text-charcoal prose-li:text-slate prose-table:text-sm prose-th:bg-light-gray prose-th:text-charcoal prose-th:border prose-th:border-charcoal/10 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-charcoal/10 prose-td:px-3 prose-td:py-2"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </section>
      ) : null}

      <section className="bg-light-gray py-16 md:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Products
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              {company.name} products available in {presentation.territory}
            </h2>
          </div>
          <ProductGrid
            products={products}
            emptyText={`${company.name} product listings are being updated. Contact our team for the current range.`}
          />
        </div>
      </section>

      {faqs.length > 0 ? (
        <section className="bg-white py-16 md:py-20">
          <div className="container-page max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <HelpCircle aria-hidden className="h-4 w-4" />
              Frequently Asked Questions
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-4xl">
              {company.name} supply in {presentation.territory}
            </h2>
            <div className="mt-8 grid gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-charcoal/10 bg-light-gray p-5"
                >
                  <summary className="cursor-pointer list-none font-heading text-lg font-bold text-charcoal group-open:text-primary">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
