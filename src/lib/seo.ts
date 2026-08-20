import type { Metadata } from "next";
import type { AssociatedCompany } from "@/lib/fallback-data";
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

export function keywordsToText(keywords: string[] | undefined) {
  return (keywords ?? []).join("\n");
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
  return `${site.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
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
  const alreadyBranded = title.toLowerCase().includes(site.name.toLowerCase());

  const rawDescription =
    (metaDescription || "").trim() ||
    descriptionSources
      .map((value) => htmlToPlainText(value ?? ""))
      .find((value) => value.length > 0) ||
    site.description;

  const description = truncateText(rawDescription, descriptionLimit);
  const canonical = absoluteUrl(path);
  const image = images.find((value) => value && value.trim().length > 0);

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
      images: image ? [image] : undefined,
      ...(publishedTime ? { publishedTime } : {})
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} | ${site.name}`,
      description,
      images: image ? [image] : undefined
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
