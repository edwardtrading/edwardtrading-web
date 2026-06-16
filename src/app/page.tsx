import { AboutStrip } from "@/components/sections/about-strip";
import { BrandPartnership } from "@/components/sections/brand-partnership";
import { ContactCta } from "@/components/sections/contact-cta";
import { CoreSolutions } from "@/components/sections/core-solutions";
import { Hero } from "@/components/sections/hero";
import { IndustriesBand } from "@/components/sections/industries-band";
import { Process } from "@/components/sections/process";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { getPageContent } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const hero = await getPageContent("home-hero");

  return (
    <>
      <Hero content={hero} />
      <AboutStrip />
      <CoreSolutions />
      <IndustriesBand />
      <BrandPartnership />
      <WhyChooseUs />
      <Process />
      <ContactCta />
    </>
  );
}
