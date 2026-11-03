import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getAssociatedCompanies, getProductCategories } from "@/lib/cms-data";
import { site } from "@/lib/site-data";

/**
 * Home page block that answers "medical equipment supplier in Nepal" in plain
 * copy and links every category and partner brand with descriptive anchors, so
 * the strongest page on the site passes its authority to the pages that sell.
 */
export async function SupplierHub() {
  const [categories, companies] = await Promise.all([
    getProductCategories(),
    getAssociatedCompanies()
  ]);

  return (
    <section className="bg-white py-20">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Medical Equipment Supplier in Nepal
          </p>
          <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-charcoal md:text-5xl">
            One Kathmandu supplier for medical, surgical, and hygiene needs.
          </h2>
          <p className="mt-6 text-base leading-8 text-slate">
            {site.name} supplies medical equipment, diagnostic devices, surgical
            instruments, healthcare products, cleaning and hygiene solutions, and
            hospital furniture to hospitals, clinics, laboratories, hotels, and
            institutions across Nepal. Share what your facility needs and our team
            will match it to the right products, confirm availability, and
            coordinate delivery.
          </p>
          <Button href="/medical-equipment-supplier-in-nepal" className="mt-8">
            Medical equipment supply in Nepal
          </Button>
        </Reveal>

        <div className="grid gap-8">
          <Reveal delay={0.05}>
            <h3 className="font-heading text-lg font-bold text-charcoal">
              Product categories
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group flex items-center gap-2 rounded-md border border-charcoal/10 bg-light-gray px-4 py-3 text-sm font-semibold text-charcoal transition hover:border-primary/40 hover:text-primary"
                  >
                    <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                    {category.name} in Nepal
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {companies.length > 0 ? (
            <Reveal delay={0.1}>
              <h3 className="font-heading text-lg font-bold text-charcoal">
                Partner brands
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {companies.map((company) => (
                  <li key={company.slug}>
                    <Link
                      href={`/partner-companies/${company.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-md border border-charcoal/10 px-4 py-3 text-sm font-semibold text-charcoal transition hover:border-primary/40 hover:text-primary"
                    >
                      {company.name} in Nepal
                      <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-charcoal/30 transition group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
