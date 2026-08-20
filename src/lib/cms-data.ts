import {
  fallbackBlogPosts,
  fallbackCategories,
  fallbackCompanies,
  fallbackProducts,
  fallbackTeamMembers,
  type AssociatedCompany,
  type BlogPost,
  type CompanyFaq,
  type Product,
  type ProductCategory,
  type TeamMember
} from "@/lib/fallback-data";
import { sanitizeRichText } from "@/lib/rich-text";
import { parseKeywords } from "@/lib/seo";
import { heroImage, site } from "@/lib/site-data";
import {
  getDatabaseClient,
  hasDatabaseConfig,
  parseJsonArray,
  parseJsonObject
} from "@/lib/database";

type DbRow = Record<string, unknown>;

export type CmsPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  ctaLabel: string;
  ctaHref: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  isActive: boolean;
  updatedAt?: string;
};

export type CmsResource = {
  id: string;
  key: string;
  label: string;
  groupName: string;
  type: string;
  value: string;
  metadata: Record<string, string>;
  isActive: boolean;
  sortOrder: number;
  updatedAt?: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  interest: string;
  productSlug: string;
  productName: string;
  message: string;
  status: string;
  createdAt: string;
};

export type ManagedProduct = Product & {
  isActive: boolean;
  sortOrder: number;
};

export type ManagedCategory = ProductCategory & {
  isActive: boolean;
  sortOrder: number;
};

export type ManagedCompany = AssociatedCompany & {
  isActive: boolean;
  sortOrder: number;
};

export type ManagedTeamMember = TeamMember & {
  isActive: boolean;
};

export type ManagedBlogPost = BlogPost & {
  isActive: boolean;
  sortOrder: number;
};

