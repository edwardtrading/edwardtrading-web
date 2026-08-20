import {
  ArrowRight,
  CheckCircle2,
  CirclePlus,
  Database,
  Eye,
  ExternalLink,
  EyeOff,
  FileText,
  Globe2,
  Home,
  KeyRound,
  Layers3,
  Mail,
  Newspaper,
  Package,
  Pencil,
  Sparkles,
  Upload,
  UsersRound
} from "lucide-react";
import {
  archiveRecord,
  saveAdminUser,
  saveAssociatedCompany,
  savePageContent,
  saveProduct,
  saveBlogPost,
  saveProductCategory,
  saveResource,
  saveTeamMember,
  updateSubmissionStatus
} from "@/app/admin/actions";
import {
  ProblemNotice,
  SaveButton,
  SavedNotice,
  StickySaveBar
} from "@/components/admin/form-submit";
import {
  ConfirmSubmit,
  FaqField,
  ImageField,
  LineListField,
  ListFilter,
  PairListField,
  SearchAppearanceFields,
  SlugField
} from "@/components/admin/admin-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type {
  CmsPage,
  CmsResource,
  ContactSubmission,
  ManagedBlogPost,
  ManagedCategory,
  ManagedCompany,
  ManagedProduct,
  ManagedTeamMember
} from "@/lib/cms-data";
import { distributorKeywordVariants, resolveCompanyPresentation } from "@/lib/seo";
import { site } from "@/lib/site-data";
import { formatPublishedDate } from "@/lib/utils";

type AdminData = {
  categories: ManagedCategory[];
  products: ManagedProduct[];
  companies: ManagedCompany[];
  teamMembers: ManagedTeamMember[];
  pages: CmsPage[];
  resources: CmsResource[];
  blogPosts: ManagedBlogPost[];
  submissions: ContactSubmission[];
};

export type AdminSection =
  | "overview"
  | "home"
  | "about"
  | "pages"
  | "resources"
  | "solutions"
  | "industries"
  | "partner-companies"
  | "contact"
  | "categories"
  | "products"
  | "companies"
  | "team"
  | "blog"
  | "inquiries"
  | "access";

const adminSections: { label: string; section: AdminSection; href: string }[] = [
  { label: "Overview", section: "overview", href: "/admin" },
  { label: "Home", section: "home", href: "/admin/home" },
  { label: "About", section: "about", href: "/admin/about" },
  { label: "Solutions", section: "solutions", href: "/admin/solutions" },
  { label: "Areas We Serve", section: "industries", href: "/admin/industries" },
  { label: "Partner Companies", section: "partner-companies", href: "/admin/partner-companies" },
  { label: "Products", section: "products", href: "/admin/products" },
  { label: "Contact", section: "contact", href: "/admin/contact" },
  { label: "Blog", section: "blog", href: "/admin/blog" },
  { label: "Inquiries", section: "inquiries", href: "/admin/inquiries" },
  { label: "Access", section: "access", href: "/admin/access" }
];

const pageLabels: Record<string, { group: string; label: string }> = {
  "home-hero": { group: "Home Page", label: "Hero section" },
  "home-about": { group: "Home Page", label: "About strip" },
  "home-solutions": { group: "Home Page", label: "Solutions section" },
  "home-partnership": { group: "Home Page", label: "Partner companies section" },
  "home-why": { group: "Home Page", label: "Why choose us section" },
  "home-process": { group: "Home Page", label: "Process section" },
  "global-cta": { group: "Shared Sections", label: "Contact call-to-action" },
  about: { group: "Public Pages", label: "About page" },
  solutions: { group: "Public Pages", label: "Solutions page" },
  "partner-companies": {
    group: "Public Pages",
    label: "Partner companies page"
  },
  "cleaning-solutions": {
    group: "Public Pages",
    label: "Cleaning and hygiene page"
  },
  "surgical-instruments": {
    group: "Public Pages",
    label: "Surgical instruments page"
  },
  industries: { group: "Public Pages", label: "Areas we serve page" },
  blog: { group: "Public Pages", label: "Blog listing page" },
  contact: { group: "Public Pages", label: "Contact page" }
};

const inputClass =
  "min-h-11 w-full rounded-md border border-charcoal/12 bg-light-gray px-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
const textareaClass =
  "w-full rounded-md border border-charcoal/12 bg-light-gray px-3 py-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "grid gap-2 text-sm font-semibold text-charcoal";
const helpClass = "text-xs font-normal leading-6 text-slate";
const panelClass = "rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm md:p-6";
const sectionClass = "scroll-mt-28 rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm md:p-7";

const visibleAdminSections = new Set<AdminSection>([
  "overview",
  "home",
  "about",
  "solutions",
  "industries",
  "partner-companies",
  "products",
  "contact",
  "blog",
  "inquiries",
  "access"
]);

function returnPath(section: AdminSection) {
  return section === "overview" ? "/admin" : `/admin/${section}`;
}

function hiddenReturnInput(section: AdminSection) {
  return <input type="hidden" name="returnTo" value={returnPath(section)} />;
}

function getPage(data: AdminData, slug: string) {
  return data.pages.find((page) => page.slug === slug);
}

function categoryName(data: AdminData, slug: string) {
  return data.categories.find((category) => category.slug === slug)?.name || slug;
}

function companyName(data: AdminData, slug?: string | null) {
  if (!slug) {
    return "No brand";
  }

  return data.companies.find((company) => company.slug === slug)?.name || slug;
}

function productCountForCompany(data: AdminData, slug: string) {
  return data.products.filter((product) => product.companySlug === slug).length;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-charcoal/20 bg-light-gray p-6 text-center text-sm leading-7 text-slate">
      {message}
    </div>
  );
}

/** Where a page record actually shows up on the public site. */
function publicPathForPage(slug: string) {
  if (slug.startsWith("home-")) {
    return "/";
  }

  if (slug === "global-cta") {
    return "/contact";
  }

  return `/${slug}`;
}

function specsToLines(specs: Record<string, string>) {
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function metadataToLines(metadata: Record<string, string>) {
  return specsToLines(metadata);
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  disabled,
  placeholder,
  help
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClass}
      />
      {help ? <span className={helpClass}>{help}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  disabled,
  placeholder,
  help
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className={`${labelClass} md:col-span-2`}>
      {label}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={textareaClass}
      />
      {help ? <span className={helpClass}>{help}</span> : null}
    </label>
  );
}

