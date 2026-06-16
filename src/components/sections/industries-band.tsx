import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { industries } from "@/lib/site-data";

export function IndustriesBand() {
  return (
    <section className="bg-charcoal py-20 text-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Areas We Serve"
          title="Supply support for teams with daily operating standards."
          description="Edward Trading Pvt. Ltd. works with institutional buyers, facility managers, healthcare teams, and hospitality operators who need reliable products and clear coordination."
          invert
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((industry, index) => {
            const Icon = industry.icon;

            return (
              <Reveal key={industry.title} delay={index * 0.04}>
                <div className="min-h-36 rounded-lg border border-white/10 bg-white/[0.06] p-5 transition hover:border-primary-light/50 hover:bg-white/[0.09]">
                  <Icon aria-hidden className="h-7 w-7 text-primary-light" />
                  <p className="mt-7 font-heading text-base font-bold leading-6">
                    {industry.title}
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
