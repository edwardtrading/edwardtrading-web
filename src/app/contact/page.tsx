import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { submitInquiry } from "@/app/admin/actions";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import {
  getPageContent,
  getProductCategories,
  getSiteSettings
} from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("contact");

  return {
    title: content.metaTitle || "Contact Us",
    description: content.metaDescription || content.description
  };
}

type ContactPageProps = {
  searchParams?: {
    submitted?: string;
  };
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [content, settings, categories] = await Promise.all([
    getPageContent("contact"),
    getSiteSettings(),
    getProductCategories()
  ]);
  const submitted = searchParams?.submitted;

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        image={content.imageUrl}
        ctaLabel={content.ctaLabel || "View Solutions"}
        ctaHref={content.ctaHref || "/solutions"}
      />
      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="rounded-lg border border-charcoal/10 bg-light-gray p-7">
              <h2 className="font-heading text-3xl font-extrabold text-charcoal">
                Contact details
              </h2>
              <div className="mt-7 grid gap-5 text-sm font-semibold text-charcoal">
                <a href={`tel:${settings.phone}`} className="flex gap-3 hover:text-primary">
                  <Phone aria-hidden className="mt-0.5 h-5 w-5 text-primary" />
                  {settings.phone}
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex gap-3 hover:text-primary"
                >
                  <Mail aria-hidden className="mt-0.5 h-5 w-5 text-primary" />
                  {settings.email}
                </a>
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 hover:text-primary"
                >
                  <MapPin aria-hidden className="mt-0.5 h-5 w-5 text-primary" />
                  {settings.address}
                </a>
              </div>
              <Button href="/solutions" variant="secondary" className="mt-8">
                Explore Product Categories
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form action={submitInquiry} className="rounded-lg border border-charcoal/10 bg-white p-7 shadow-soft">
              {submitted === "1" ? (
                <div className="mb-5 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-charcoal">
                  Inquiry Submitted. Our team shall reach out to you soon.
                </div>
              ) : null}
              {submitted === "unavailable" ? (
                <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  Online inquiries are temporarily unavailable. Please contact us by phone or email.
                </div>
              ) : null}
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-charcoal">
                  Full name
                  <input
                    type="text"
                    name="name"
                    required
                    className="min-h-12 rounded-md border border-charcoal/12 bg-light-gray px-4 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-charcoal">
                  Organization
                  <input
                    type="text"
                    name="organization"
                    required
                    className="min-h-12 rounded-md border border-charcoal/12 bg-light-gray px-4 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Company or institution"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-charcoal">
                  Email address
                  <input
                    type="email"
                    name="email"
                    required
                    className="min-h-12 rounded-md border border-charcoal/12 bg-light-gray px-4 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="name@example.com"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-charcoal">
                  Phone number
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="min-h-12 rounded-md border border-charcoal/12 bg-light-gray px-4 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="+977..."
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-charcoal md:col-span-2">
                  Product interest
                  <select
                    name="interest"
                    required
                    className="min-h-12 rounded-md border border-charcoal/12 bg-light-gray px-4 text-sm outline-none transition focus:border-primary focus:bg-white"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                    <option value="General inquiry">General inquiry</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-charcoal md:col-span-2">
                  Message
                  <textarea
                    name="message"
                    rows={6}
                    required
                    className="rounded-md border border-charcoal/12 bg-light-gray px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Product details, quantity range, delivery timeline, or any other notes"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-light"
              >
                Submit Inquiry
              </button>
              <p className="mt-3 text-xs leading-5 text-slate">
                
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
