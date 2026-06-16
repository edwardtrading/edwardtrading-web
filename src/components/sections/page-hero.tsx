import Image from "next/image";
import { Building2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  ctaLabel = "Contact Edward Trading",
  ctaHref = "/contact"
}: PageHeroProps) {
  return (
    <section className="bg-mesh-warm py-16 md:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.84fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-charcoal text-balance md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate md:text-lg">
            {description}
          </p>
          <Button href={ctaHref} className="mt-8">
            {ctaLabel}
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-charcoal shadow-soft">
          {image ? (
            <div className="relative aspect-[4/3]">
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="relative aspect-[4/3] p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,172,0,0.28),transparent_34%),linear-gradient(135deg,#151515,#2d332f)]" />
              <div className="relative flex h-full flex-col justify-between rounded-lg border border-white/10 bg-white/[0.06] p-6 text-white">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                  <PackageCheck aria-hidden className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
                    Edward Trading Pvt. Ltd.
                  </p>
                  <p className="mt-3 font-heading text-3xl font-extrabold">
                    Quality products, responsive service, and clear supply coordination.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-white/72">
                  <Building2 aria-hidden className="h-4 w-4 text-primary-light" />
                  Healthcare, hygiene, and institutional supply
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
