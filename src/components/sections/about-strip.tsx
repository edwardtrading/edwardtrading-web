import { Reveal } from "@/components/ui/reveal";
import { getCmsResources, getPageContent } from "@/lib/cms-data";

export async function AboutStrip() {
  const [content, stats] = await Promise.all([
    getPageContent("home-about"),
    getCmsResources("home_stats")
  ]);

  return (
    <section className="bg-white py-16">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-charcoal md:text-5xl">
            {content.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate">
            {content.description}
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat, index) => (
            <Reveal key={stat.key} delay={index * 0.08}>
              <div className="rounded-lg border border-charcoal/10 bg-light-gray p-6">
                <p className="font-heading text-4xl font-extrabold text-primary">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-charcoal">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
