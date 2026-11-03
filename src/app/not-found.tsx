import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <section className="bg-mesh-warm py-24 md:py-32">
      <div className="container-page max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          404
        </p>
        <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-charcoal md:text-5xl">
          This page could not be found.
        </h1>
        <p className="mt-6 text-base leading-8 text-slate">
          The product or page may have moved. Browse our medical, surgical, and
          hygiene products, or contact the team for help.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/solutions">Browse Products</Button>
          <Button href="/medical-equipment-supplier-in-nepal" variant="secondary">
            Medical Equipment Supplier in Nepal
          </Button>
        </div>
      </div>
    </section>
  );
}
