import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPageContent } from "@/lib/cms-data";
import { processSteps } from "@/lib/site-data";

export async function Process() {
  const content = await getPageContent("home-process");

  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="relative h-full rounded-lg border border-charcoal/10 bg-light-gray p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-charcoal font-heading text-lg font-extrabold text-primary-light">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 font-heading text-xl font-bold text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
