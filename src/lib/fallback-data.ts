export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  youtubeUrl: string;
  companySlug?: string | null;
  features: string[];
  specifications: Record<string, string>;
  isFeatured: boolean;
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
};

export type AssociatedCompany = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  logoUrl: string;
  websiteUrl?: string | null;
  isFeatured: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  sortOrder: number;
};

export const fallbackCategories: ProductCategory[] = [
  {
    id: "category-cleaning-solutions",
    slug: "cleaning-solutions",
    name: "Cleaning & Hygiene",
    summary:
      "Cleaning accessories, hygiene chemicals, and facility care products.",
    description:
      "Cleaning and hygiene categories for hospitals, commercial buildings, hospitality operators, and other high-use environments.",
    imageUrl: "",
    isFeatured: true
  },
  {
    id: "category-healthcare-products",
    slug: "healthcare-products",
    name: "Healthcare Products",
    summary:
      "Healthcare products and diagnostic equipment for institutional buyers.",
    description:
      "Healthcare product categories supported through partner company relationships and practical supply coordination.",
    imageUrl: "",
    isFeatured: true
  },
  {
    id: "category-surgical-instruments",
    slug: "surgical-instruments",
    name: "Surgical Instruments",
    summary: "Surgical items and clinical products for hospitals and clinics.",
    description:
      "Surgical item categories for healthcare buyers who need clear product conversations and dependable support.",
    imageUrl: "",
    isFeatured: true
  },
  {
    id: "category-medical-equipment",
    slug: "medical-equipment",
    name: "Medical Equipment",
    summary: "Medical equipment sourcing conversations for healthcare buyers.",
    description:
      "Medical equipment categories coordinated around facility requirements, quality expectations, and availability.",
    imageUrl: "",
    isFeatured: true
  },
  {
    id: "category-hospital-furniture",
    slug: "hospital-furniture",
    name: "Hospital Furniture",
    summary: "Hospital furniture and related healthcare facility requirements.",
    description:
      "Hospital furniture categories for healthcare facilities and institutional buyers.",
    imageUrl: "",
    isFeatured: true
  }
];

export const fallbackCompanies: AssociatedCompany[] = [
  {
    id: "company-diversey",
    slug: "diversey",
    name: "Diversey",
    summary: "Professional cleaning, hygiene, and facility care solutions.",
    description:
      "Diversey is included as a partner company for institutional cleaning, hygiene, floor care, and facility maintenance categories.",
    logoUrl: "",
    websiteUrl: "https://diversey.com",
    isFeatured: true
  },
  {
    id: "company-taski",
    slug: "taski",
    name: "TASKI",
    summary: "Professional floor care equipment and cleaning systems.",
    description:
      "TASKI is included as a partner company for professional floor cleaning machines, tools, and facility cleaning systems.",
    logoUrl: "",
    websiteUrl: "https://taski.com",
    isFeatured: true
  }
];