export const defaultPages: CmsPage[] = [
  {
    slug: "home-hero",
    eyebrow: "For a Healthier Nepal",
    title: "Healthcare Products, Medical Care, & Hygiene Solutions for the Nation.",
    description:
      "Edward Trading Pvt. Ltd. supplies diagnostic equipment, healthcare products, surgical items, cleaning and hygiene accessories and chemicals, medical equipment, and hospital furniture with a commitment to quality service.",
    imageUrl: heroImage,
    videoUrl: "",
    ctaLabel: "Explore Solutions",
    ctaHref: "/solutions",
    metaTitle: site.name,
    metaDescription: site.description,
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "home-about",
    eyebrow: "About Edward Trading",
    title: "A quality-focused service provider for healthcare and institutional buyers.",
    description:
      "The company was established in 2020 with a prime focus on healthcare, surgical items, medical equipment, cleaning and hygiene solutions, and hospital furniture.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "home-solutions",
    eyebrow: "Core Solutions",
    title: "Product categories built around healthcare, hygiene, and facility needs.",
    description:
      "Explore diagnostic equipment, healthcare products, surgical instruments, medical equipment, cleaning and hygiene solutions, and hospital furniture.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "home-partnership",
    eyebrow: "Partner Companies",
    title: "Supplier relationships that support quality product access.",
    description:
      "Edward Trading Pvt. Ltd. works with partner companies and multinational suppliers to support dependable healthcare, cleaning, and institutional supply.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "View Partner Companies",
    ctaHref: "/partner-companies",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "home-why",
    eyebrow: "Why Choose Us",
    title: "Client-centric service with clear, transparent communication.",
    description:
      "The company focuses on quality products, responsive service, mutual growth, and long-term value for clients and stakeholders.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "home-process",
    eyebrow: "Process",
    title: "A practical workflow from inquiry to ongoing supply.",
    description:
      "Supply conversations become easier when requirements, product fit, availability, documentation, and continuity are handled in one clear flow.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "global-cta",
    eyebrow: "Product Support",
    title: "Need healthcare, medical, cleaning, or hospital supplies?",
    description:
      "Share your product requirements, quantity range, preferred specifications, and timeline. The team will help identify the right next step.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "about",
    eyebrow: "About Edward Trading",
    title: "Established to serve Nepal's healthcare and institutional supply needs.",
    description:
      "Edward Trading Pvt. Ltd. has rapidly achieved significant milestones as a quality service provider of diagnostic equipment and healthcare products in Nepal.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "About Us",
    metaDescription:
      "Learn about Edward Trading Pvt. Ltd., a Nepal-based healthcare and trading company established in 2020.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "solutions",
    eyebrow: "Solutions",
    title: "Healthcare, medical, hygiene, and hospital product categories.",
    description:
      "From diagnostic equipment and surgical items to cleaning and hygiene chemicals, medical equipment, and hospital furniture, Edward Trading Pvt. Ltd. helps buyers coordinate practical product requirements.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "Solutions",
    metaDescription:
      "Explore diagnostic equipment, healthcare products, surgical instruments, medical equipment, cleaning and hygiene solutions, and hospital furniture in Nepal.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "partner-companies",
    eyebrow: "Partner Companies",
    title: "Partner companies and supplier relationships.",
    description:
      "Edward Trading Pvt. Ltd. distributes and supplies products from the brands below to hospitals, hotels, and facility teams across Nepal. Each brand has its own page with the range we carry and how to request pricing.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "Partner Companies",
    metaDescription:
      "View partner companies and supplier relationships for Edward Trading Pvt. Ltd.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "cleaning-solutions",
    eyebrow: "Cleaning & Hygiene",
    title: "Cleaning accessories and hygiene chemicals for professional facilities.",
    description:
      "Edward Trading Pvt. Ltd. supports institutional cleaning and hygiene needs with practical product categories for hospitals, commercial buildings, and other high-use environments.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "Cleaning & Hygiene",
    metaDescription:
      "Cleaning accessories, hygiene chemicals, facility care products, and institutional cleaning support in Nepal.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "surgical-instruments",
    eyebrow: "Healthcare & Surgical Items",
    title: "Surgical items, clinical products, and medical supply support.",
    description:
      "Edward Trading Pvt. Ltd. helps healthcare buyers coordinate surgical items, medical equipment, diagnostic products, and related supply requirements.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "Surgical Instruments",
    metaDescription:
      "Surgical items, healthcare products, diagnostic equipment, and medical supply support for healthcare teams in Nepal.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "industries",
    eyebrow: "Areas We Serve",
    title: "Serving healthcare, hospitality, commercial, and institutional buyers.",
    description:
      "The company supports active clients across Nepal with healthcare products, cleaning and hygiene solutions, medical equipment, and institutional supply coordination.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "Areas We Serve",
    metaDescription:
      "Edward Trading Pvt. Ltd. serves hospitals, clinics, hotels, commercial buildings, institutions, facility teams, and buyers across Nepal.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "blog",
    eyebrow: "Insights & Updates",
    title: "Healthcare, hygiene, and facility supply insights from Nepal.",
    description:
      "Guides, product explainers, and industry updates from the Edward Trading Pvt. Ltd. team for hospitals, hotels, and facility operators across Nepal.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Contact Edward Trading",
    ctaHref: "/contact",
    metaTitle: "Blog",
    metaDescription:
      "Healthcare, cleaning, hygiene, and institutional supply insights for hospitals, hotels, and facility teams in Nepal.",
    metaKeywords: [],
    isActive: true
  },
  {
    slug: "contact",
    eyebrow: "Contact Edward Trading",
    title: "Tell us what your organization needs to source.",
    description:
      "Share your product requirements, preferred category, quantity range, and timeline. The team will help identify the right next step.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "View Solutions",
    ctaHref: "/solutions",
    metaTitle: "Contact Us",
    metaDescription:
      "Contact Edward Trading Pvt. Ltd. for diagnostic equipment, healthcare products, surgical items, medical equipment, cleaning and hygiene solutions, and hospital furniture.",
    metaKeywords: [],
    isActive: true
  }
];

