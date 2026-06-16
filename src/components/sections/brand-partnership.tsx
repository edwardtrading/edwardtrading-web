import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getAssociatedCompanies, getPageContent } from "@/lib/cms-data";

const points = [
  "Partner company listings",
  "Company-backed product category organization",
  "Healthcare, hygiene, and institutional supply support"
];

export async function BrandPartnership() {
  const [companies, content] = await Promise.all([
    getAssociatedCompanies(),
    getPageContent("home-partnership")
  ]);

  return (
    <section className="bg-white py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <Reveal>
          <div className="overflow-hidden rounded-lg bg-charcoal p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              {companies.slice(0, 4).map((company) => (
                <Link
                  key={company.slug}
                  href={`/partner-companies/${company.slug}`}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-5"
                >
                  <p className="font-heading text-2xl font-extrabold text-white">
                    {company.name}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    {company.summary}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
                Partner Network
              </p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-white">
                Partner Companies
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-charcoal md:text-5xl">
            {content.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate">
            {content.description}
          </p>
          <div className="mt-7 grid gap-3">
            {points.map((point) => (
              <div key={point} className="flex gap-3 text-sm font-semibold text-charcoal">
                <CheckCircle2
                  aria-hidden
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                />
                {point}
              </div>
            ))}
          </div>
          <Button href="/partner-companies" className="mt-8">
            {content.ctaLabel || "View Partner Companies"}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