function FileField({
  label,
  name,
  accept = "image/*",
  disabled
}: {
  label: string;
  name: string;
  accept?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`${labelClass} md:col-span-2`}>
      {label}
      <span className="flex min-h-24 items-center gap-4 rounded-md border border-dashed border-charcoal/20 bg-light-gray px-4 py-4 text-sm text-slate transition hover:border-primary/40">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-sm">
          <Upload aria-hidden className="h-5 w-5" />
        </span>
        <input
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          className="w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
        />
      </span>
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
  disabled
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-charcoal/10 bg-light-gray px-3 text-sm font-semibold text-charcoal">
      <span>{label}</span>
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="h-4 w-4 accent-primary"
      />
    </label>
  );
}

/**
 * Search settings shared by products, categories, partner companies, pages, and
 * blog posts. Wraps the interactive Google preview and the keyword list so every
 * editor sees the same layout, and so blank fields keep their automatic value.
 */
function SeoFieldset({
  metaTitle,
  metaDescription,
  metaKeywords,
  disabled,
  fallbackTitle,
  fallbackDescription,
  path,
  keywordHelp,
  keywordPlaceholder
}: {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  disabled: boolean;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  keywordHelp?: string;
  keywordPlaceholder?: string;
}) {
  return (
    <div className="grid gap-5 md:col-span-2">
      <SearchAppearanceFields
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
        path={path}
        siteUrl={site.url}
        disabled={disabled}
      />
      <LineListField
        label="Search words customers type"
        name="metaKeywords"
        defaultValue={metaKeywords ?? []}
        disabled={disabled}
        placeholder={keywordPlaceholder ?? "for example: floor scrubber Nepal"}
        addLabel="Add search words"
        help={
          keywordHelp ??
          "Optional. Add the phrases people would type into Google to find this page."
        }
      />
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-md px-3 text-xs font-bold ${
        active
          ? "bg-primary/10 text-primary"
          : "bg-charcoal/10 text-charcoal/60"
      }`}
    >
      {active ? (
        <Eye aria-hidden className="h-3.5 w-3.5" />
      ) : (
        <EyeOff aria-hidden className="h-3.5 w-3.5" />
      )}
      {active ? "Shown on website" : "Hidden from website"}
    </span>
  );
}

function ArchiveButton({
  table,
  id,
  returnTo,
  disabled,
  noun = "item"
}: {
  table: string;
  id: string;
  returnTo: string;
  disabled?: boolean;
  noun?: string;
}) {
  return (
    <form action={archiveRecord}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit
        label="Hide from website"
        question={`Hide this ${noun} from the website?`}
        confirmLabel="Yes, hide it"
        disabled={disabled}
      />
    </form>
  );
}

/** Opens the live page an entry produces, so editors can check their work. */
function ViewOnSite({ path, label = "View on website" }: { path: string; label?: string }) {
  return (
    <a
      href={path}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-charcoal/12 bg-white px-3 text-xs font-bold text-charcoal transition hover:border-primary hover:text-primary"
    >
      <ExternalLink aria-hidden className="h-4 w-4" />
      {label}
    </a>
  );
}

function SectionHeader({
  id,
  icon: Icon,
  eyebrow,
  title,
  description
}: {
  id: string;
  icon: typeof Database;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          <Icon aria-hidden className="h-4 w-4" />
          {eyebrow}
        </p>
        <h2 className="mt-3 font-heading text-3xl font-extrabold text-charcoal">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate">
          {description}
        </p>
      </div>
    </div>
  );
}

function AddSummary({
  title,
  description,
  icon: Icon = CirclePlus
}: {
  title: string;
  description: string;
  icon?: typeof Database;
}) {
  return (
    <summary className="cursor-pointer list-none">
      <div className="flex min-h-16 items-center justify-between gap-4 rounded-md border border-dashed border-primary/30 bg-primary/5 px-4 py-3 transition hover:border-primary/60 hover:bg-primary/10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-sm">
            <Icon aria-hidden className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-heading text-lg font-extrabold text-charcoal">
              {title}
            </span>
            <span className="mt-1 block text-sm font-semibold text-slate">
              {description}
            </span>
          </span>
        </div>
        <span className="hidden min-h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-primary shadow-sm sm:inline-flex">
          <CirclePlus aria-hidden className="h-4 w-4" />
          Create
        </span>
      </div>
    </summary>
  );
}

function EditSummary({
  eyebrow,
  title,
  meta,
  active
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  active?: boolean;
}) {
  return (
    <summary className="cursor-pointer list-none">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-light-gray text-primary">
            <Pencil aria-hidden className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <h3 className="mt-1 truncate font-heading text-xl font-bold text-charcoal">
              {title}
            </h3>
            {meta ? (
              <p className="mt-1 text-xs font-bold text-slate">{meta}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {typeof active === "boolean" ? <StatusPill active={active} /> : null}
          <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-charcoal/10 bg-white px-3 text-xs font-bold text-charcoal transition group-open:border-primary group-open:text-primary">
            <Pencil aria-hidden className="h-3.5 w-3.5" />
            Edit
          </span>
        </div>
      </div>
    </summary>
  );
}

function CategoryForm({
  category,
  section,
  disabled
}: {
  category?: ManagedCategory;
  section: AdminSection;
  disabled: boolean;
}) {
  return (
    <form action={saveProductCategory} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <Field label="Category name" name="name" defaultValue={category?.name} required disabled={disabled} />
      <SlugField
        defaultValue={category?.slug}
        sourceName="name"
        basePath="/categories"
        disabled={disabled}
      />
      <ImageField
        label="Category image"
        urlName="imageUrl"
        fileName="imageFile"
        defaultUrl={category?.imageUrl}
        disabled={disabled}
      />
      <div className="md:col-span-2">
        <Field label="Short summary" name="summary" defaultValue={category?.summary} required disabled={disabled} placeholder="One line shown on the category card" />
      </div>
      <TextArea label="Description" name="description" defaultValue={category?.description} required disabled={disabled} />
      <SeoFieldset
        metaTitle={category?.metaTitle}
        metaDescription={category?.metaDescription}
        metaKeywords={category?.metaKeywords}
        disabled={disabled}
        fallbackTitle={category?.name || "Category name"}
        fallbackDescription={category?.summary || "The short summary above"}
        path={`/categories/${category?.slug ?? ""}`}
      />
      <Field label="Display order" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} disabled={disabled} placeholder="Lower numbers appear first" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="isFeatured" label="Highlight on the homepage" defaultChecked={category?.isFeatured ?? true} disabled={disabled} />
        <Toggle name="isActive" label="Visible on the website" defaultChecked={category?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label={category ? "Save category" : "Create category"} />
      </div>
    </form>
  );
}

function ProductForm({
  product,
  categories,
  companies,
  section,
  disabled
}: {
  product?: ManagedProduct;
  categories: ManagedCategory[];
  companies: ManagedCompany[];
  section: AdminSection;
  disabled: boolean;
}) {
  const firstCategory = categories[0]?.slug ?? "";

  return (
    <form action={saveProduct} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <Field label="Product name" name="name" defaultValue={product?.name} required disabled={disabled} />
      <SlugField
        defaultValue={product?.slug}
        sourceName="name"
        basePath="/products"
        disabled={disabled}
      />
      <label className={labelClass}>
        Category
        <select
          name="categorySlug"
          required
          disabled={disabled}
          defaultValue={product?.categorySlug ?? firstCategory}
          className={inputClass}
        >
          {categories.length === 0 ? (
            <option value="">Create a category first</option>
          ) : null}
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Partner Company
        <select
          name="companySlug"
          required
          disabled={disabled}
          defaultValue={product?.companySlug ?? companies[0]?.slug ?? ""}
          className={inputClass}
        >
          {companies.length === 0 ? (
            <option value="">Create a partner company first</option>
          ) : null}
          {companies.map((company) => (
            <option key={company.slug} value={company.slug}>
              {company.name}
            </option>
          ))}
        </select>
      </label>
      <ImageField
        label="Product image"
        urlName="imageUrl"
        fileName="imageFile"
        defaultUrl={product?.imageUrl}
        disabled={disabled}
      />
      <div className="md:col-span-2">
        <Field label="YouTube video link" name="youtubeUrl" type="url" defaultValue={product?.youtubeUrl} disabled={disabled} placeholder="Optional. Paste a YouTube link to show a video on the product page" />
      </div>
      <div className="md:col-span-2">
        <Field label="Short description" name="shortDescription" defaultValue={product?.shortDescription} required disabled={disabled} placeholder="One line shown on the product card" />
      </div>
      <TextArea label="Full description" name="description" defaultValue={product?.description} required disabled={disabled} />
      <LineListField
        label="Key features"
        name="features"
        defaultValue={product?.features ?? []}
        disabled={disabled}
        placeholder="for example: Suitable for daily cleaning programs"
        addLabel="Add feature"
        help="Shown as a checklist on the product page."
      />
      <PairListField
        label="Specifications"
        name="specifications"
        defaultValue={Object.entries(product?.specifications ?? {}).map(
          ([key, value]) => ({ key, value })
        )}
        disabled={disabled}
        keyPlaceholder="for example: Availability"
        valuePlaceholder="for example: On request"
        help="Shown as a specifications table on the product page."
      />
      <SeoFieldset
        metaTitle={product?.metaTitle}
        metaDescription={product?.metaDescription}
        metaKeywords={product?.metaKeywords}
        disabled={disabled}
        fallbackTitle={product?.name || "Product name"}
        fallbackDescription={product?.shortDescription || "The short description above"}
        path={`/products/${product?.slug ?? ""}`}
        keywordPlaceholder="for example: Taski Ergodisc 165 price in Nepal"
      />
      <Field label="Display order" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} disabled={disabled} placeholder="Lower numbers appear first" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="isFeatured" label="Highlight on the homepage" defaultChecked={product?.isFeatured ?? false} disabled={disabled} />
        <Toggle name="isActive" label="Visible on the website" defaultChecked={product?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label={product ? "Save product" : "Create product"} />
      </div>
    </form>
  );
}

function CompanyForm({
  company,
  section,
  disabled
}: {
  company?: ManagedCompany;
  section: AdminSection;
  disabled: boolean;
}) {
  // Mirrors the public page so the placeholders show the real automatic wording.
  const presentation = resolveCompanyPresentation(
    company ?? {
      id: "",
      slug: "",
      name: "Brand",
      summary: "",
      description: "",
      logoUrl: "",
      isFeatured: false
    }
  );
  const autoKeywords = distributorKeywordVariants(
    company?.name || "Brand",
    company?.territory || "Nepal"
  );

  return (
    <form action={saveAssociatedCompany} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={company?.id ?? ""} />
      <Field label="Brand name" name="name" defaultValue={company?.name} required disabled={disabled} placeholder="for example: Diversey" />
      <SlugField
        defaultValue={company?.slug}
        sourceName="name"
        basePath="/partner-companies"
        disabled={disabled}
      />
      <ImageField
        label="Brand logo"
        urlName="logoUrl"
        fileName="logoFile"
        defaultUrl={company?.logoUrl}
        disabled={disabled}
        help="Shown on the partner companies page and at the top of this brand's page."
      />
      <div className="md:col-span-2">
        <Field label="Short summary" name="summary" defaultValue={company?.summary ?? ""} disabled={disabled} placeholder="One line shown on the brand card" />
      </div>
      <TextArea label="Description" name="description" defaultValue={company?.description ?? ""} disabled={disabled} help="The opening paragraph on this brand's page." />
      <Field label="Brand's own website" name="websiteUrl" type="url" defaultValue={company?.websiteUrl ?? ""} disabled={disabled} placeholder="Optional. https://..." />

      <div className="grid gap-5 rounded-md border border-charcoal/10 bg-light-gray/60 p-4 md:col-span-2 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            How you are described for this brand
          </p>
          <p className="mt-2 text-xs font-normal leading-6 text-slate">
            These two boxes shape the page heading, the wording customers read,
            and the search phrases this page can be found by. Leave them blank
            and the page reads &quot;{company?.name || "Brand"} Distributor in Nepal&quot;.
          </p>
        </div>
        <label className={labelClass}>
          Your role for this brand
          <select
            name="distributorStatus"
            defaultValue={company?.distributorStatus ?? ""}
            disabled={disabled}
            className={inputClass}
          >
            <option value="">Distributor</option>
            <option value="Authorized Distributor">Authorized Distributor</option>
            <option value="Sole Distributor">Sole Distributor</option>
            <option value="Official Distributor">Official Distributor</option>
            <option value="Dealer">Dealer</option>
            <option value="Supplier">Supplier</option>
          </select>
          <span className="text-xs font-normal leading-6 text-slate">
            Only choose &quot;Authorized&quot; or &quot;Sole&quot; if Edward Trading
            actually holds that appointment for this brand.
          </span>
        </label>
        <Field
          label="Area you cover"
          name="territory"
          defaultValue={company?.territory ?? ""}
          disabled={disabled}
          placeholder="Nepal"
        />
        <Field
          label="Small label above the heading"
          name="eyebrow"
          defaultValue={company?.eyebrow ?? ""}
          disabled={disabled}
          placeholder={presentation.eyebrow}
        />
        <Field
          label="Main page heading"
          name="heading"
          defaultValue={company?.heading ?? ""}
          disabled={disabled}
          placeholder={presentation.heading}
        />
        <LineListField
          label="Key points"
          name="highlights"
          defaultValue={company?.highlights ?? []}
          disabled={disabled}
          placeholder="for example: Nationwide supply across Nepal"
          addLabel="Add key point"
          help="Shown as a row of highlight cards near the top of the page."
        />
      </div>

      <RichTextEditor
        label="Page content"
        name="content"
        defaultValue={company?.content ?? ""}
        disabled={disabled}
        helpText="The main text on this brand's page. Use Heading 2 for sections such as product ranges, who you supply, and delivery. This is the text Google reads when deciding what this page is about."
      />

      <FaqField
        label="Common questions"
        name="faqs"
        defaultValue={company?.faqs ?? []}
        disabled={disabled}
        help="These appear as an expandable list on the page and can show directly in Google results."
      />

      <SeoFieldset
        metaTitle={company?.metaTitle}
        metaDescription={company?.metaDescription}
        metaKeywords={company?.metaKeywords}
        disabled={disabled}
        fallbackTitle={presentation.fallbackTitle}
        fallbackDescription={presentation.fallbackDescription}
        path={`/partner-companies/${company?.slug ?? ""}`}
        keywordPlaceholder={`for example: ${autoKeywords[0] ?? "Diversey distributor in Nepal"}`}
        keywordHelp={`Optional. These phrases are already covered automatically: ${autoKeywords
          .slice(0, 4)
          .join(", ")}.`}
      />

      <Field label="Display order" name="sortOrder" type="number" defaultValue={company?.sortOrder ?? 0} disabled={disabled} placeholder="Lower numbers appear first" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="isFeatured" label="Highlight on the homepage" defaultChecked={company?.isFeatured ?? false} disabled={disabled} />
        <Toggle name="isActive" label="Visible on the website" defaultChecked={company?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label={company ? "Save partner company" : "Create partner company"} />
      </div>
    </form>
  );
}

function TeamForm({
  member,
  section,
  disabled
}: {
  member?: ManagedTeamMember;
  section: AdminSection;
  disabled: boolean;
}) {
  return (
    <form action={saveTeamMember} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={member?.id ?? ""} />
      <Field label="Name" name="name" defaultValue={member?.name} required disabled={disabled} />
      <Field label="Role" name="role" defaultValue={member?.role} required disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Image path or URL" name="imageUrl" type="text" defaultValue={member?.imageUrl} disabled={disabled} placeholder="Auto-filled after upload or paste an existing image URL" />
      </div>
      <FileField label="Upload team image" name="imageFile" disabled={disabled} />
      <TextArea label="Bio" name="bio" defaultValue={member?.bio} required disabled={disabled} />
      <Field label="Sort order" name="sortOrder" type="number" defaultValue={member?.sortOrder ?? 0} disabled={disabled} />
      <Toggle name="isActive" label="Show on website" defaultChecked={member?.isActive ?? true} disabled={disabled} />
      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label={member ? "Save team member" : "Create team member"} />
      </div>
    </form>
  );
}

function BlogForm({
  post,
  section,
  disabled
}: {
  post?: ManagedBlogPost;
  section: AdminSection;
  disabled: boolean;
}) {
  // <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" without the zone.
  const publishedAt = post?.publishedAt
    ? new Date(post.publishedAt).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  return (
    <form action={saveBlogPost} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <Field label="Post title" name="title" defaultValue={post?.title} required disabled={disabled} />
      <SlugField
        defaultValue={post?.slug}
        sourceName="title"
        basePath="/blog"
        disabled={disabled}
      />
      <Field label="Author" name="author" defaultValue={post?.author ?? ""} disabled={disabled} placeholder="Edward Trading Team" />
      <Field label="Topic" name="category" defaultValue={post?.category ?? ""} disabled={disabled} placeholder="for example: Hygiene" help="A short label shown above the title." />
      <ImageField
        label="Cover image"
        urlName="coverImageUrl"
        fileName="coverImageFile"
        defaultUrl={post?.coverImageUrl}
        disabled={disabled}
        help="Shown on the article card and when the post is shared."
      />
      <div className="md:col-span-2">
        <Field label="Cover image description" name="coverImageAlt" defaultValue={post?.coverImageAlt ?? ""} disabled={disabled} placeholder="Describe what the image shows" help="Read aloud by screen readers and used by Google to understand the image." />
      </div>
      <TextArea
        label="Preview text"
        name="excerpt"
        defaultValue={post?.excerpt ?? ""}
        rows={3}
        disabled={disabled}
        placeholder="A two line summary that makes someone want to read the article"
        help="Shown on the blog card and when the post is shared. Leave it blank and the opening of the article is used."
      />

      <RichTextEditor
        label="Article content"
        name="content"
        defaultValue={post?.content ?? ""}
        disabled={disabled}
        minHeight={460}
        helpText="The post title above is already the page H1. Inside the article, use Heading 2 for sections and Heading 3 for sub-points, bold for emphasis, the link button to hyperlink selected text, and the table button for comparison tables."
      />

      <SeoFieldset
        metaTitle={post?.metaTitle}
        metaDescription={post?.metaDescription}
        metaKeywords={post?.metaKeywords}
        disabled={disabled}
        fallbackTitle={post?.title || "Post title"}
        fallbackDescription={post?.excerpt || "The preview text above"}
        path={`/blog/${post?.slug ?? ""}`}
      />

      <Field label="Publish date" name="publishedAt" type="datetime-local" defaultValue={publishedAt} disabled={disabled} />
      <Field label="Display order" name="sortOrder" type="number" defaultValue={post?.sortOrder ?? 0} disabled={disabled} placeholder="Lower numbers appear first" />
      <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
        <Toggle name="isFeatured" label="Highlight this article" defaultChecked={post?.isFeatured ?? false} disabled={disabled} />
        <Toggle name="isActive" label="Visible on the website" defaultChecked={post?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label={post ? "Save blog post" : "Publish blog post"} />
      </div>
    </form>
  );
}

function PageForm({
  page,
  section,
  disabled
}: {
  page: CmsPage;
  section: AdminSection;
  disabled: boolean;
}) {
  return (
    <form action={savePageContent} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="slug" value={page.slug} />
      <div className="rounded-md border border-charcoal/10 bg-light-gray px-3 py-3 text-sm font-semibold text-charcoal">
        Editing: {pageLabels[page.slug]?.label || page.slug}
      </div>
      <Field label="Small label above the heading" name="eyebrow" defaultValue={page.eyebrow} disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Main heading" name="title" defaultValue={page.title} required disabled={disabled} />
      </div>
      <TextArea label="Intro paragraph" name="description" defaultValue={page.description} required disabled={disabled} />
      <ImageField
        label="Banner image"
        urlName="imageUrl"
        fileName="imageFile"
        defaultUrl={page.imageUrl}
        disabled={disabled}
      />
      {page.slug === "home-hero" ? (
        <>
          <div className="md:col-span-2">
            <Field
              label="Hero video path or URL"
              name="videoUrl"
              type="text"
              defaultValue={page.videoUrl}
              disabled={disabled}
              placeholder="Auto-filled after upload or paste an existing video URL"
            />
          </div>
          <FileField
            label="Upload hero video"
            name="videoFile"
            accept="video/*"
            disabled={disabled}
          />
        </>
      ) : (
        <input type="hidden" name="videoUrl" value={page.videoUrl} />
      )}
      <Field label="Button text" name="ctaLabel" defaultValue={page.ctaLabel} disabled={disabled} help={page.ctaHref ? `This button links to ${page.ctaHref}` : undefined} />
      <input type="hidden" name="ctaHref" value={page.ctaHref} />
      <SeoFieldset
        metaTitle={page.metaTitle}
        metaDescription={page.metaDescription}
        metaKeywords={page.metaKeywords}
        disabled={disabled}
        fallbackTitle={page.title}
        fallbackDescription={page.description}
        path={publicPathForPage(page.slug)}
      />
      <Toggle name="isActive" label="Visible on the website" defaultChecked={page.isActive} disabled={disabled} />
      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label="Save page" />
      </div>
    </form>
  );
}

function ResourceForm({
  resource,
  section,
  disabled
}: {
  resource?: CmsResource;
  section: AdminSection;
  disabled: boolean;
}) {
  return (
    <form action={saveResource} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={resource?.id ?? ""} />
      <div className="md:col-span-2">
        <Field label="Name" name="label" defaultValue={resource?.label} required disabled={disabled} help="What this detail is called inside this editor. Customers do not see it." />
      </div>
      <TextArea label="Content" name="value" defaultValue={resource?.value} rows={3} disabled={disabled} help="This is the part customers see on the website." />
      <FileField label="Upload an image instead" name="resourceFile" disabled={disabled} />
      <Field label="Display order" name="sortOrder" type="number" defaultValue={resource?.sortOrder ?? 0} disabled={disabled} placeholder="Lower numbers appear first" />
      <Toggle name="isActive" label="Visible on the website" defaultChecked={resource?.isActive ?? true} disabled={disabled} />

      {/* Identity fields decide where the value is used on the site. Editors
          almost never change them, so they stay collapsed behind a warning. */}
      <details className="rounded-md border border-charcoal/10 bg-light-gray/60 p-4 md:col-span-2">
        <summary className="cursor-pointer text-sm font-bold text-charcoal">
          Advanced placement settings
        </summary>
        <p className="mt-3 text-xs font-normal leading-6 text-slate">
          These decide where on the website this detail appears. Changing them can
          make it disappear from the page it is used on.
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Field label="Reference name" name="key" defaultValue={resource?.key} required disabled={disabled} placeholder="site.phone" />
          <Field label="Section" name="groupName" defaultValue={resource?.groupName ?? "site_settings"} required disabled={disabled} />
          <Field label="Kind" name="type" defaultValue={resource?.type ?? "text"} disabled={disabled} placeholder="text, stat, url, phone" />
          <TextArea label="Extra details" name="metadata" defaultValue={resource ? metadataToLines(resource.metadata) : ""} rows={3} disabled={disabled} placeholder="mapsUrl: https://..." />
        </div>
      </details>

      <div className="md:col-span-2">
        <StickySaveBar disabled={disabled} label={resource ? "Save changes" : "Add detail"} />
      </div>
    </form>
  );
}

function PageEditorList({
  pages,
  section,
  disabled
}: {
  pages: CmsPage[];
  section: AdminSection;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4">
      {pages.map((page) => (
        <details key={page.slug} className={panelClass}>
          <EditSummary
            eyebrow={pageLabels[page.slug]?.label || page.slug}
            title={page.title}
            meta="Edit text, image, button label, SEO, and website visibility"
            active={page.isActive}
          />
          <div className="mt-6 border-t border-charcoal/10 pt-6">
            <PageForm page={page} section={section} disabled={disabled} />
          </div>
        </details>
      ))}
    </div>
  );
}

function MissingPageNotice({ label }: { label: string }) {
  return (
    <div className="rounded-md bg-light-gray p-5 text-sm leading-7 text-slate">
      {label} content is not available yet.
    </div>
  );
}

export function AdminWorkspace({
  data,
  disabled,
  section = "overview",
  savedMessage,
  problemMessage
}: {
  data: AdminData;
  disabled: boolean;
  section?: AdminSection;
  savedMessage?: string;
  problemMessage?: string;
}) {
  const pageGroups = data.pages.reduce<Record<string, CmsPage[]>>((acc, page) => {
    const group = pageLabels[page.slug]?.group || "Other Pages";
    acc[group] = [...(acc[group] || []), page];
    return acc;
  }, {});
  const homePages = data.pages.filter((page) => page.slug.startsWith("home-"));
  const aboutPage = getPage(data, "about");
  const solutionsPage = getPage(data, "solutions");
  const industriesPage = getPage(data, "industries");
  const partnerCompaniesPage = getPage(data, "partner-companies");
  const contactPage = getPage(data, "contact");
  const blogPage = getPage(data, "blog");
  const contactResources = data.resources.filter(
    (resource) => resource.groupName === "site_settings"
  );
  const newInquiries = data.submissions.filter(
    (submission) => submission.status === "new"
  ).length;
  const sectionCounts: Partial<Record<AdminSection, number>> = {
    solutions: data.categories.length,
    "partner-companies": data.companies.length,
    products: data.products.length,
    blog: data.blogPosts.length,
    inquiries: newInquiries
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-lg border border-charcoal/10 bg-white p-3 shadow-sm">
          {adminSections
            .filter((item) => visibleAdminSections.has(item.section))
            .map((item) => {
              const count = sectionCounts[item.section];
              const isCurrent = section === item.section;

              return (
                <a
                  key={item.section}
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-primary/10 hover:text-primary ${
                    isCurrent ? "bg-primary/10 text-primary" : "text-charcoal/72"
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof count === "number" ? (
                    <span
                      className={`inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        item.section === "inquiries" && count > 0
                          ? "bg-primary text-white"
                          : "bg-charcoal/8 text-charcoal/60"
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </a>
              );
            })}
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-charcoal/10 bg-white px-3 py-2.5 text-sm font-bold text-charcoal shadow-sm transition hover:border-primary hover:text-primary"
        >
          <ExternalLink aria-hidden className="h-4 w-4" />
          Open website
        </a>
      </aside>

      <div className="grid gap-6">
        <ProblemNotice message={problemMessage} />
        <SavedNotice message={savedMessage} />
        {section === "overview" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="overview-heading"
            icon={Database}
            eyebrow="Overview"
            title="Your website at a glance"
            description="The tabs on the left match your website's menu. Pick a tab to edit the words, photos, and items that appear on that part of the site."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Categories", count: data.categories.length, href: "/admin/solutions" },
              { label: "Products", count: data.products.length, href: "/admin/products" },
              { label: "Brands", count: data.companies.length, href: "/admin/partner-companies" },
              { label: "Articles", count: data.blogPosts.length, href: "/admin/blog" },
              { label: "New enquiries", count: newInquiries, href: "/admin/inquiries" },
              { label: "Pages", count: data.pages.length, href: "/admin/home" }
            ].map((tile) => (
              <a
                key={tile.label}
                href={tile.href}
                className="group rounded-md border border-charcoal/10 bg-light-gray p-5 transition hover:border-primary/40 hover:bg-white hover:shadow-sm"
              >
                <p className="font-heading text-3xl font-extrabold text-primary">
                  {tile.count}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-charcoal">
                  {tile.label}
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </p>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-charcoal/10 bg-white p-5">
            <h3 className="font-heading text-lg font-bold text-charcoal">
              Getting started
            </h3>
            <ul className="mt-3 grid gap-2 text-sm leading-7 text-slate">
              <li>
                Pick a tab on the left. Each one matches a part of your website.
              </li>
              <li>
                Click any item to open it, make your change, then press the save
                button at the bottom of the form.
              </li>
              <li>
                Changes appear on the website straight away. Use &quot;View on
                website&quot; to check.
              </li>
              <li>
                Every editor has a &quot;How this appears in Google&quot; section.
                Leave it blank and sensible wording is used automatically.
              </li>
            </ul>
          </div>
        </section>
        ) : null}

        {section === "home" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="home"
            icon={Home}
            eyebrow="Website Section"
            title="Home"
            description="Edit each section of your homepage, from the top banner down to the closing call to action."
          />
          {homePages.length > 0 ? (
            <PageEditorList pages={homePages} section="home" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Home" />
          )}
        </section>
        ) : null}

        {section === "about" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="about"
            icon={UsersRound}
            eyebrow="Website Section"
            title="About"
            description="Edit your About page and the people shown on it."
          />
          {aboutPage ? (
            <PageEditorList pages={[aboutPage]} section="about" disabled={disabled} />
          ) : (
            <MissingPageNotice label="About page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Add a team member"
                description="Add a person to your About page."
                icon={UsersRound}
              />
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <TeamForm section="about" disabled={disabled} />
              </div>
            </details>
            {data.teamMembers.map((member) => (
              <details key={member.id} className={panelClass}>
                <EditSummary
                  eyebrow="Team member"
                  title={member.name}
                  meta={member.role}
                  active={member.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <TeamForm member={member} section="about" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="team_members" id={member.id} returnTo="/admin/about" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "solutions" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="solutions"
            icon={Layers3}
            eyebrow="Website Section"
            title="Solutions"
            description="Edit the Solutions page and the product categories shown on it."
          />
          {solutionsPage ? (
            <PageEditorList pages={[solutionsPage]} section="solutions" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Solutions page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Add a category"
                description="Groups your products and gets its own page."
                icon={Layers3}
              />
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <CategoryForm section="solutions" disabled={disabled} />
              </div>
            </details>
            {data.categories.map((category) => (
              <details key={category.id} className={panelClass}>
                <EditSummary
                  eyebrow="Product category"
                  title={category.name}
                  meta={category.slug}
                  active={category.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <CategoryForm category={category} section="solutions" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="product_categories" id={category.id} returnTo="/admin/solutions" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "industries" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="industries"
            icon={Globe2}
            eyebrow="Website Section"
            title="Areas We Serve"
            description="Edit the Areas We Serve page."
          />
          {industriesPage ? (
            <PageEditorList pages={[industriesPage]} section="industries" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Areas We Serve page" />
          )}
        </section>
        ) : null}

        {section === "partner-companies" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="partner-companies"
            icon={Sparkles}
            eyebrow="Website Section"
            title="Partner Companies"
            description="Edit the brands page, and give each brand its own page with content and common questions that help it show up in Google."
          />
          {partnerCompaniesPage ? (
            <PageEditorList pages={[partnerCompaniesPage]} section="partner-companies" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Partner Companies page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Add a brand"
                description="Logo, page content, common questions, and the search wording for this brand."
                icon={Sparkles}
              />
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <CompanyForm section="partner-companies" disabled={disabled} />
              </div>
            </details>

            <div>
              <ListFilter targetId="partner-list" placeholder="Search brands by name" noun="brands" />
              <div id="partner-list" className="grid gap-4">
                {data.companies.length === 0 ? (
                  <EmptyState message="No brands yet. Use the button above to add your first one." />
                ) : null}
                {data.companies.map((company) => (
                  <details
                    key={company.id}
                    data-search={`${company.name} ${company.slug} ${company.territory ?? ""}`}
                    className={panelClass}
                  >
                    <EditSummary
                      eyebrow={resolveCompanyPresentation(company).eyebrow}
                      title={company.name}
                      meta={`${productCountForCompany(data, company.slug)} products`}
                      active={company.isActive}
                    />
                    <div className="mt-6 border-t border-charcoal/10 pt-6">
                      <CompanyForm company={company} section="partner-companies" disabled={disabled} />
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <ViewOnSite path={`/partner-companies/${company.slug}`} />
                        <ArchiveButton table="associated_companies" id={company.id} returnTo="/admin/partner-companies" disabled={disabled} noun="brand" />
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {section === "contact" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="contact"
            icon={Mail}
            eyebrow="Website Section"
            title="Contact"
            description="Edit the Contact page and your phone number, email, address, and map link."
          />
          {contactPage ? (
            <PageEditorList pages={[contactPage]} section="contact" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Contact page" />
          )}
          <div className="mt-6 grid gap-4">
            {contactResources.map((resource) => (
              <details key={resource.key} className={panelClass}>
                <EditSummary
                  eyebrow="Contact detail"
                  title={resource.label}
                  meta={resource.key}
                  active={resource.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <ResourceForm resource={resource} section="contact" disabled={disabled} />
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "pages" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="pages"
            icon={FileText}
            eyebrow="Website Pages"
            title="All pages"
            description="Every page and homepage section has its own editor for text, images, buttons, and how it appears in Google."
          />
          <div className="grid gap-6">
            {Object.entries(pageGroups).map(([group, pages]) => (
              <div key={group} className="grid gap-4">
                <h3 className="font-heading text-2xl font-extrabold text-charcoal">
                  {group}
                </h3>
                <div className="grid gap-4">
                  {pages.map((page) => (
                    <details key={page.slug} className={panelClass}>
                      <EditSummary
                        eyebrow={pageLabels[page.slug]?.label || page.slug}
                        title={page.title}
                        meta={page.slug}
                        active={page.isActive}
                      />
                      <div className="mt-6 border-t border-charcoal/10 pt-6">
                        <PageForm page={page} section="pages" disabled={disabled} />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {section === "resources" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="resources"
            icon={Layers3}
            eyebrow="Reusable Content"
            title="Contact and reusable content"
            description="Small pieces of text and numbers reused around the site. Phone, email, and address are easier to edit from the Contact tab."
          />
          <details className={panelClass}>
            <AddSummary
              title="Add a reusable detail"
              description="A number, label, link, or image used in more than one place."
              icon={Layers3}
            />
            <div className="mt-6 border-t border-charcoal/10 pt-6">
              <ResourceForm section="resources" disabled={disabled} />
            </div>
          </details>
          <div className="mt-4 grid gap-4">
            {data.resources.map((resource) => (
              <details key={resource.key} className={panelClass}>
                <EditSummary
                  eyebrow={resource.groupName}
                  title={resource.label}
                  meta={resource.key}
                  active={resource.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <ResourceForm resource={resource} section="resources" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="cms_resources" id={resource.id} returnTo="/admin/resources" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "categories" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="categories"
            icon={Layers3}
            eyebrow="Products"
            title="Categories"
            description="Group your products. Each category gets its own page listing everything inside it."
          />
          <details className={panelClass}>
            <AddSummary
              title="Add a category"
              description="Groups your products and gets its own page."
              icon={Layers3}
            />
            <div className="mt-6 border-t border-charcoal/10 pt-6">
              <CategoryForm section="categories" disabled={disabled} />
            </div>
          </details>
          <div className="mt-4 grid gap-4">
            {data.categories.map((category) => (
              <details key={category.id} className={panelClass}>
                <EditSummary
                  eyebrow="Category"
                  title={category.name}
                  meta={category.slug}
                  active={category.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <CategoryForm category={category} section="categories" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="product_categories" id={category.id} returnTo="/admin/categories" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "products" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="products"
            icon={Package}
            eyebrow="Products"
            title="Products"
            description="Add products, edit their photos, features, and specifications, and control which ones appear on the website."
          />
          <details className={panelClass}>
            <AddSummary
              title="Add a product"
              description="Set the category, brand, photo, features, and search wording."
              icon={Package}
            />
            <div className="mt-6 border-t border-charcoal/10 pt-6">
              <ProductForm
                categories={data.categories}
                companies={data.companies}
                section="products"
                disabled={disabled}
              />
            </div>
          </details>
          <div className="mt-6">
            <ListFilter targetId="product-list" placeholder="Search products by name" noun="products" />
            <div id="product-list" className="grid gap-4">
              {data.products.length === 0 ? (
                <EmptyState message="No products yet. Use the button above to add your first one." />
              ) : null}
              {data.products.map((product) => (
                <details
                  key={product.id}
                  data-search={`${product.name} ${product.slug} ${product.categorySlug} ${product.companySlug ?? ""}`}
                  className={panelClass}
                >
                  <EditSummary
                    eyebrow="Product"
                    title={product.name}
                    meta={`${categoryName(data, product.categorySlug)} / ${companyName(data, product.companySlug)}`}
                    active={product.isActive}
                  />
                  <div className="mt-6 border-t border-charcoal/10 pt-6">
                    <ProductForm
                      product={product}
                      categories={data.categories}
                      companies={data.companies}
                      section="products"
                      disabled={disabled}
                    />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <ViewOnSite path={`/products/${product.slug}`} />
                      <ArchiveButton table="products" id={product.id} returnTo="/admin/products" disabled={disabled} noun="product" />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        {section === "companies" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="companies"
            icon={Sparkles}
            eyebrow="Partners"
            title="Partner Companies"
            description="Manage brand names, logos, page content, and how each brand page is found in Google."
          />
          <details className={panelClass}>
            <AddSummary
              title="Add a brand"
              description="Logo, page content, and the search wording for this brand."
              icon={Sparkles}
            />
            <div className="mt-6 border-t border-charcoal/10 pt-6">
              <CompanyForm section="companies" disabled={disabled} />
            </div>
          </details>
          <div className="mt-4 grid gap-4">
            {data.companies.map((company) => (
              <details key={company.id} className={panelClass}>
                <EditSummary
                  eyebrow="Partner company"
                  title={company.name}
                  meta={company.slug}
                  active={company.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <CompanyForm company={company} section="companies" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="associated_companies" id={company.id} returnTo="/admin/companies" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "team" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="team"
            icon={UsersRound}
            eyebrow="People"
            title="Team members"
            description="The people shown on your About page."
          />
          <details className={panelClass}>
            <AddSummary
              title="Add a team member"
              description="Add a person to your About page."
              icon={UsersRound}
            />
            <div className="mt-6 border-t border-charcoal/10 pt-6">
              <TeamForm section="team" disabled={disabled} />
            </div>
          </details>
          <div className="mt-4 grid gap-4">
            {data.teamMembers.map((member) => (
              <details key={member.id} className={panelClass}>
                <EditSummary
                  eyebrow="Team member"
                  title={member.name}
                  meta={member.role}
                  active={member.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <TeamForm member={member} section="team" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="team_members" id={member.id} returnTo="/admin/team" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "blog" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="blog"
            icon={Newspaper}
            eyebrow="Website Section"
            title="Blog"
            description="Write and publish articles. Each one gets a cover image, preview text, and its own wording for Google."
          />
          {blogPage ? (
            <PageEditorList pages={[blogPage]} section="blog" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Blog listing page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Write an article"
                description="Headings, bold text, tables, links, a cover image, and Google wording."
                icon={Newspaper}
              />
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <BlogForm section="blog" disabled={disabled} />
              </div>
            </details>

            <div>
              <ListFilter targetId="blog-list" placeholder="Search articles by title" noun="articles" />
              <div id="blog-list" className="grid gap-4">
                {data.blogPosts.length === 0 ? (
                  <EmptyState message="No articles yet. Use the button above to write your first one." />
                ) : null}
                {data.blogPosts.map((post) => (
                  <details
                    key={post.id}
                    data-search={`${post.title} ${post.slug} ${post.category} ${post.author}`}
                    className={panelClass}
                  >
                    <EditSummary
                      eyebrow={post.category || "Article"}
                      title={post.title}
                      meta={formatPublishedDate(post.publishedAt) || undefined}
                      active={post.isActive}
                    />
                    <div className="mt-6 border-t border-charcoal/10 pt-6">
                      <BlogForm post={post} section="blog" disabled={disabled} />
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <ViewOnSite path={`/blog/${post.slug}`} label="Read on website" />
                        <ArchiveButton table="blog_posts" id={post.id} returnTo="/admin/blog" disabled={disabled} noun="article" />
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {section === "inquiries" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="inquiries"
            icon={Mail}
            eyebrow="Inbox"
            title="Contact inquiries"
            description="Every enquiry sent through the website, with the sender's details, their message, and a status you can update."
          />
          <div className="grid gap-4">
            {data.submissions.length === 0 ? (
              <div className="rounded-md bg-light-gray p-5 text-sm leading-7 text-slate">
                No inquiries yet.
              </div>
            ) : (
              data.submissions.map((submission) => (
                <article key={submission.id} className={panelClass}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-charcoal">
                        {submission.name || "Unnamed inquiry"}
                      </h3>
                      <p className="mt-1 text-sm text-slate">
                        {submission.organization}
                      </p>
                    </div>
                    <form action={updateSubmissionStatus} className="flex gap-2">
                      <input type="hidden" name="returnTo" value="/admin/inquiries" />
                      <input type="hidden" name="id" value={submission.id} />
                      <select name="status" defaultValue={submission.status} className={inputClass}>
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="closed">Closed</option>
                      </select>
                      <SaveButton disabled={disabled} label="Update" />
                    </form>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-md bg-light-gray p-4 text-sm font-semibold text-charcoal md:grid-cols-3">
                    {submission.email ? (
                      <a href={`mailto:${submission.email}`} className="break-all hover:text-primary">
                        {submission.email}
                      </a>
                    ) : (
                      <span>No email provided</span>
                    )}
                    {submission.phone ? (
                      <a href={`tel:${submission.phone}`} className="hover:text-primary">
                        {submission.phone}
                      </a>
                    ) : (
                      <span>No phone provided</span>
                    )}
                    <span>Status: {submission.status}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate">{submission.message}</p>
                  {submission.productName ? (
                    <p className="mt-3 text-sm font-bold text-charcoal">
                      Product: {submission.productName}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    {submission.interest || "General inquiry"} / {submission.createdAt}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
        ) : null}

        {section === "access" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="access"
            icon={KeyRound}
            eyebrow="Security"
            title="Admin access"
            description="Add a login for a team member, or change an existing password."
          />
          <form action={saveAdminUser} className="grid gap-5 md:grid-cols-2">
            <input type="hidden" name="returnTo" value="/admin/access" />
            <Field label="Full name" name="name" defaultValue="Edward Trading Admin" disabled={disabled} />
            <Field label="Email address" name="email" type="email" required disabled={disabled} help="This is the email they will log in with." />
            <div className="md:col-span-2">
              <Field label="New password" name="password" type="password" required disabled={disabled} />
            </div>
            <div className="md:col-span-2">
              <SaveButton disabled={disabled} label="Save login" />
            </div>
          </form>
        </section>
        ) : null}
      </div>
    </div>
  );
}
