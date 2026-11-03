import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { CategoryCard } from "@/components/products/category-card";
import { ProductGrid } from "@/components/products/product-grid";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/ui/reveal";
import {
  getAssociatedCompanies,
  getBlogPosts,
  getPageContent,
  getProductCategories,
  getProducts
} from "@/lib/cms-data";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  medicalSupplierKeywords,
  organizationId
} from "@/lib/seo";
import { industries, processSteps, site } from "@/lib/site-data";

export const dynamic = "force-dynamic";

const pagePath = "/medical-equipment-supplier-in-nepal";

/** Guides worth linking from a commercial medical page; anything else is off-topic here. */
const medicalTopic = /medical|hospital|surgical|lab|clinic|health|diagnostic/i;

const faqs = [
  {
    question: "Who is a reliable medical equipment supplier in Nepal?",
    answer: `${site.name} is a Kathmandu-based medical equipment supplier established in ${site.foundingDate}. It supplies diagnostic devices, surgical instruments, healthcare products, hygiene solutions, and hospital furniture to hospitals, clinics, and institutions across Nepal.`
  },
  {
    question: "What medical equipment does Edward Trading supply?",
    answer:
      "Diagnostic and home healthcare devices such as blood pressure monitors, pulse oximeters, thermometers, and nebulizers; surgical and dental instruments; hospital furniture; and cleaning and hygiene solutions for clinical areas. Browse the categories on this page for the current range."
  },
  {
    question: "Do you deliver medical equipment outside Kathmandu?",
    answer:
      "Yes. Delivery is coordinated across Nepal. Share your facility location and timeline with your inquiry so the team can confirm delivery expectations."
  },
  {
    question: "How do I get a quotation for medical equipment in Nepal?",
    answer:
      "Send the product names, quantities, and delivery location through the contact page or a product inquiry form. The team responds with availability and pricing."
  },
  {
    question: "Can you supply hospitals and clinics on a repeat basis?",
    answer:
      "Yes. Repeat requirements are handled with consistent communication, so hospitals, clinics, and laboratories can plan ongoing supply with one point of contact."
  }
];

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("medical-equipment-supplier");

  return buildMetadata({
    metaTitle: content.metaTitle,
    fallbackTitle: "Medical Equipment Supplier in Nepal | Edward Trading",
    metaDescription: content.metaDescription,
    descriptionSources: [content.description],
    keywords: [...content.metaKeywords, ...medicalSupplierKeywords],
    path: pagePath,
    images: [content.imageUrl]
  });
}

export default async function MedicalEquipmentSupplierPage() {
  const [content, categories, companies, products, posts] = await Promise.all([
    getPageContent("medical-equipment-supplier"),
    getProductCategories(),
    getAssociatedCompanies(),
    getProducts(),
    getBlogPosts()
  ]);

  const featuredProducts = [
    ...products.filter((product) => product.isFeatured),
    ...products.filter((product) => !product.isFeatured)
  ].slice(0, 8);
  const guides = posts
    .filter((post) => medicalTopic.test(`${post.slug} ${post.title}`))
    .slice(0, 3);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Medical Equipment Supplier in Nepal", path: pagePath }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Medical equipment supply in Nepal",
      serviceType: "Medical equipment supplier",
      url: `${site.url}${pagePath}`,
      provider: { "@id": organizationId },
      areaServed: { "@type": "Country", name: "Nepal" },
      audience: {
        "@type": "Audience",
        audienceType: "Hospitals, clinics, laboratories and healthcare facilities"
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Medical equipment and hospital supplies",
        itemListElement: categories.map((category) => ({
          "@type": "OfferCatalog",
          name: category.name,
          url: `${site.url}/categories/${category.slug}`
        }))
      }
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

      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        image={content.imageUrl}
        ctaLabel={content.ctaLabel || "Request a Quote"}
        ctaHref={content.ctaHref || "/contact"}
      />

      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <Reveal>
            <h2 className="font-heading text-3xl font-extrabold leading-tight text-charcoal md:text-5xl">
              Why healthcare buyers choose {site.shortName}
            </h2>
            <div className="mt-6 grid gap-5 text-base leading-8 text-slate">
              <p>
                Choosing a medical equipment supplier in Nepal comes down to product
                fit, clear communication, and dependable supply. {site.name} has
                worked with healthcare and institutional buyers since{" "}
                {site.foundingDate}, from single clinics to multi-department
                hospitals.
              </p>
              <p>
                Instead of juggling separate vendors for diagnostic devices,
                surgical instruments, hygiene chemicals, and hospital furniture,
                facilities work with one Kathmandu team that understands clinical
                requirements and coordinates delivery across Nepal.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Diagnostic and home healthcare devices",
              "Surgical, dental, and clinical instruments",
              "Hospital furniture and ward equipment",
              "Cleaning and hygiene solutions for clinical areas",
              "Partner brands supplied in Nepal",
              "Delivery coordinated across Nepal"
            ].map((item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <div className="flex h-full gap-3 rounded-lg border border-charcoal/10 bg-light-gray p-5">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-semibold leading-6 text-charcoal">{item}</p>
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
              Product categories
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Medical and hospital supplies we provide in Nepal
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.slug} delay={index * 0.05}>
                <CategoryCard category={category} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="bg-white py-20">
          <div className="container-page">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Products
              </p>
              <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
                Medical equipment available in Nepal
              </h2>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      ) : null}

      {companies.length > 0 ? (
        <section className="bg-light-gray py-20">
          <div className="container-page">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Partner brands
              </p>
              <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
                Brands we supply across Nepal
              </h2>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {companies.map((company) => (
                <li key={company.slug}>
                  <Link
                    href={`/partner-companies/${company.slug}`}
                    className="group flex h-full flex-col justify-between gap-4 rounded-lg border border-charcoal/10 bg-white p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
                  >
                    <span className="font-heading text-xl font-bold text-charcoal">
                      {company.name}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {company.name} in Nepal
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-extrabold text-charcoal">
              Who we supply
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {industries.map(({ title, icon: Icon }) => (
                <li
                  key={title}
                  className="flex items-center gap-3 rounded-md border border-charcoal/10 bg-light-gray px-4 py-3 text-sm font-semibold text-charcoal"
                >
                  <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                  {title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-3xl font-extrabold text-charcoal">
              How supply works
            </h2>
            <ol className="mt-6 grid gap-4">
              {processSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 font-heading text-sm font-extrabold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-charcoal">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-slate">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-light-gray py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <HelpCircle aria-hidden className="h-4 w-4" />
              Frequently Asked Questions
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-4xl">
              Buying medical equipment in Nepal
            </h2>
            {guides.length > 0 ? (
              <div className="mt-8">
                <h3 className="font-heading text-base font-bold text-charcoal">
                  Buying guides
                </h3>
                <ul className="mt-3 grid gap-2">
                  {guides.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold leading-6 text-primary underline underline-offset-2"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
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

      <ContactCta />
    </>
  );
}
