import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import {
  getAssociatedCompanies,
  getProductCategories,
  getSiteSettings
} from "@/lib/cms-data";
import { navItems, site } from "@/lib/site-data";

export async function Footer() {
  const [settings, categories, companies] = await Promise.all([
    getSiteSettings(),
    getProductCategories(),
    getAssociatedCompanies()
  ]);

  return (
    <footer className="bg-charcoal text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.9fr_0.9fr_1fr]">
        <div>
          <div className="inline-flex rounded-md bg-white px-3 py-2">
            <Logo className="h-12 w-56" />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/64">
            {site.description}
          </p>
        </div>

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-white/90">
            Company
          </h2>
          <div className="mt-5 grid gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/62 transition hover:text-primary-light"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-white/90">
            Solutions
          </h2>
          <div className="mt-5 grid gap-3">
            <Link
              href="/medical-equipment-supplier-in-nepal"
              className="text-sm text-white/62 transition hover:text-primary-light"
            >
              Medical Equipment Supplier in Nepal
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="text-sm text-white/62 transition hover:text-primary-light"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {companies.length > 0 ? (
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-white/90">
              Partner Brands
            </h2>
            <div className="mt-5 grid gap-3">
              {companies.map((company) => (
                <Link
                  key={company.slug}
                  href={`/partner-companies/${company.slug}`}
                  className="text-sm text-white/62 transition hover:text-primary-light"
                >
                  {company.name} in Nepal
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-white/90">
            Contact
          </h2>
          <div className="mt-5 grid gap-4 text-sm text-white/66">
            <a href={`tel:${settings.phone}`} className="flex gap-3 hover:text-white">
              <Phone aria-hidden className="mt-0.5 h-4 w-4 text-primary-light" />
              {settings.phone}
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="flex gap-3 hover:text-white"
            >
              <Mail aria-hidden className="mt-0.5 h-4 w-4 text-primary-light" />
              {settings.email}
            </a>
            <a
              href={settings.mapsUrl}
              className="flex gap-3 hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin
                aria-hidden
                className="mt-0.5 h-4 w-4 text-primary-light"
              />
              {settings.address}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col gap-2 text-xs text-white/48 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} {site.name} All rights reserved.</p>
          <p>
            Designed & Developed by{" "}
            <Link
              href="https://www.infobytesnepal.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary-light transition hover:text-white"
            >
              Infobytes Nepal Pvt. Ltd.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
