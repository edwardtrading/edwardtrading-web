import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPageContent } from "@/lib/cms-data";
import { whyChooseUs } from "@/lib/site-data";

export async function WhyChooseUs() {
  const content = await getPageContent("home-why");

  return (
    <section className="bg-warm-cream py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          align="center"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <div className="h-full rounded-lg border border-charcoal/10 bg-white p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-bold text-charcoal">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
