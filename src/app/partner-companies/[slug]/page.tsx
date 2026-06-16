import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { PageHero } from "@/components/sections/page-hero";
import {
  getPartnerCompanyBySlug,
  getProductsByCompany
} from "@/lib/cms-data";

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
      title: "Partner Company Not Found"
    };
  }

  return {
    title: company.name,
    description: company.summary || company.description
  };
}

export default async function PartnerCompanyPage({
  params
}: PartnerCompanyPageProps) {
  const [company, products] = await Promise.all([
    getPartnerCompanyBySlug(params.slug),
    getProductsByCompany(params.slug)
  ]);

  if (!company) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow="Partner Company"
        title={company.name}
        description={company.description || company.summary}
        image={company.logoUrl}
        ctaLabel="Contact Edward Trading"
        ctaHref="/contact"
      />
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Products
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Products from {company.name}
            </h2>
          </div>
          <ProductGrid
            products={products}
            emptyText="Products linked to this partner company will appear here after they are published."
          />
        </div>
      </section>
    </>
  );
}