export const defaultResources: CmsResource[] = [
  {
    id: "setting-phone",
    key: "site.phone",
    label: "Phone",
    groupName: "site_settings",
    type: "phone",
    value: site.phone,
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "setting-email",
    key: "site.email",
    label: "Email",
    groupName: "site_settings",
    type: "email",
    value: site.email,
    metadata: {},
    isActive: true,
    sortOrder: 2
  },
  {
    id: "setting-address",
    key: "site.address",
    label: "Address",
    groupName: "site_settings",
    type: "text",
    value: site.address,
    metadata: { mapsUrl: site.mapsUrl },
    isActive: true,
    sortOrder: 3
  },
  {
    id: "home-stat-categories",
    key: "home.stat.categories",
    label: "Core supply categories",
    groupName: "home_stats",
    type: "stat",
    value: "5",
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "home-stat-areas",
    key: "home.stat.areas",
    label: "Areas served",
    groupName: "home_stats",
    type: "stat",
    value: "10",
    metadata: {},
    isActive: true,
    sortOrder: 2
  },
  {
    id: "home-stat-market",
    key: "home.stat.market",
    label: "Market focus",
    groupName: "home_stats",
    type: "stat",
    value: "NP",
    metadata: {},
    isActive: true,
    sortOrder: 3
  },
  {
    id: "home-stat-installations",
    key: "home.stat.installations",
    label: "Installations",
    groupName: "company_strengths",
    type: "stat",
    value: "100+",
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "home-stat-clients",
    key: "home.stat.clients",
    label: "Active clients across the country",
    groupName: "company_strengths",
    type: "stat",
    value: "56+",
    metadata: {},
    isActive: true,
    sortOrder: 2
  },
  {
    id: "company-regd-no",
    key: "company.regd_no",
    label: "Company Regd. No.",
    groupName: "company_profile",
    type: "text",
    value: "238849/077/78",
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "about-story-1",
    key: "about.story.1",
    label: "Story paragraph 1",
    groupName: "about_story",
    type: "paragraph",
    value:
      "Edward Trading Pvt. Ltd. was established in 2020 with a prime focus on healthcare and surgical items, medical equipment, cleaning and hygiene accessories and chemicals, hospital furniture, and related product categories.",
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "about-story-2",
    key: "about.story.2",
    label: "Story paragraph 2",
    groupName: "about_story",
    type: "paragraph",
    value:
      "The company believes in providing quality products to consumers while building the capability to achieve market leadership in the field of medical service providers.",
    metadata: {},
    isActive: true,
    sortOrder: 2
  },
  {
    id: "director-message",
    key: "director.message",
    label: "Director message",
    groupName: "director_message",
    type: "paragraph",
    value:
      "After 20 years in medical supplies, including leadership in IVD sales, Managing Director Rajesh Neupane founded Edward Trading Pvt. Ltd. to deliver client-centric service, transparent communication, and long-term value for clients and stakeholders.",
    metadata: { author: "Mr. Rajesh Neupane", role: "Managing Director" },
    isActive: true,
    sortOrder: 1
  },
  {
    id: "about-pillar-quality",
    key: "about.pillar.quality",
    label: "Quality products",
    groupName: "about_pillars",
    type: "card",
    value:
      "The company is built around providing the best possible quality products to consumers and institutional buyers.",
    metadata: { title: "Quality" },
    isActive: true,
    sortOrder: 1
  },
  {
    id: "about-pillar-service",
    key: "about.pillar.service",
    label: "Client-centric service",
    groupName: "about_pillars",
    type: "card",
    value:
      "Service is anchored in client requirements, practical product support, and dependable communication.",
    metadata: { title: "Service" },
    isActive: true,
    sortOrder: 2
  },
  {
    id: "about-pillar-growth",
    key: "about.pillar.growth",
    label: "Mutual growth",
    groupName: "about_pillars",
    type: "card",
    value:
      "Transparent communication supports mutual growth with clients, stakeholders, and supplier partners.",
    metadata: { title: "Growth" },
    isActive: true,
    sortOrder: 3
  },
  {
    id: "cleaning-category-1",
    key: "cleaning.category.1",
    label: "Cleaning accessories",
    groupName: "cleaning_categories",
    type: "list_item",
    value: "Cleaning accessories for institutional and healthcare facilities",
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "cleaning-category-2",
    key: "cleaning.category.2",
    label: "Hygiene chemicals",
    groupName: "cleaning_categories",
    type: "list_item",
    value: "Cleaning and hygiene chemicals for routine facility care",
    metadata: {},
    isActive: true,
    sortOrder: 2
  },
  {
    id: "cleaning-category-3",
    key: "cleaning.category.3",
    label: "Facility support",
    groupName: "cleaning_categories",
    type: "list_item",
    value: "Product support for hospitals, hotels, commercial buildings, and institutions",
    metadata: {},
    isActive: true,
    sortOrder: 3
  },
  {
    id: "healthcare-item-1",
    key: "healthcare.item.1",
    label: "Surgical items",
    groupName: "healthcare_items",
    type: "list_item",
    value: "Surgical items and clinical supply support",
    metadata: {},
    isActive: true,
    sortOrder: 1
  },
  {
    id: "healthcare-item-2",
    key: "healthcare.item.2",
    label: "Diagnostic equipment",
    groupName: "healthcare_items",
    type: "list_item",
    value: "Diagnostic equipment and healthcare products",
    metadata: {},
    isActive: true,
    sortOrder: 2
  },
  {
    id: "healthcare-item-3",
    key: "healthcare.item.3",
    label: "Medical equipment",
    groupName: "healthcare_items",
    type: "list_item",
    value: "Medical equipment and hospital furniture requirements",
    metadata: {},
    isActive: true,
    sortOrder: 3
  }
];

