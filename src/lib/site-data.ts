import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Factory,
  FlaskConical,
  HeartPulse,
  Hotel,
  Layers3,
  Leaf,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Truck,
  UsersRound,
  Utensils
} from "lucide-react";

export const site = {
  name: "Edward Trading Pvt. Ltd.",
  description:
    "Nepal-based healthcare and trading company supplying diagnostic equipment, healthcare products, surgical items, medical equipment, cleaning and hygiene solutions, and hospital furniture.",
  url: "https://www.edwardtrading.com",
  phone: "+977-01-XXXXXXX",
  email: "info@edwardtrading.com",
  address: "Tripureshwor-11, Kathmandu",
  mapsUrl: "https://maps.google.com/?q=Tripureshwor-11%2C%20Kathmandu"
};

export const navItems = [
  { label: "About", href: "/about" },
  { label: "Solutions", href: "/solutions" },
  { label: "Partner Companies", href: "/partner-companies" },
  { label: "Areas We Serve", href: "/industries" },
  { label: "Contact", href: "/contact" }
];

export const heroImage = "";
export const cleaningImage = "";
export const healthcareImage = "";
export const warehouseImage = "";

export const solutions = [
  {
    title: "Cleaning & Hygiene",
    href: "/cleaning-solutions",
    description:
      "Cleaning accessories, hygiene chemicals, facility care products, and practical support for institutional environments.",
    icon: FlaskConical,
    image: cleaningImage
  },
  {
    title: "Healthcare Products",
    href: "/partner-companies",
    description:
      "Healthcare products and diagnostic equipment supported through trusted supplier relationships.",
    icon: Sparkles,
    image: ""
  },
  {
    title: "Surgical Instruments",
    href: "/surgical-instruments",
    description:
      "Surgical items, clinical supply coordination, and medical product support for hospitals and clinics.",
    icon: Stethoscope,
    image: healthcareImage
  },
  {
    title: "Medical Equipment",
    href: "/solutions",
    description:
      "Medical equipment sourcing conversations for healthcare buyers that need reliable product guidance.",
    icon: PackageCheck,
    image: warehouseImage
  },
  {
    title: "Hospital Furniture",
    href: "/solutions",
    description:
      "Hospital furniture and related institutional requirements for healthcare facilities.",
    icon: ShieldCheck,
    image: ""
  }
];

export const industries = [
  { title: "Hospitals & Clinics", icon: HeartPulse },
  { title: "Hotels & Resorts", icon: Hotel },
  { title: "Restaurants & Catering", icon: Utensils },
  { title: "Commercial Buildings", icon: Building2 },
  { title: "Schools & Colleges", icon: UsersRound },
  { title: "Manufacturing Sites", icon: Factory },
  { title: "Retail & Supermarkets", icon: ShoppingBag },
  { title: "Corporate Offices", icon: BriefcaseBusiness },
  { title: "Facility Contractors", icon: Layers3 },
  { title: "Logistics & Warehousing", icon: Truck }
];

export const whyChooseUs = [
  {
    title: "Healthcare Product Focus",
    description:
      "Supply choices are shaped around diagnostic, surgical, medical, and hospital operating needs.",
    icon: Building2
  },
  {
    title: "Industry Experience",
    description:
      "Leadership experience in medical supplies and IVD sales informs practical product conversations.",
    icon: BadgeCheck
  },
  {
    title: "Quality-Led Sourcing",
    description:
      "Products are selected around quality, suitability, and dependable supply cycles.",
    icon: ShieldCheck
  },
  {
    title: "Responsive Coordination",
    description:
      "Clear, continuous communication supports clients from inquiry to long-term supply planning.",
    icon: Phone
  },
  {
    title: "Nepal Market Understanding",
    description:
      "Local market awareness helps healthcare teams match product expectations with realistic availability.",
    icon: MapPin
  },
  {
    title: "Long-Term Partnership",
    description:
      "The company is built around mutual growth, client trust, and value for investment.",
    icon: Leaf
  }
];

export const processSteps = [
  {
    title: "Understand Requirements",
    description:
      "We clarify facility needs, product categories, quantities, quality expectations, and supply timelines."
  },
  {
    title: "Recommend Fit",
    description:
      "Our team maps requirements to suitable healthcare, cleaning, medical, or institutional product options."
  },
  {
    title: "Coordinate Supply",
    description:
      "We confirm availability, documentation needs, packaging, and delivery expectations before supply moves."
  },
  {
    title: "Support Continuity",
    description:
      "Repeat requirements are handled with consistent communication and category guidance."
  }
];

export const values = [
  "Quality products",
  "Client-centric service",
  "Transparent communication",
  "Long-term partnership"
];

export const contactInterests = [
  "Diagnostic equipment",
  "Healthcare products",
  "Surgical instruments",
  "Medical equipment",
  "Cleaning and hygiene",
  "Hospital furniture",
  "General inquiry"
];

export type Solution = (typeof solutions)[number];
