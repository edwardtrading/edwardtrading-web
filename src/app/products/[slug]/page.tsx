import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { submitProductInquiry } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/cms-data";
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
      title: "Product Not Found"
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description: product.shortDescription,
      images: product.imageUrl ? [product.imageUrl] : []
    }
  };
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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: product.companySlug
      ? {
          "@type": "Brand",
          name: product.companySlug
        }
      : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <section className="bg-mesh-warm py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div className="relative overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="relative aspect-square">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
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
              Product Details
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-charcoal text-balance md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate">
              {product.shortDescription}
            </p>
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