function productFromRow(row: DbRow): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: removeRetiredPublicCopy(String(row.name)),
    categorySlug: String(row.category_slug),
    shortDescription: removeRetiredPublicCopy(String(row.short_description ?? "")),
    description: removeRetiredPublicCopy(String(row.description ?? "")),
    imageUrl: String(row.image_url ?? ""),
    youtubeUrl: String(row.youtube_url ?? ""),
    companySlug: row.company_slug ? String(row.company_slug) : null,
    features: parseJsonArray(row.features).map(removeRetiredPublicCopy),
    specifications: Object.fromEntries(
      Object.entries(parseJsonObject(row.specifications)).map(([key, value]) => [
        removeRetiredPublicCopy(key),
        removeRetiredPublicCopy(value)
      ])
    ),
    metaTitle: removeRetiredPublicCopy(String(row.meta_title ?? "")),
    metaDescription: removeRetiredPublicCopy(String(row.meta_description ?? "")),
    metaKeywords: parseKeywords(row.meta_keywords),
    isFeatured: Boolean(row.is_featured)
  };
}

function categoryFromRow(row: DbRow): ProductCategory {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: removeRetiredPublicCopy(String(row.name)),
    summary: removeRetiredPublicCopy(String(row.summary ?? "")),
    description: removeRetiredPublicCopy(String(row.description ?? "")),
    imageUrl: String(row.image_url ?? ""),
    metaTitle: removeRetiredPublicCopy(String(row.meta_title ?? "")),
    metaDescription: removeRetiredPublicCopy(String(row.meta_description ?? "")),
    metaKeywords: parseKeywords(row.meta_keywords),
    isFeatured: Boolean(row.is_featured)
  };
}

function managedCategoryFromRow(row: DbRow): ManagedCategory {
  return {
    ...categoryFromRow(row),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

function managedProductFromRow(row: DbRow): ManagedProduct {
  return {
    ...productFromRow(row),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

/**
 * Columns and tables added after the first deployment. Run once per server
 * instance so a database that predates `npm run db:migrate` still serves reads
 * instead of falling back to the built-in content.
 */
let schemaUpgrade: Promise<void> | null = null;

const schemaUpgradeStatements = [
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_image_url TEXT NOT NULL DEFAULT '',
    cover_image_alt TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    meta_title TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    meta_keywords TEXT NOT NULL DEFAULT '',
    published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    byte_size INTEGER NOT NULL DEFAULT 0,
    data BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  "ALTER TABLE products ADD COLUMN meta_title TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE products ADD COLUMN meta_description TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE products ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE product_categories ADD COLUMN meta_title TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE product_categories ADD COLUMN meta_description TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE product_categories ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN meta_title TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN meta_description TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN heading TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN eyebrow TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN content TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN faqs TEXT NOT NULL DEFAULT '[]'",
  "ALTER TABLE associated_companies ADD COLUMN highlights TEXT NOT NULL DEFAULT '[]'",
  "ALTER TABLE associated_companies ADD COLUMN distributor_status TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE associated_companies ADD COLUMN territory TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE cms_pages ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT ''"
];

export async function ensureSchemaUpgrades() {
  if (!hasDatabaseConfig()) {
    return;
  }

  if (!schemaUpgrade) {
    schemaUpgrade = (async () => {
      const db = getDatabaseClient();

      for (const sql of schemaUpgradeStatements) {
        try {
          await db.execute({ sql, args: [] });
        } catch {
          // Already applied on databases that have been migrated.
        }
      }
    })().catch(() => {
      // Never let a schema probe take down a page render; reads fall back instead.
      schemaUpgrade = null;
    });
  }

  await schemaUpgrade;
}

async function ensureProductCategoriesTable() {
  if (!hasDatabaseConfig()) {
    return;
  }

  await ensureSchemaUpgrades();
  const db = getDatabaseClient();
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS product_categories (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    args: []
  });
}

function parseFaqs(value: unknown): CompanyFaq[] {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        question: String(item?.question ?? "").trim(),
        answer: String(item?.answer ?? "").trim()
      }))
      .filter((item) => item.question && item.answer);
  } catch {
    return [];
  }
}

