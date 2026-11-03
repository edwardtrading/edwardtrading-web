import type { Metadata } from "next";
import { AboutStrip } from "@/components/sections/about-strip";
import { BrandPartnership } from "@/components/sections/brand-partnership";
import { ContactCta } from "@/components/sections/contact-cta";
import { CoreSolutions } from "@/components/sections/core-solutions";
import { Hero } from "@/components/sections/hero";
import { IndustriesBand } from "@/components/sections/industries-band";
import { Process } from "@/components/sections/process";
import { SupplierHub } from "@/components/sections/supplier-hub";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { getPageContent } from "@/lib/cms-data";
import { buildMetadata, medicalSupplierKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getPageContent("home-hero");

  return buildMetadata({
    metaTitle: hero.metaTitle,
    fallbackTitle: "Medical Equipment Supplier in Nepal | Edward Trading",
    metaDescription: hero.metaDescription,
    descriptionSources: [hero.description],
    keywords: [...hero.metaKeywords, ...medicalSupplierKeywords],
    path: "/",
    images: [hero.imageUrl]
  });
}

export default async function Home() {
  const hero = await getPageContent("home-hero");

  return (
    <>
      <Hero content={hero} />
      <AboutStrip />
      <CoreSolutions />
      <SupplierHub />
      <IndustriesBand />
      <BrandPartnership />
      <WhyChooseUs />
      <Process />
      <ContactCta />
    </>
  );
}
