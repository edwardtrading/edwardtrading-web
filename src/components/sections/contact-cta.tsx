import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getPageContent } from "@/lib/cms-data";

export async function ContactCta() {
  const content = await getPageContent("global-cta");

  return (
    <section className="bg-light-gray py-20">
      <div className="container-page">
        <Reveal>
          <div className="overflow-hidden rounded-lg bg-cta-band px-6 py-12 text-white shadow-soft md:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
                {content.eyebrow}
              </p>
              <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-balance md:text-5xl">
                {content.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-white/70">
                {content.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={content.ctaHref || "/contact"}>
                  {content.ctaLabel || "Contact Edward Trading"}
                </Button>
                <Button href="/solutions" variant="secondary">
                  Browse Categories
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