function companyFromRow(row: DbRow): AssociatedCompany {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: removeRetiredPublicCopy(String(row.name)),
    summary: removeRetiredPublicCopy(String(row.summary ?? "")),
    description: removeRetiredPublicCopy(String(row.description ?? "")),
    logoUrl: String(row.logo_url ?? ""),
    websiteUrl: row.website_url ? String(row.website_url) : null,
    eyebrow: removeRetiredPublicCopy(String(row.eyebrow ?? "")),
    heading: removeRetiredPublicCopy(String(row.heading ?? "")),
    content: sanitizeRichText(String(row.content ?? "")),
    faqs: parseFaqs(row.faqs),
    highlights: parseJsonArray(row.highlights).map(removeRetiredPublicCopy),
    distributorStatus: String(row.distributor_status ?? ""),
    territory: String(row.territory ?? ""),
    metaTitle: removeRetiredPublicCopy(String(row.meta_title ?? "")),
    metaDescription: removeRetiredPublicCopy(String(row.meta_description ?? "")),
    metaKeywords: parseKeywords(row.meta_keywords),
    isFeatured: Boolean(row.is_featured)
  };
}

function blogPostFromRow(row: DbRow): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    content: sanitizeRichText(String(row.content ?? "")),
    coverImageUrl: String(row.cover_image_url ?? ""),
    coverImageAlt: String(row.cover_image_alt ?? ""),
    author: String(row.author ?? ""),
    category: String(row.category ?? ""),
    publishedAt: String(row.published_at ?? ""),
    metaTitle: String(row.meta_title ?? ""),
    metaDescription: String(row.meta_description ?? ""),
    metaKeywords: parseKeywords(row.meta_keywords),
    isFeatured: Boolean(row.is_featured)
  };
}

