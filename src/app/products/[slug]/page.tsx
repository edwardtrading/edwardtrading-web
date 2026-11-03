import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, HelpCircle, PackageCheck } from "lucide-react";
import { submitProductInquiry } from "@/app/admin/actions";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import {
  getPartnerCompanyBySlug,
  getProductBySlug,
  getProductCategoryBySlug,
  getProductsByCategory
} from "@/lib/cms-data";
import { htmlToPlainText } from "@/lib/rich-text";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  organizationId,
  resolveProductPresentation
} from "@/lib/seo";
import { site } from "@/lib/site-data";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    inquiry?: string;
  };
};

function getYoutubeEmbedUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if ((parts[0] === "embed" || parts[0] === "shorts") && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

export async function generateMetadata({
  params
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false }
    };
  }

  const [company, category] = await Promise.all([
    product.companySlug ? getPartnerCompanyBySlug(product.companySlug) : null,
    getProductCategoryBySlug(product.categorySlug)
  ]);
  const presentation = resolveProductPresentation(product, {
    brand: company?.name,
    category: category?.name
  });

  return buildMetadata({
    metaTitle: product.metaTitle,
    fallbackTitle: presentation.fallbackTitle,
    metaDescription: product.metaDescription,
    descriptionSources: [presentation.fallbackDescription],
    keywords: presentation.keywords,
    path: `/products/${product.slug}`,
    images: [product.imageUrl]
  });
}