export const fallbackProducts: Product[] = [
  {
    id: "prod-floor-cleaner",
    slug: "professional-floor-cleaner",
    name: "Cleaning & Hygiene Products",
    categorySlug: "cleaning-solutions",
    shortDescription:
      "Cleaning accessories and hygiene chemicals for institutional and healthcare environments.",
    description:
      "A cleaning and hygiene category for hospitals, offices, hotels, and facility teams that need consistent product support across high-use spaces.",
    imageUrl: "",
    youtubeUrl: "",
    companySlug: "diversey",
    features: [
      "Suitable for daily cleaning programs",
      "Designed for commercial facility workflows",
      "Can be paired with janitorial systems"
    ],
    specifications: {
      Category: "Cleaning chemical",
      Use: "Floor cleaning",
      Availability: "On request"
    },
    isFeatured: true
  },
  {
    id: "prod-disinfectant",
    slug: "surface-disinfectant",
    name: "Healthcare Products",
    categorySlug: "healthcare-products",
    shortDescription:
      "Healthcare product supply category for institutional teams.",
    description:
      "Healthcare product support for buyers who need quality-led sourcing, availability conversations, and clear coordination.",
    imageUrl: "",
    youtubeUrl: "",
    companySlug: "diversey",
    features: [
      "For hygiene-sensitive spaces",
      "Useful for planned cleaning protocols",
      "Appropriate product matching available"
    ],
    specifications: {
      Category: "Healthcare products",
      Use: "Clinical and institutional supply",
      Availability: "On request"
    },
    isFeatured: true
  },
  {
    id: "prod-degreaser",
    slug: "heavy-duty-degreaser",
    name: "Medical Equipment",
    categorySlug: "medical-equipment",
    shortDescription:
      "Medical equipment sourcing category for hospitals and healthcare institutions.",
    description:
      "Medical equipment conversations are coordinated around facility requirements, quality expectations, availability, and supply timelines.",
    imageUrl: "",
    youtubeUrl: "",
    companySlug: null,
    features: [
      "Supports heavy cleaning routines",
      "Useful for kitchens and service areas",
      "Available for institutional supply"
    ],
    specifications: {
      Category: "Medical equipment",
      Use: "Healthcare operations",
      Availability: "On request"
    },
    isFeatured: false
  },
  {
    id: "prod-taski-machine",
    slug: "taski-floor-care-machine",
    name: "Hospital Furniture",
    categorySlug: "hospital-furniture",
    shortDescription:
      "Hospital furniture and related healthcare facility requirements.",
    description:
      "Hospital furniture requirements can be coordinated with practical supply support for healthcare facilities.",
    imageUrl: "",
    youtubeUrl: "",
    companySlug: "taski",
    features: [
      "Healthcare facility furniture category",
      "Useful for hospitals and clinics",
      "Product matching based on site requirements"
    ],
    specifications: {
      Category: "Hospital furniture",
      Use: "Healthcare facilities",
      Availability: "On request"
    },
    isFeatured: true
  },
  {
    id: "prod-surgical-set",
    slug: "general-surgical-instrument-set",
    name: "General Surgical Instrument Set",
    categorySlug: "surgical-instruments",
    shortDescription:
      "Surgical instrument category for hospitals and clinics.",
    description:
      "A general surgical instrument set category for healthcare buyers who need coordinated sourcing and clear product conversations before purchase.",
    imageUrl: "",
    youtubeUrl: "",
    companySlug: null,
    features: [
      "Healthcare supply support",
      "Instrument category coordination",
      "Availability confirmed on inquiry"
    ],
    specifications: {
      Category: "Surgical instruments",
      Use: "Clinical procedures",
      Availability: "On request"
    },
    isFeatured: true
  },
  {
    id: "prod-institutional-supply",
    slug: "institutional-consumable-supplies",
    name: "Institutional Consumable Supplies",
    categorySlug: "institutional-supplies",
    shortDescription:
      "Operational consumables for hotels, hospitals, offices, and facilities.",
    description:
      "Consumable supply categories for organizations that need regular purchasing support across facility operations, housekeeping, hygiene, and back-office requirements.",
    imageUrl: "",
    youtubeUrl: "",
    companySlug: null,
    features: [
      "Supports repeat purchasing",
      "Suitable for institutional buyers",
      "Category guidance available"
    ],
    specifications: {
      Category: "Institutional supplies",
      Use: "Operations",
      Availability: "On request"
    },
    isFeatured: false
  }
];

export const fallbackTeamMembers: TeamMember[] = [
  {
    id: "team-leadership",
    name: "Leadership Team",
    role: "Company Leadership",
    bio: "Responsible for supply relationships, product category direction, and institutional customer coordination.",
    imageUrl: "",
    sortOrder: 1
  },
  {
    id: "team-support",
    name: "Customer Support Team",
    role: "Customer & Supply Coordination",
    bio: "Handles product inquiries, availability conversations, supply support, and ongoing customer communication.",
    imageUrl: "",
    sortOrder: 2
  }
];