function managedBlogPostFromRow(row: DbRow): ManagedBlogPost {
  return {
    ...blogPostFromRow(row),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

function managedCompanyFromRow(row: DbRow): ManagedCompany {
  return {
    ...companyFromRow(row),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

function teamMemberFromRow(row: DbRow): TeamMember {
  return {
    id: String(row.id),
    name: removeRetiredPublicCopy(String(row.name)),
    role: removeRetiredPublicCopy(String(row.role)),
    bio: removeRetiredPublicCopy(String(row.bio ?? "")),
    imageUrl: String(row.image_url ?? ""),
    sortOrder: Number(row.sort_order ?? 0)
  };
}

function managedTeamMemberFromRow(row: DbRow): ManagedTeamMember {
  return {
    ...teamMemberFromRow(row),
    isActive: Boolean(row.is_active)
  };
}

function pageFromRow(row: DbRow): CmsPage {
  return {
    slug: String(row.slug),
    title: String(row.title ?? ""),
    eyebrow: String(row.eyebrow ?? ""),
    description: String(row.description ?? ""),
    imageUrl: String(row.image_url ?? ""),
    videoUrl: String(row.video_url ?? ""),
    ctaLabel: String(row.cta_label ?? ""),
    ctaHref: String(row.cta_href ?? ""),
    metaTitle: String(row.meta_title ?? ""),
    metaDescription: String(row.meta_description ?? ""),
    metaKeywords: parseKeywords(row.meta_keywords),
    isActive: Boolean(row.is_active),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

function removeRetiredPublicCopy(value: string) {
  return value
    .replaceAll("Procurement Support", "Product Support")
    .replaceAll(
      "Procurement becomes easier when requirements, product fit, availability, documentation, and continuity are handled in one clear flow.",
      "Supply conversations become easier when requirements, product fit, availability, documentation, and continuity are handled in one clear flow."
    )
    .replaceAll("Industries Served", "Areas We Serve")
    .replaceAll("Associated Companies", "Partner Companies")
    .replaceAll("Associated Company", "Partner Company")
    .replaceAll("associated companies", "partner companies")
    .replaceAll("associated company", "partner company")
    .replaceAll("associated product companies", "partner companies")
    .replaceAll("procurement support", "supply support")
    .replaceAll("medical procurement", "medical supply")
    .replaceAll("procurement details", "details")
    .replaceAll("procurement timelines", "supply timelines")
    .replaceAll("procurement moves", "supply moves")
    .replaceAll("procurement", "supply");
}

function sanitizePageContent(page: CmsPage): CmsPage {
  return {
    ...page,
    eyebrow: removeRetiredPublicCopy(page.eyebrow),
    title: removeRetiredPublicCopy(page.title),
    description: removeRetiredPublicCopy(page.description),
    ctaLabel: removeRetiredPublicCopy(page.ctaLabel),
    metaTitle: removeRetiredPublicCopy(page.metaTitle),
    metaDescription: removeRetiredPublicCopy(page.metaDescription)
  };
}

function resourceFromRow(row: DbRow): CmsResource {
  return {
    id: String(row.id),
    key: String(row.resource_key),
    label: removeRetiredPublicCopy(String(row.label ?? "")),
    groupName: String(row.group_name ?? ""),
    type: String(row.resource_type ?? "text"),
    value: removeRetiredPublicCopy(String(row.value ?? "")),
    metadata: parseJsonObject(row.metadata),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

function submissionFromRow(row: DbRow): ContactSubmission {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    organization: String(row.organization ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    interest: String(row.interest ?? ""),
    productSlug: String(row.product_slug ?? ""),
    productName: String(row.product_name ?? ""),
    message: String(row.message ?? ""),
    status: String(row.status ?? "new"),
    createdAt: String(row.created_at ?? "")
  };
}

async function safeQuery<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!hasDatabaseConfig()) {
    return fallback;
  }

  try {
    return await query();
  } catch {
    return fallback;
  }
}

export async function getProducts() {
  return safeQuery(async () => {
    await ensureProductCategoriesTable();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: `SELECT products.* FROM products
        WHERE products.is_active = 1
          AND EXISTS (
            SELECT 1 FROM product_categories
            WHERE product_categories.slug = products.category_slug
              AND product_categories.is_active = 1
          )
          AND (
            products.company_slug IS NULL
            OR products.company_slug = ''
            OR EXISTS (
              SELECT 1 FROM associated_companies
              WHERE associated_companies.slug = products.company_slug
                AND associated_companies.is_active = 1
            )
          )
        ORDER BY products.sort_order ASC, products.name ASC`,
      args: []
    });

    return result.rows.map((row) => productFromRow(row as DbRow));
  }, fallbackProducts);
}

export async function getProductCategories() {
  return safeQuery(async () => {
    await ensureProductCategoriesTable();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC",
      args: []
    });

    return result.rows.map((row) => categoryFromRow(row as DbRow));
  }, fallbackCategories);
}

export async function getProductCategoryBySlug(slug: string) {
  const fallback =
    fallbackCategories.find((category) => category.slug === slug) ?? null;

  return safeQuery(async () => {
    await ensureProductCategoriesTable();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM product_categories WHERE is_active = 1 AND slug = ? LIMIT 1",
      args: [slug]
    });

    const row = result.rows[0];
    return row ? categoryFromRow(row as DbRow) : null;
  }, fallback);
}

export async function getProductsByCategory(categorySlug: string) {
  const fallback = fallbackProducts.filter(
    (product) => product.categorySlug === categorySlug
  );

  return safeQuery(async () => {
    await ensureProductCategoriesTable();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: `SELECT products.* FROM products
        WHERE products.is_active = 1
          AND products.category_slug = ?
          AND EXISTS (
            SELECT 1 FROM product_categories
            WHERE product_categories.slug = products.category_slug
              AND product_categories.is_active = 1
          )
          AND (
            products.company_slug IS NULL
            OR products.company_slug = ''
            OR EXISTS (
              SELECT 1 FROM associated_companies
              WHERE associated_companies.slug = products.company_slug
                AND associated_companies.is_active = 1
            )
          )
        ORDER BY products.sort_order ASC, products.name ASC`,
      args: [categorySlug]
    });

    return result.rows.map((row) => productFromRow(row as DbRow));
  }, fallback);
}

