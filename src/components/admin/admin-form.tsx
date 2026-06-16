import {
  CheckCircle2,
  CirclePlus,
  Database,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Home,
  KeyRound,
  Layers3,
  Mail,
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
  saveProductCategory,
  saveResource,
  saveTeamMember,
  updateSubmissionStatus
} from "@/app/admin/actions";
import { SaveButton, SavedNotice } from "@/components/admin/form-submit";
import type {
  CmsPage,
  CmsResource,
  ContactSubmission,
  ManagedCategory,
  ManagedCompany,
  ManagedProduct,
  ManagedTeamMember
} from "@/lib/cms-data";

type AdminData = {
  categories: ManagedCategory[];
  products: ManagedProduct[];
  companies: ManagedCompany[];
  teamMembers: ManagedTeamMember[];
  pages: CmsPage[];
  resources: CmsResource[];
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
  contact: { group: "Public Pages", label: "Contact page" }
};

const inputClass =
  "min-h-11 w-full rounded-md border border-charcoal/12 bg-light-gray px-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
const textareaClass =
  "w-full rounded-md border border-charcoal/12 bg-light-gray px-3 py-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "grid gap-2 text-sm font-semibold text-charcoal";
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
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
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
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
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
  disabled
}: {
  table: string;
  id: string;
  returnTo: string;
  disabled?: boolean;
}) {
  return (
    <form action={archiveRecord}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <EyeOff aria-hidden className="h-4 w-4" />
        Hide from website
      </button>
    </form>
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
      <Field label="Slug" name="slug" defaultValue={category?.slug} disabled={disabled} placeholder="auto-generated if blank" />
      <div className="md:col-span-2">
        <Field label="Image path or URL" name="imageUrl" type="text" defaultValue={category?.imageUrl} disabled={disabled} placeholder="Auto-filled after upload or paste an existing image URL" />
      </div>
      <FileField label="Upload category image" name="imageFile" disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Short summary" name="summary" defaultValue={category?.summary} required disabled={disabled} />
      </div>
      <TextArea label="Description" name="description" defaultValue={category?.description} required disabled={disabled} />
      <Field label="Sort order" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} disabled={disabled} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="isFeatured" label="Feature on website" defaultChecked={category?.isFeatured ?? true} disabled={disabled} />
        <Toggle name="isActive" label="Show on website" defaultChecked={category?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <SaveButton disabled={disabled} label={category ? "Save category" : "Create category"} />
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
      <Field label="Slug" name="slug" defaultValue={product?.slug} disabled={disabled} placeholder="auto-generated if blank" />
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
      <div className="md:col-span-2">
        <Field label="Image path or URL" name="imageUrl" type="text" defaultValue={product?.imageUrl} disabled={disabled} placeholder="Auto-filled after upload or paste an existing image URL" />
      </div>
      <div className="md:col-span-2">
        <Field label="YouTube video URL" name="youtubeUrl" type="url" defaultValue={product?.youtubeUrl} disabled={disabled} placeholder="Optional product video link" />
      </div>
      <FileField label="Upload product image" name="imageFile" disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Short description" name="shortDescription" defaultValue={product?.shortDescription} required disabled={disabled} />
      </div>
      <TextArea label="Full description" name="description" defaultValue={product?.description} required disabled={disabled} />
      <TextArea label="Features" name="features" defaultValue={product?.features.join("\n")} rows={5} disabled={disabled} placeholder="One feature per line" />
      <TextArea label="Specifications" name="specifications" defaultValue={product ? specsToLines(product.specifications) : ""} rows={5} disabled={disabled} placeholder="Category: Cleaning chemical" />
      <Field label="Sort order" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} disabled={disabled} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="isFeatured" label="Feature on website" defaultChecked={product?.isFeatured ?? false} disabled={disabled} />
        <Toggle name="isActive" label="Show on website" defaultChecked={product?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <SaveButton disabled={disabled} label={product ? "Save product" : "Create product"} />
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
  return (
    <form action={saveAssociatedCompany} className="grid gap-5 md:grid-cols-2">
      {hiddenReturnInput(section)}
      <input type="hidden" name="id" value={company?.id ?? ""} />
      <Field label="Partner company name" name="name" defaultValue={company?.name} required disabled={disabled} />
      <Field label="Slug" name="slug" defaultValue={company?.slug} disabled={disabled} placeholder="auto-generated if blank" />
      <div className="md:col-span-2">
        <Field label="Logo URL" name="logoUrl" type="text" defaultValue={company?.logoUrl} disabled={disabled} placeholder="Auto-filled after upload or paste an existing image URL" />
      </div>
      <FileField label="Upload logo" name="logoFile" disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Short summary" name="summary" defaultValue={company?.summary ?? ""} disabled={disabled} />
      </div>
      <TextArea label="Description" name="description" defaultValue={company?.description ?? ""} disabled={disabled} />
      <Field label="Website URL" name="websiteUrl" type="url" defaultValue={company?.websiteUrl ?? ""} disabled={disabled} />
      <Field label="Sort order" name="sortOrder" type="number" defaultValue={company?.sortOrder ?? 0} disabled={disabled} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle name="isFeatured" label="Feature on website" defaultChecked={company?.isFeatured ?? false} disabled={disabled} />
        <Toggle name="isActive" label="Show on website" defaultChecked={company?.isActive ?? true} disabled={disabled} />
      </div>
      <div className="md:col-span-2">
        <SaveButton disabled={disabled} label={company ? "Save partner company" : "Create partner company"} />
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
        <SaveButton disabled={disabled} label={member ? "Save team member" : "Create team member"} />
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
      <Field label="Eyebrow" name="eyebrow" defaultValue={page.eyebrow} disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Title" name="title" defaultValue={page.title} required disabled={disabled} />
      </div>
      <TextArea label="Description" name="description" defaultValue={page.description} required disabled={disabled} />
      <div className="md:col-span-2">
        <Field label="Hero image path or URL" name="imageUrl" type="text" defaultValue={page.imageUrl} disabled={disabled} placeholder="Auto-filled after upload or paste an existing image URL" />
      </div>
      <FileField label="Upload hero image" name="imageFile" disabled={disabled} />
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
      <Field label="CTA label" name="ctaLabel" defaultValue={page.ctaLabel} disabled={disabled} />
      <input type="hidden" name="ctaHref" value={page.ctaHref} />
      <Field label="Meta title" name="metaTitle" defaultValue={page.metaTitle} disabled={disabled} />
      <Field label="Meta description" name="metaDescription" defaultValue={page.metaDescription} disabled={disabled} />
      <Toggle name="isActive" label="Show on website" defaultChecked={page.isActive} disabled={disabled} />
      <div>
        <SaveButton disabled={disabled} label="Save page content" />
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
      <Field label="Resource key" name="key" defaultValue={resource?.key} required disabled={disabled} placeholder="group.item.name" />
      <Field label="Label" name="label" defaultValue={resource?.label} required disabled={disabled} />
      <Field label="Group" name="groupName" defaultValue={resource?.groupName ?? "site_settings"} required disabled={disabled} />
      <Field label="Type" name="type" defaultValue={resource?.type ?? "text"} disabled={disabled} placeholder="text, stat, url, phone" />
      <TextArea label="Value" name="value" defaultValue={resource?.value} rows={3} disabled={disabled} />
      <FileField label="Upload resource image" name="resourceFile" disabled={disabled} />
      <TextArea label="Metadata" name="metadata" defaultValue={resource ? metadataToLines(resource.metadata) : ""} rows={3} disabled={disabled} placeholder="mapsUrl: https://..." />
      <Field label="Sort order" name="sortOrder" type="number" defaultValue={resource?.sortOrder ?? 0} disabled={disabled} />
      <Toggle name="isActive" label="Show on website" defaultChecked={resource?.isActive ?? true} disabled={disabled} />
      <div className="md:col-span-2">
        <SaveButton disabled={disabled} label={resource ? "Save resource" : "Create resource"} />
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
  savedMessage
}: {
  data: AdminData;
  disabled: boolean;
  section?: AdminSection;
  savedMessage?: string;
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
  const contactResources = data.resources.filter(
    (resource) => resource.groupName === "site_settings"
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-lg border border-charcoal/10 bg-white p-3 shadow-sm">
          {adminSections.filter((item) => visibleAdminSections.has(item.section)).map((item) => (
            <a
              key={item.section}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-primary/10 hover:text-primary ${
                section === item.section
                  ? "bg-primary/10 text-primary"
                  : "text-charcoal/72"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </aside>

      <div className="grid gap-6">
        <SavedNotice message={savedMessage} />
        {section === "overview" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="overview-heading"
            icon={Database}
            eyebrow="Workspace"
            title="Website content dashboard"
            description="Use the tabs on the left like the website navigation. The site structure is built in code; this CMS only edits content, catalog records, visibility, and inquiries."
          />
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["Pages", data.pages.length],
              ["Categories", data.categories.length],
              ["Products", data.products.length],
              ["Partner Companies", data.companies.length],
              ["Inquiries", data.submissions.length]
            ].map(([label, count]) => (
              <div key={label} className="rounded-md bg-light-gray p-5">
                <p className="font-heading text-3xl font-extrabold text-primary">
                  {count}
                </p>
                <p className="mt-2 text-sm font-bold text-charcoal">{label}</p>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {section === "home" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="home"
            icon={Home}
            eyebrow="Website Tab"
            title="Home"
            description="Edit the homepage sections that already exist in the website skeleton."
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
            eyebrow="Website Tab"
            title="About"
            description="Edit About page content and the team members shown on the website."
          />
          {aboutPage ? (
            <PageEditorList pages={[aboutPage]} section="about" disabled={disabled} />
          ) : (
            <MissingPageNotice label="About page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Create team member"
                description="Add a person to the About page team section."
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
            eyebrow="Website Tab"
            title="Solutions"
            description="Edit the Solutions page content and manage product categories shown on the public site."
          />
          {solutionsPage ? (
            <PageEditorList pages={[solutionsPage]} section="solutions" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Solutions page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Create category"
                description="Add a product category that appears on the public Solutions page."
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
            eyebrow="Website Tab"
            title="Areas We Serve"
            description="Edit the public Areas We Serve page content."
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
            eyebrow="Website Tab"
            title="Partner Companies"
            description="Edit the Partner Companies page and manage logos, pages, and website visibility for each partner company."
          />
          {partnerCompaniesPage ? (
            <PageEditorList pages={[partnerCompaniesPage]} section="partner-companies" disabled={disabled} />
          ) : (
            <MissingPageNotice label="Partner Companies page" />
          )}
          <div className="mt-6 grid gap-4">
            <details className={panelClass}>
              <AddSummary
                title="Create partner company"
                description="Add a partner logo, company page copy, and website link."
                icon={Sparkles}
              />
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <CompanyForm section="partner-companies" disabled={disabled} />
              </div>
            </details>
            {data.companies.map((company) => (
              <details key={company.id} className={panelClass}>
                <EditSummary
                  eyebrow="Partner company"
                  title={company.name}
                  meta={company.slug}
                  active={company.isActive}
                />
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <CompanyForm company={company} section="partner-companies" disabled={disabled} />
                  <div className="mt-4">
                    <ArchiveButton table="associated_companies" id={company.id} returnTo="/admin/partner-companies" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        ) : null}

        {section === "contact" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="contact"
            icon={Mail}
            eyebrow="Website Tab"
            title="Contact"
            description="Edit the Contact page and the public phone, email, address, and map details."
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
            eyebrow="CMS Pages"
            title="Site pages"
            description="Each public page and homepage section has its own editor, so text, images, buttons, and metadata stay easy to find."
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
            description="Manage content snippets used by the coded website skeleton. Most contact details are easier to edit from the Contact tab."
          />
          <details className={panelClass}>
            <AddSummary
              title="Create resource"
              description="Add a setting, reusable label, stat, URL, or image resource."
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
            eyebrow="Catalog"
            title="Categories"
            description="Create and update product categories. Public category cards and category product pages are generated from these records."
          />
          <details className={panelClass}>
            <AddSummary
              title="Create category"
              description="Add a product category that appears on the public site."
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
            eyebrow="Catalog"
            title="Products"
            description="Create and update product cards, detail pages, features, specifications, and category placement."
          />
          <details className={panelClass}>
            <AddSummary
              title="Create product"
              description="Add a product with category, partner company, features, and video."
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
          <div className="mt-4 grid gap-4">
            {data.products.map((product) => (
              <details key={product.id} className={panelClass}>
                <EditSummary
                  eyebrow="Product"
                  title={product.name}
                  meta={`${product.categorySlug} / ${product.companySlug || "No partner"}`}
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
                  <div className="mt-4">
                    <ArchiveButton table="products" id={product.id} returnTo="/admin/products" disabled={disabled} />
                  </div>
                </div>
              </details>
            ))}
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
            description="Manage partner company names, logos, websites, sort order, visibility, and copy for partner product pages."
          />
          <details className={panelClass}>
            <AddSummary
              title="Create partner company"
              description="Add a partner logo, company page copy, and website link."
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
            description="Control the team section shown on the About page."
          />
          <details className={panelClass}>
            <AddSummary
              title="Create team member"
              description="Add a person to the About page team section."
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

        {section === "inquiries" ? (
        <section className={sectionClass}>
          <SectionHeader
            id="inquiries"
            icon={Mail}
            eyebrow="Inbox"
            title="Contact inquiries"
            description="Every public contact form submission is stored here with contact details, interest, message, timestamp, and tracking status."
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
            description="Create or rotate a database-backed admin user. Environment password login remains available for recovery."
          />
          <form action={saveAdminUser} className="grid gap-5 md:grid-cols-2">
            <input type="hidden" name="returnTo" value="/admin/access" />
            <Field label="Admin name" name="name" defaultValue="Edward Trading Admin" disabled={disabled} />
            <Field label="Admin email" name="email" type="email" required disabled={disabled} />
            <div className="md:col-span-2">
              <Field label="New password" name="password" type="password" required disabled={disabled} />
            </div>
            <div className="md:col-span-2">
              <SaveButton disabled={disabled} label="Save admin user" />
            </div>
          </form>
        </section>
        ) : null}
      </div>
    </div>
  );
}
