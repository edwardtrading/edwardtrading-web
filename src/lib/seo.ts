import type { Metadata } from "next";
import type {
  AssociatedCompany,
  CompanyFaq,
  Product,
  ProductCategory
} from "@/lib/fallback-data";
import { htmlToPlainText, truncateText } from "@/lib/rich-text";
import { site } from "@/lib/site-data";

/** Google truncates around these lengths; staying under them avoids ellipses in the SERP. */
const titleLimit = 60;
const descriptionLimit = 158;

export function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeKeywords(value.map((item) => String(item)));
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return dedupeKeywords(value.split(/[,\n]/));
}

function dedupeKeywords(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const keyword = value.trim().replace(/\s+/g, " ");
    const fingerprint = keyword.toLowerCase();

    if (keyword && !seen.has(fingerprint)) {
      seen.add(fingerprint);
      output.push(keyword);
    }
  }

  return output;
}

/**
 * Search-intent variants people actually type when looking for a brand's
 * distributor. Generated from the brand name so every partner company added
 * through the CMS gets the same coverage without the editor listing them by hand;
 * CMS keywords are merged on top and win ordering.
 */
export function distributorKeywordVariants(
  name: string,
  territory = "Nepal",
  city = "Kathmandu"
) {
  const brand = name.trim();

  if (!brand) {
    return [];
  }

  return dedupeKeywords([
    `${brand} distributor in ${territory}`,
    `authorized ${brand} distributor in ${territory}`,
    `${brand} distributor for ${territory}`,
    `${brand} authorized distributor ${territory}`,
    `official ${brand} distributor ${territory}`,
    `${brand} distributor ${territory}`,
    `${brand} dealer in ${territory}`,
    `${brand} supplier in ${territory}`,
    `${brand} importer in ${territory}`,
    `${brand} agent in ${territory}`,
    `${brand} products in ${territory}`,
    `${brand} price in ${territory}`,
    `buy ${brand} in ${territory}`,
    `${brand} distributor in ${city}`,
    `${brand} supplier ${city}`,
    `${brand} ${territory}`
  ]);
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${site.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The database stores `updated_at` as "YYYY-MM-DD HH:MM:SS" in UTC without a
 * zone marker, which `new Date()` would read as local time. Returns an ISO
 * string, or undefined when the value is missing or unparseable.
 */
export function toIsoDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

type BuildMetadataInput = {
  /** CMS-supplied meta title. Falls back to `fallbackTitle` when blank. */
  metaTitle?: string;
  fallbackTitle: string;
  /** CMS-supplied meta description. Falls back to the first non-empty `descriptionSources` entry. */
  metaDescription?: string;
  descriptionSources?: (string | undefined)[];
  keywords?: string[];
  path: string;
  images?: (string | undefined)[];
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
};

/**
 * Single place where CMS values are turned into Next metadata, so every page
 * gets a canonical URL, an OpenGraph card, and a Twitter card without repeating
 * the fallback logic.
 */
export function buildMetadata({
  metaTitle,
  fallbackTitle,
  metaDescription,
  descriptionSources = [],
  keywords = [],
  path,
  images = [],
  type = "website",
  publishedTime,
  noIndex
}: BuildMetadataInput): Metadata {
  const title = truncateText(
    (metaTitle || "").trim() || fallbackTitle.trim(),
    titleLimit
  );

  // The root layout appends "| Edward Trading Pvt. Ltd." to every title. When an
  // editor has already worked the company name into the meta title, the suffix
  // would repeat it and push the result past what Google shows, so that title is
  // used verbatim instead.
  const alreadyBranded = title.toLowerCase().includes(site.shortName.toLowerCase());

  const rawDescription =
    (metaDescription || "").trim() ||
    descriptionSources
      .map((value) => htmlToPlainText(value ?? ""))
      .find((value) => value.length > 0) ||
    site.description;

  const description = truncateText(rawDescription, descriptionLimit);
  const canonical = absoluteUrl(path);
  const image = images.find((value) => value && value.trim().length > 0);
  // Pages without their own image still get a branded preview when shared.
  const shareImage = image || site.logo;

  return {
    title: alreadyBranded ? { absolute: title } : title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      title: `${title} | ${site.name}`,
      description,
      url: canonical,
      siteName: site.name,
      locale: "en_US",
      images: [shareImage],
      ...(publishedTime ? { publishedTime } : {})
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} | ${site.name}`,
      description,
      images: [shareImage]
    }
  };
}


/**
 * Turns a CMS partner company record into the copy and search terms its public
 * page uses. Every fallback is keyword-shaped on purpose: a company added
 * through the CMS with only a name still produces a page that answers
 * "<brand> distributor in Nepal".
 */
export function resolveCompanyPresentation(company: AssociatedCompany) {
  const territory = (company.territory || "").trim() || "Nepal";
  // Deliberately neutral: "Authorized Distributor" asserts a specific agreement,
  // so it is only ever shown when an editor sets it on the company record.
  const distributorStatus =
    (company.distributorStatus || "").trim() || "Distributor";
  const heading =
    (company.heading || "").trim() || `${company.name} Distributor in ${territory}`;
  const eyebrow =
    (company.eyebrow || "").trim() || `${distributorStatus} in ${territory}`;

  const fallbackDescription =
    company.summary?.trim() ||
    htmlToPlainText(company.content ?? "") ||
    company.description?.trim() ||
    `${site.name} supplies ${company.name} products across ${territory} with product selection support, availability guidance, and delivery coordination.`;

  const keywords = dedupeKeywords([
    ...(company.metaKeywords ?? []),
    ...distributorKeywordVariants(company.name, territory)
  ]);

  return {
    territory,
    distributorStatus,
    heading,
    eyebrow,
    fallbackTitle: `${company.name} Distributor in ${territory}`,
    fallbackDescription,
    keywords
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path)
    }))
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: htmlToPlainText(faq.answer)
      }
    }))
  };
}

/** True when `brand` already appears in `name`, e.g. "Taski R1" for "Diversey & Taski". */
function nameMentionsBrand(name: string, brand: string) {
  const lowerName = name.toLowerCase();

  return brand
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && word !== "and")
    .some((word) => lowerName.includes(word));
}

/**
 * Buyer-intent search terms for a product, generated from its name, brand, and
 * category so every product added through the CMS targets "<product> in Nepal"
 * style searches without the editor listing them by hand.
 */
export function productKeywordVariants(
  name: string,
  brand?: string,
  category?: string,
  territory = "Nepal",
  city = "Kathmandu"
) {
  const product = name.trim();

  if (!product) {
    return [];
  }

  return dedupeKeywords([
    `${product} in ${territory}`,
    `${product} price in ${territory}`,
    `buy ${product} in ${territory}`,
    `${product} supplier in ${territory}`,
    `${product} distributor in ${territory}`,
    `${product} ${city}`,
    ...(brand
      ? [
          `${brand} ${product} ${territory}`,
          `${brand} products in ${territory}`,
          `${brand} distributor in ${territory}`
        ]
      : []),
    ...(category
      ? [`${category} in ${territory}`, `${category} supplier in ${territory}`]
      : [])
  ]);
}

export function categoryKeywordVariants(
  name: string,
  territory = "Nepal",
  city = "Kathmandu"
) {
  const category = name.trim();

  if (!category) {
    return [];
  }

  return dedupeKeywords([
    `${category} supplier in ${territory}`,
    `${category} suppliers in ${territory}`,
    `${category} in ${territory}`,
    `${category} distributor in ${territory}`,
    `${category} price in ${territory}`,
    `buy ${category} in ${territory}`,
    `${category} supplier in ${city}`,
    `${category} for hospitals in ${territory}`
  ]);
}

/** The commercial terms the medical equipment landing page and home page target. */
export const medicalSupplierKeywords = [
  "medical equipment supplier in Nepal",
  "medical equipment suppliers in Nepal",
  "medical equipment supplier in Kathmandu",
  "medical equipment company in Nepal",
  "medical equipment distributor in Nepal",
  "hospital equipment supplier in Nepal",
  "hospital supplies in Nepal",
  "medical supplies in Nepal",
  "surgical equipment supplier in Nepal",
  "surgical instruments supplier in Nepal",
  "diagnostic equipment supplier in Nepal",
  "healthcare products supplier in Nepal",
  "hospital furniture supplier in Nepal",
  "cleaning and hygiene solutions Nepal",
  "buy medical equipment in Nepal",
  "Edward Trading Pvt. Ltd."
];

/**
 * Turns a CMS product into its search title, keywords, and buyer FAQs. Answers
 * stay generic on purpose (no prices, stock levels, or certifications) so the
 * page never claims anything the editor has not entered.
 */
export function resolveProductPresentation(
  product: Product,
  { brand, category }: { brand?: string; category?: string } = {}
) {
  const territory = "Nepal";
  const byBrand =
    brand && !nameMentionsBrand(product.name, brand) ? ` by ${brand}` : "";
  const fromBrand = brand ? ` from ${brand}` : "";

  const faqs: CompanyFaq[] = [
    {
      question: `Where can I buy ${product.name} in ${territory}?`,
      answer: `${site.name} supplies ${product.name}${fromBrand} in ${territory} from Kathmandu. Send an inquiry from this page or contact the team to confirm availability for your quantity.`
    },
    {
      question: `What is the price of ${product.name} in ${territory}?`,
      answer:
        "Pricing depends on quantity, pack size or configuration, and delivery location. Share your requirement and our team will respond with current pricing and availability."
    },
    {
      question: `Do you deliver ${product.name} outside Kathmandu?`,
      answer: `Yes. Delivery is coordinated across ${territory}. Include your location and timeline with your inquiry so we can confirm delivery expectations.`
    },
    {
      question: `Can hospitals and institutions order ${product.name} in bulk?`,
      answer: `Yes. ${site.name} supplies hospitals, clinics, hotels, and facility teams. Share the quantity range and any documentation you need, and the team will coordinate supply.`
    }
  ];

  return {
    fallbackTitle: `${product.name}${byBrand} in ${territory}`,
    fallbackDescription: `${(product.shortDescription || product.name).replace(/\.?$/, ".")} Buy ${product.name} in ${territory} from ${site.name}, Kathmandu: pricing, availability and delivery across ${territory}.`,
    keywords: dedupeKeywords([
      ...(product.metaKeywords ?? []),
      ...productKeywordVariants(product.name, brand, category, territory)
    ]),
    faqs
  };
}

export function resolveCategoryPresentation(category: ProductCategory) {
  const territory = "Nepal";
  const name = category.name.toLowerCase();
  const summary = (category.summary || category.name).trim().replace(/\.?$/, ".");

  const faqs: CompanyFaq[] = [
    {
      question: `Who supplies ${name} in ${territory}?`,
      answer: `${site.name} is a Kathmandu-based supplier of ${name} for hospitals, clinics, hotels, and institutional buyers across ${territory}.`
    },
    {
      question: `How do I get a quote for ${name}?`,
      answer:
        "Open any product below and send an inquiry, or contact the team with the products, quantities, and delivery location you need. We respond with availability and pricing."
    },
    {
      question: `Do you deliver ${name} outside Kathmandu?`,
      answer: `Yes. Delivery is coordinated across ${territory}. Share your location and timeline so we can confirm delivery expectations.`
    }
  ];

  return {
    fallbackTitle: `${category.name} Supplier in ${territory}`,
    fallbackDescription: `${summary} Buy ${name} in ${territory} from ${site.name}: product guidance, pricing and delivery across ${territory}.`,
    keywords: dedupeKeywords([
      ...(category.metaKeywords ?? []),
      ...categoryKeywordVariants(category.name, territory)
    ]),
    faqs
  };
}

type SiteContact = {
  phone: string;
  email: string;
  address: string;
};

export const organizationId = `${site.url}#organization`;

/**
 * Sitewide Organization + LocalBusiness entity. Product, article, and partner
 * schema point back to it by `@id`, so Google sees one business behind them.
 */
export function organizationJsonLd(
  contact: SiteContact,
  categories: ProductCategory[] = []
) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": organizationId,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    logo: absoluteUrl(site.logo),
    image: absoluteUrl(site.logo),
    description: site.description,
    foundingDate: site.foundingDate,
    email: contact.email,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      addressCountry: "NP"
    },
    areaServed: { "@type": "Country", name: "Nepal" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: contact.phone,
      email: contact.email,
      areaServed: "NP",
      availableLanguage: ["en", "ne"]
    },
    knowsAbout: dedupeKeywords([
      "Medical equipment",
      "Diagnostic equipment",
      "Surgical instruments",
      "Healthcare products",
      "Hospital furniture",
      "Cleaning and hygiene solutions",
      ...categories.map((category) => category.name)
    ]),
    ...(categories.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Medical, surgical and hygiene products in Nepal",
            itemListElement: categories.map((category) => ({
              "@type": "OfferCatalog",
              name: category.name,
              url: absoluteUrl(`/categories/${category.slug}`)
            }))
          }
        }
      : {})
  };
}

/** Bylines like "Edward Trading" are the company, not a person. */
export function articleAuthorJsonLd(author: string) {
  const name = author.trim();

  if (!name || name.toLowerCase().includes(site.shortName.toLowerCase())) {
    return { "@type": "Organization", "@id": organizationId, name: site.name, url: site.url };
  }

  return { "@type": "Person", name };
}

export function articlePublisherJsonLd() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: site.name,
    url: site.url,
    logo: { "@type": "ImageObject", url: absoluteUrl(site.logo) }
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}#website`,
    url: site.url,
    name: site.name,
    alternateName: site.shortName,
    inLanguage: "en",
    publisher: { "@id": organizationId }
  };
}