export async function getProductsByCompany(companySlug: string) {
  const fallback = fallbackProducts.filter(
    (product) => product.companySlug === companySlug
  );

  return safeQuery(async () => {
    await ensureProductCategoriesTable();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: `SELECT products.* FROM products
        WHERE products.is_active = 1
          AND products.company_slug = ?
          AND EXISTS (
            SELECT 1 FROM associated_companies
            WHERE associated_companies.slug = products.company_slug
              AND associated_companies.is_active = 1
          )
          AND EXISTS (
            SELECT 1 FROM product_categories
            WHERE product_categories.slug = products.category_slug
              AND product_categories.is_active = 1
          )
        ORDER BY products.sort_order ASC, products.name ASC`,
      args: [companySlug]
    });

    return result.rows.map((row) => productFromRow(row as DbRow));
  }, fallback);
}

export async function getProductBySlug(slug: string) {
  const fallback =
    fallbackProducts.find((product) => product.slug === slug) ?? null;

  return safeQuery(async () => {
    await ensureProductCategoriesTable();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: `SELECT products.* FROM products
        WHERE products.is_active = 1
          AND products.slug = ?
          AND EXISTS (
            SELECT 1 FROM product_categories
            WHERE product_categories.slug = products.category_slug
              AND product_categories.is_active = 1
          )
          AND (
            products.company_slug IS NULL
            OR products.company_slug = ''
            OR EXISTS (
              SELECT 1 FROM associated_companies
              WHERE associated_companies.slug = products.company_slug
                AND associated_companies.is_active = 1
            )
          )
        LIMIT 1`,
      args: [slug]
    });

    const row = result.rows[0];
    return row ? productFromRow(row as DbRow) : null;
  }, fallback);
}

export async function getAssociatedCompanies() {
  return safeQuery(async () => {
    await ensureSchemaUpgrades();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM associated_companies WHERE is_active = 1 ORDER BY sort_order ASC, name ASC",
      args: []
    });

    return result.rows.map((row) => companyFromRow(row as DbRow));
  }, fallbackCompanies);
}

export async function getPartnerCompanyBySlug(slug: string) {
  const fallback =
    fallbackCompanies.find((company) => company.slug === slug) ?? null;

  return safeQuery(async () => {
    await ensureSchemaUpgrades();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM associated_companies WHERE is_active = 1 AND slug = ? LIMIT 1",
      args: [slug]
    });

    const row = result.rows[0];
    return row ? companyFromRow(row as DbRow) : null;
  }, fallback);
}

export async function getBlogPosts(limit?: number) {
  return safeQuery(async () => {
    await ensureSchemaUpgrades();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: `SELECT * FROM blog_posts
        WHERE is_active = 1
        ORDER BY sort_order ASC, published_at DESC${limit ? " LIMIT ?" : ""}`,
      args: limit ? [limit] : []
    });

    return result.rows.map((row) => blogPostFromRow(row as DbRow));
  }, fallbackBlogPosts);
}

export async function getBlogPostBySlug(slug: string) {
  return safeQuery(async () => {
    await ensureSchemaUpgrades();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM blog_posts WHERE is_active = 1 AND slug = ? LIMIT 1",
      args: [slug]
    });

    const row = result.rows[0];
    return row ? blogPostFromRow(row as DbRow) : null;
  }, null);
}

/** Posts shown under an article, excluding the article itself. */
export async function getRelatedBlogPosts(slug: string, limit = 3) {
  return safeQuery(async () => {
    await ensureSchemaUpgrades();
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: `SELECT * FROM blog_posts
        WHERE is_active = 1 AND slug != ?
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ?`,
      args: [slug, limit]
    });

    return result.rows.map((row) => blogPostFromRow(row as DbRow));
  }, []);
}

export async function getTeamMembers() {
  return safeQuery(async () => {
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, name ASC",
      args: []
    });

    return result.rows.map((row) => teamMemberFromRow(row as DbRow));
  }, fallbackTeamMembers);
}

