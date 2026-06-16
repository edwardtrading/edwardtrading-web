import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { getAssociatedCompanies, getPageContent } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("partner-companies");

  return {
    title: content.metaTitle || "Partner Companies",
    description: content.metaDescription || content.description
  };
}

export default async function PartnerCompaniesPage() {
  const companies = await getAssociatedCompanies();

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {companies.map((company, index) => (
          <Reveal key={company.slug} delay={index * 0.05}>
            <Link
              href={`/partner-companies/${company.slug}`}
              className="flex min-h-44 items-center justify-center rounded-lg border border-charcoal/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
            >
              {company.logoUrl ? (
                <div className="relative h-24 w-full">
                  <Image
                    src={company.logoUrl}
                    alt={company.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="text-center">
                  <Building2 aria-hidden className="mx-auto h-8 w-8 text-primary" />
                  <h2 className="mt-4 font-heading text-xl font-extrabold text-charcoal">
                    {company.name}
                  </h2>
                </div>
              )}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
