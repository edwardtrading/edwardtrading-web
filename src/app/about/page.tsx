import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getCmsResources, getPageContent, getTeamMembers } from "@/lib/cms-data";
import { values } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("about");

  return {
    title: content.metaTitle || "About Us",
    description: content.metaDescription || content.description
  };
}

export default async function AboutPage() {
  const [content, teamMembers] = await Promise.all([
    getPageContent("about"),
    getTeamMembers()
  ]);
  const [story, pillars, profile, strengths, directorMessages] = await Promise.all([
    getCmsResources("about_story"),
    getCmsResources("about_pillars"),
    getCmsResources("company_profile"),
    getCmsResources("company_strengths"),
    getCmsResources("director_message")
  ]);
  const directorMessage = directorMessages[0];
  const publicProfile = profile.filter(
    (item) => item.key.toLowerCase() !== "company.vat_no"
  );

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        image={content.imageUrl}
        ctaLabel={content.ctaLabel || "Contact Edward Trading"}
        ctaHref={content.ctaHref || "/contact"}
      />
      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <Reveal>
            <h2 className="font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Our story
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-slate">
              {story.map((item) => (
                <p key={item.key}>{item.value}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-lg border border-charcoal/10 bg-light-gray p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Company Highlights
              </p>
              <div className="mt-6 grid gap-4">
                {[...strengths, ...publicProfile].map((value) => (
                  <div key={value.key} className="flex gap-3 text-sm font-semibold text-charcoal">
                    <CheckCircle2
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <span>
                      {value.label}: {value.value}
                    </span>
                  </div>
                ))}
                {values.map((value) => (
                  <div key={value} className="flex gap-3 text-sm font-semibold text-charcoal">
                    <CheckCircle2
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-warm-cream py-20">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {pillars.map((item, index) => (
            <Reveal key={item.key} delay={index * 0.06}>
              <div className="h-full rounded-lg border border-charcoal/10 bg-white p-7">
                <h3 className="font-heading text-2xl font-bold text-charcoal">
                  {item.metadata.title || item.label}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate">{item.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      {directorMessage ? (
        <section className="bg-white py-20">
          <div className="container-page">
            <Reveal>
              <div className="rounded-lg border border-charcoal/10 bg-light-gray p-7 md:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Director&apos;s Message
                </p>
                <p className="mt-5 max-w-4xl text-base leading-8 text-slate">
                  {directorMessage.value}
                </p>
                <p className="mt-6 font-heading text-xl font-extrabold text-charcoal">
                  {directorMessage.metadata.author}
                </p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {directorMessage.metadata.role}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Our Team
            </p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold text-charcoal md:text-5xl">
              Leadership and customer support
            </h2>
            <p className="mt-5 text-base leading-8 text-slate">
              The team supports product inquiries, supplier coordination,
              availability conversations, and long-term client relationships.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <Reveal key={member.id} delay={index * 0.05}>
                <article className="overflow-hidden rounded-lg border border-charcoal/10 bg-light-gray">
                  {member.imageUrl ? (
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <h3 className="font-heading text-2xl font-extrabold text-charcoal">
                      {member.name}
                    </h3>
                    <p className="mt-2 text-sm font-bold text-primary">
                      {member.role}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate">
                      {member.bio}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