export async function getPageContent(slug: string) {
  const fallback = sanitizePageContent(
    defaultPages.find((page) => page.slug === slug) ??
    defaultPages.find((page) => page.slug === "home-hero")!
  );

  return safeQuery(async () => {
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM cms_pages WHERE slug = ? AND is_active = 1 LIMIT 1",
      args: [slug]
    });

    const row = result.rows[0];
    return row ? sanitizePageContent(pageFromRow(row as DbRow)) : fallback;
  }, fallback);
}

export async function getCmsResources(groupName: string) {
  const fallback = defaultResources.filter(
    (resource) => resource.groupName === groupName && resource.isActive
  );

  return safeQuery(async () => {
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM cms_resources WHERE group_name = ? AND is_active = 1 ORDER BY sort_order ASC, label ASC",
      args: [groupName]
    });

    const resources = result.rows.map((row) => resourceFromRow(row as DbRow));
    return resources.length > 0 ? resources : fallback;
  }, fallback);
}

export async function getSiteSettings() {
  const resources = await getCmsResources("site_settings");
  const byKey = new Map(resources.map((resource) => [resource.key, resource]));
  const address = byKey.get("site.address");

  return {
    phone: byKey.get("site.phone")?.value || site.phone,
    email: byKey.get("site.email")?.value || site.email,
    address: address?.value || site.address,
    mapsUrl: address?.metadata.mapsUrl || site.mapsUrl
  };
}

export async function getAdminDashboardData() {
  if (!hasDatabaseConfig()) {
    return {
      categories: fallbackCategories.map((category, index) => ({
        ...category,
        isActive: true,
        sortOrder: index + 1
      })),
      products: fallbackProducts.map((product, index) => ({
        ...product,
        isActive: true,
        sortOrder: index + 1
      })),
      companies: fallbackCompanies.map((company, index) => ({
        ...company,
        isActive: true,
        sortOrder: index + 1
      })),
      teamMembers: fallbackTeamMembers.map((member) => ({
        ...member,
        isActive: true
      })),
      pages: defaultPages,
      resources: defaultResources,
      blogPosts: [] as ManagedBlogPost[],
      submissions: [] as ContactSubmission[]
    };
  }

  const db = getDatabaseClient();
  await ensureProductCategoriesTable();
  await ensureSchemaUpgrades();
  const [
    categories,
    products,
    companies,
    teamMembers,
    pages,
    resources,
    blogPosts,
    submissions
  ] = await Promise.all([
      db.execute({
        sql: "SELECT * FROM product_categories ORDER BY sort_order ASC, name ASC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM products ORDER BY sort_order ASC, name ASC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM associated_companies ORDER BY sort_order ASC, name ASC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM team_members ORDER BY sort_order ASC, name ASC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM cms_pages ORDER BY slug ASC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM cms_resources ORDER BY group_name ASC, sort_order ASC, label ASC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM blog_posts ORDER BY sort_order ASC, published_at DESC",
        args: []
      }),
      db.execute({
        sql: "SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 50",
        args: []
      })
    ]);

  const storedPages = pages.rows.map((row) => pageFromRow(row as DbRow));
  const storedResources = resources.rows.map((row) =>
    resourceFromRow(row as DbRow)
  );

  return {
    categories:
      categories.rows.length > 0
        ? categories.rows.map((row) => managedCategoryFromRow(row as DbRow))
        : fallbackCategories.map((category, index) => ({
            ...category,
            isActive: true,
            sortOrder: index + 1
          })),
    products: products.rows.map((row) => managedProductFromRow(row as DbRow)),
    companies: companies.rows.map((row) => managedCompanyFromRow(row as DbRow)),
    teamMembers: teamMembers.rows.map((row) =>
      managedTeamMemberFromRow(row as DbRow)
    ),
    pages: [
      ...defaultPages.filter(
        (page) => !storedPages.some((stored) => stored.slug === page.slug)
      ),
      ...storedPages
    ],
    resources: [
      ...defaultResources.filter(
        (resource) =>
          !storedResources.some((stored) => stored.key === resource.key)
      ),
      ...storedResources
    ],
    blogPosts: blogPosts.rows.map((row) => managedBlogPostFromRow(row as DbRow)),
    submissions: submissions.rows.map((row) => submissionFromRow(row as DbRow))
  };
}