export default async function ProductPage({
  params,
  searchParams
}: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const specifications = Object.entries(product.specifications);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(product.youtubeUrl);
  const [company, category, categoryProducts] = await Promise.all([
    product.companySlug ? getPartnerCompanyBySlug(product.companySlug) : null,
    getProductCategoryBySlug(product.categorySlug),
    getProductsByCategory(product.categorySlug)
  ]);
  const presentation = resolveProductPresentation(product, {
    brand: company?.name,
    category: category?.name
  });
  const relatedProducts = categoryProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);
  const productPath = `/products/${product.slug}`;
  const productUrl = absoluteUrl(productPath);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description:
      htmlToPlainText(product.description) || product.shortDescription || product.name,
    image: product.imageUrl ? absoluteUrl(product.imageUrl) : undefined,
    url: productUrl,
    sku: product.slug,
    category: category?.name,
    brand: company
      ? {
          "@type": "Brand",
          name: company.name
        }
      : undefined,
    additionalProperty:
      specifications.length > 0
        ? specifications.map(([name, value]) => ({
            "@type": "PropertyValue",
            name,
            value
          }))
        : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceCurrency: "NPR",
      areaServed: { "@type": "Country", name: "Nepal" },
      seller: { "@id": organizationId }
    }
  };

  const trail = [
    { name: "Home", path: "/" },
    category
      ? { name: category.name, path: `/categories/${category.slug}` }
      : { name: "Solutions", path: "/solutions" },
    { name: product.name, path: productPath }
  ];
  const structuredData = [
    productJsonLd,
    breadcrumbJsonLd(trail),
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
      <nav aria-label="Breadcrumb" className="bg-mesh-warm pt-8">
        <ol className="container-page flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate">
          {trail.map((crumb, index) => (
            <li key={crumb.path} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight aria-hidden className="h-3.5 w-3.5 text-charcoal/30" />
              ) : null}
              {index < trail.length - 1 ? (
                <Link href={crumb.path} className="transition hover:text-primary">
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-charcoal">
                  {crumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <section className="bg-mesh-warm pb-16 pt-8 md:pb-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div className="relative overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="relative aspect-square">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={company ? `${product.name} by ${company.name}` : product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f6f7f5,#fff1cf)]">
                  <span className="flex h-20 w-20 items-center justify-center rounded-md bg-white text-primary shadow-sm">
                    <PackageCheck aria-hidden className="h-10 w-10" />
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {category ? `${category.name} in Nepal` : "Product Details"}
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-charcoal text-balance md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate">
              {product.shortDescription}
            </p>
            {company ? (
              <p className="mt-4 text-sm font-semibold text-charcoal">
                Brand:{" "}
                <Link
                  href={`/partner-companies/${company.slug}`}
                  className="text-primary underline underline-offset-2 transition hover:text-primary-light"
                >
                  {company.name}
                </Link>
                <span className="text-slate"> &middot; supplied across Nepal by {site.name}</span>
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact">Request Product Inquiry</Button>
              <Button href={`/categories/${product.categorySlug}`} variant="secondary">
                Back to Category
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="font-heading text-3xl font-extrabold text-charcoal">
              Product overview
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              {product.description}
            </p>

            {product.features.length > 0 ? (
              <div className="mt-9 grid gap-4">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex gap-3 rounded-lg border border-charcoal/10 bg-light-gray p-5"
                  >
                    <CheckCircle2
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <p className="text-sm font-semibold leading-6 text-charcoal">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="rounded-lg border border-charcoal/10 bg-light-gray p-7">
            <h2 className="font-heading text-2xl font-extrabold text-charcoal">
              Specifications
            </h2>
            <div className="mt-6 grid gap-4">
              {specifications.length > 0 ? (
                specifications.map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-charcoal/10 pb-4 last:border-0 last:pb-0"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-charcoal">
                      {value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate">
                  Specifications are available on inquiry.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {youtubeEmbedUrl ? (
        <section className="bg-light-gray py-20">
          <div className="container-page">
            <div className="mb-8 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Video
              </p>
              <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
                Product video
              </h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-charcoal/10 bg-charcoal shadow-soft">
              <div className="relative aspect-video">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`${product.name} video`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <HelpCircle aria-hidden className="h-4 w-4" />
              Buying in Nepal
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal">
              Buy {product.name} in Nepal
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              {site.name} supplies {product.name}
              {company ? ` from ${company.name}` : ""} to hospitals, clinics,
              hotels, and institutional buyers across Nepal. Send the quantity you
              need and your delivery location, and our Kathmandu team will confirm
              pricing, availability, and delivery timelines.
            </p>
          </div>
          <div className="grid gap-3">
            {presentation.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-charcoal/10 bg-light-gray p-5"
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

      {relatedProducts.length > 0 ? (
        <section className="bg-light-gray py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="font-heading text-3xl font-extrabold text-charcoal">
                Related {category ? category.name.toLowerCase() : "products"}
              </h2>
              {category ? (
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm font-bold text-primary underline underline-offset-2"
                >
                  View all {category.name.toLowerCase()} in Nepal
                </Link>
              ) : null}
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      ) : null}

      <section className="bg-white py-20">
        <div className="container-page">
          <div className="rounded-lg border border-charcoal/10 bg-light-gray p-5 md:p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Inquiry
                </p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold text-charcoal">
                  Inquire for this product
                </h2>
              </div>
              {searchParams?.inquiry === "1" ? (
                <p className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-charcoal">
                  Inquiry Submitted. Our team shall reach out to you soon.
                </p>
              ) : null}
              {searchParams?.inquiry === "unavailable" ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  Online inquiries are temporarily unavailable. Please call or email us.
                </p>
              ) : null}
            </div>
            <form action={submitProductInquiry} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <input type="hidden" name="productSlug" value={product.slug} />
              <input type="hidden" name="productName" value={product.name} />
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Name
                <input
                  name="name"
                  type="text"
                  required
                  className="min-h-12 rounded-md border border-charcoal/12 bg-white px-4 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Organization&apos;s Name
                <input
                  name="organization"
                  type="text"
                  required
                  className="min-h-12 rounded-md border border-charcoal/12 bg-white px-4 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-charcoal">
                Contact Number
                <input
                  name="phone"
                  type="tel"
                  required
                  className="min-h-12 rounded-md border border-charcoal/12 bg-white px-4 text-sm outline-none transition focus:border-primary"
                />
              </label>
              <button
                type="submit"
                className="mt-auto inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-light"
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
