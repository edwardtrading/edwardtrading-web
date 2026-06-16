"use server";

import {
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual
} from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabaseClient, hasDatabaseConfig } from "@/lib/database";

const adminCookieName = "edward_trading_admin";
const sessionMaxAge = 60 * 60 * 8;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function activeValue(formData: FormData) {
  return formData.get("isActive") ? 1 : 0;
}

function redirectToSaved(formData: FormData, message = "Changes saved and published.") {
  const returnTo = clean(formData.get("returnTo")) || "/admin";
  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}saved=${encodeURIComponent(message)}`);
}

function linesToJson(value: FormDataEntryValue | null) {
  const items = String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return JSON.stringify(items);
}

function specsToJson(value: FormDataEntryValue | null) {
  const specs = String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const [key, ...rest] = item.split(":");
      if (key && rest.length > 0) {
        acc[key.trim()] = rest.join(":").trim();
      }
      return acc;
    }, {});

  return JSON.stringify(specs);
}

function metadataToJson(value: FormDataEntryValue | null) {
  return specsToJson(value);
}

async function saveUpload(
  value: FormDataEntryValue | null,
  folder: string,
  fallbackName: string
) {
  if (!(value instanceof File) || value.size === 0) {
    return "";
  }

  const extension = path.extname(value.name).toLowerCase() || ".webp";
  const safeName = slugify(fallbackName) || "asset";
  const fileName = `${safeName}-${Date.now()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  const buffer = Buffer.from(await value.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${folder}/${fileName}`;
}

function requireDatabase() {
  if (!hasDatabaseConfig()) {
    throw new Error("The production content service is not configured.");
  }

  return getDatabaseClient();
}

async function ensureProductCategoriesTable() {
  const db = requireDatabase();
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

async function ensureProductEnhancementColumns() {
  const db = requireDatabase();

  for (const sql of [
    "ALTER TABLE products ADD COLUMN youtube_url TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE contact_submissions ADD COLUMN product_slug TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE contact_submissions ADD COLUMN product_name TEXT NOT NULL DEFAULT ''"
  ]) {
    try {
      await db.execute({ sql, args: [] });
    } catch {
      // Existing databases may already have these columns.
    }
  }
}

async function ensureCmsPageVideoColumn() {
  const db = requireDatabase();

  try {
    await db.execute({
      sql: "ALTER TABLE cms_pages ADD COLUMN video_url TEXT NOT NULL DEFAULT ''",
      args: []
    });
  } catch {
    // Existing databases may already have this column.
  }
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is required for admin sessions.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function createSessionCookie(email: string, role: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + sessionMaxAge
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function readSessionCookie() {
  const cookie = cookies().get(adminCookieName)?.value;

  if (!cookie) {
    return null;
  }

  const [payload, signature] = cookie.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email?: string; role?: string; exp?: number };

    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${derived}`;
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function verifyPassword(password: string, stored: string) {
  const [scheme, iterations, salt, hash] = stored.split("$");

  if (scheme === "pbkdf2_sha256" && iterations && salt && hash) {
    const derived = pbkdf2Sync(
      password,
      salt,
      Number(iterations),
      32,
      "sha256"
    ).toString("hex");
    return safeCompare(derived, hash);
  }

  return safeCompare(password, stored);
}

async function authenticateFromDatabase(email: string, password: string) {
  if (!hasDatabaseConfig() || !email) {
    return null;
  }

  try {
    const db = getDatabaseClient();
    const result = await db.execute({
      sql: "SELECT * FROM admin_users WHERE lower(email) = lower(?) AND is_active = 1 LIMIT 1",
      args: [email]
    });
    const user = result.rows[0] as Record<string, unknown> | undefined;

    if (!user || !verifyPassword(password, String(user.password_hash ?? ""))) {
      return null;
    }

    await db.execute({
      sql: "UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [String(user.id)]
    });

    return {
      email: String(user.email),
      role: String(user.role ?? "admin")
    };
  } catch {
    return null;
  }
}

async function requireAdmin() {
  const session = readSessionCookie();

  if (!session?.email) {
    throw new Error("Admin authentication is required.");
  }

  return session;
}

function setAdminCookie(email: string, role = "admin") {
  cookies().set(adminCookieName, createSessionCookie(email, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin"
  });
}

function redirectToAdminSession(formData: FormData) {
  const returnTo = clean(formData.get("returnTo")) || "/admin";
  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}admin_login=1`);
}

function revalidateCmsPaths() {
  [
    "/",
    "/about",
    "/partner-companies",
    "/solutions",
    "/categories",
    "/cleaning-solutions",
    "/surgical-instruments",
    "/industries",
    "/contact",
    "/admin",
    "/admin/pages",
    "/admin/resources",
    "/admin/categories",
    "/admin/products",
    "/admin/companies",
    "/admin/team",
    "/admin/inquiries",
    "/admin/access"
  ].forEach((path) => revalidatePath(path));
}

export async function loginAdmin(formData: FormData) {
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));

  const databaseUser = await authenticateFromDatabase(email, password);

  if (databaseUser) {
    setAdminCookie(databaseUser.email, databaseUser.role);
    revalidatePath("/admin");
    redirectToAdminSession(formData);
  }

  const expected = process.env.ADMIN_PASSWORD;
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !expected ||
    !email ||
    (expectedEmail && email !== expectedEmail) ||
    !verifyPassword(password, expected)
  ) {
    return;
  }

  setAdminCookie(email);
  revalidatePath("/admin");
  revalidatePath("/admin/access");
  redirectToAdminSession(formData);
}

export async function logoutAdmin() {
  cookies().set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/admin"
  });
  revalidatePath("/admin");
}

export async function isAdminLoggedIn() {
  return Boolean(readSessionCookie()?.email);
}

export async function saveAdminUser(formData: FormData) {
  await requireAdmin();
  const db = requireDatabase();
  const email = clean(formData.get("email")).toLowerCase();
  const name = clean(formData.get("name")) || "Edward Trading Admin";
  const password = clean(formData.get("password"));

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  await db.execute({
    sql: `INSERT INTO admin_users (
      id, email, name, password_hash, role, is_active
    ) VALUES (?, ?, ?, ?, 'admin', 1)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      password_hash = excluded.password_hash,
      updated_at = CURRENT_TIMESTAMP`,
    args: [crypto.randomUUID(), email, name, hashPassword(password)]
  });

  revalidatePath("/admin");
  revalidatePath("/admin/access");
}

export async function savePageContent(formData: FormData) {
  await requireAdmin();
  await ensureCmsPageVideoColumn();
  const db = requireDatabase();
  const slug = slugify(clean(formData.get("slug")));
  const uploadedImage = await saveUpload(formData.get("imageFile"), "pages", slug);
  const uploadedVideo = await saveUpload(
    formData.get("videoFile"),
    "page-videos",
    slug
  );
  const imageUrl = uploadedImage || clean(formData.get("imageUrl"));
  const videoUrl = uploadedVideo || clean(formData.get("videoUrl"));

  await db.execute({
    sql: `INSERT INTO cms_pages (
      slug, title, eyebrow, description, image_url, video_url, cta_label, cta_href,
      meta_title, meta_description, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      eyebrow = excluded.eyebrow,
      description = excluded.description,
      image_url = excluded.image_url,
      video_url = excluded.video_url,
      cta_label = excluded.cta_label,
      cta_href = excluded.cta_href,
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description,
      is_active = excluded.is_active,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      slug,
      clean(formData.get("title")),
      clean(formData.get("eyebrow")),
      clean(formData.get("description")),
      imageUrl,
      videoUrl,
      clean(formData.get("ctaLabel")),
      clean(formData.get("ctaHref")),
      clean(formData.get("metaTitle")),
      clean(formData.get("metaDescription")),
      activeValue(formData)
    ]
  });

  revalidateCmsPaths();
  redirectToSaved(formData, "Page content saved and published.");
}

export async function saveResource(formData: FormData) {
  await requireAdmin();
  const db = requireDatabase();
  const id = clean(formData.get("id")) || crypto.randomUUID();
  const key = clean(formData.get("key"));
  const uploadedFile = await saveUpload(formData.get("resourceFile"), "resources", key);
  const value = uploadedFile || clean(formData.get("value"));

  await db.execute({
    sql: `INSERT INTO cms_resources (
      id, resource_key, label, group_name, resource_type, value, metadata,
      is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(resource_key) DO UPDATE SET
      label = excluded.label,
      group_name = excluded.group_name,
      resource_type = excluded.resource_type,
      value = excluded.value,
      metadata = excluded.metadata,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      id,
      key,
      clean(formData.get("label")),
      clean(formData.get("groupName")),
      clean(formData.get("type")) || "text",
      value,
      metadataToJson(formData.get("metadata")),
      activeValue(formData),
      Number(formData.get("sortOrder") ?? 0)
    ]
  });

  revalidateCmsPaths();
  redirectToSaved(formData, "Resource saved and published.");
}

export async function saveProductCategory(formData: FormData) {
  await requireAdmin();
  await ensureProductCategoriesTable();
  const db = requireDatabase();
  const id = clean(formData.get("id")) || crypto.randomUUID();
  const name = clean(formData.get("name"));
  const slug = slugify(clean(formData.get("slug")) || name);
  const uploadedImage = await saveUpload(
    formData.get("imageFile"),
    "categories",
    slug
  );
  const imageUrl = uploadedImage || clean(formData.get("imageUrl"));

  await db.execute({
    sql: `INSERT INTO product_categories (
      id, slug, name, summary, description, image_url, is_featured,
      is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name = excluded.name,
      summary = excluded.summary,
      description = excluded.description,
      image_url = excluded.image_url,
      is_featured = excluded.is_featured,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      id,
      slug,
      name,
      clean(formData.get("summary")),
      clean(formData.get("description")),
      imageUrl,
      formData.get("isFeatured") ? 1 : 0,
      activeValue(formData),
      Number(formData.get("sortOrder") ?? 0)
    ]
  });

  revalidateCmsPaths();
  revalidatePath(`/categories/${slug}`);
  redirectToSaved(formData, "Category saved. Website visibility is updated.");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  await ensureProductEnhancementColumns();
  const db = requireDatabase();
  const id = clean(formData.get("id")) || crypto.randomUUID();
  const name = clean(formData.get("name"));
  const slug = slugify(clean(formData.get("slug")) || name);
  const categorySlug = clean(formData.get("categorySlug"));
  const companySlug = clean(formData.get("companySlug"));
  const uploadedImage = await saveUpload(formData.get("imageFile"), "products", slug);
  const imageUrl = uploadedImage || clean(formData.get("imageUrl"));

  if (!categorySlug || !companySlug) {
    throw new Error("Products must be linked to a category and partner company.");
  }

  await db.execute({
    sql: `INSERT INTO products (
      id, slug, name, category_slug, short_description, description,
      image_url, youtube_url, company_slug, features, specifications, is_featured,
      is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name = excluded.name,
      category_slug = excluded.category_slug,
      short_description = excluded.short_description,
      description = excluded.description,
      image_url = excluded.image_url,
      youtube_url = excluded.youtube_url,
      company_slug = excluded.company_slug,
      features = excluded.features,
      specifications = excluded.specifications,
      is_featured = excluded.is_featured,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      id,
      slug,
      name,
      categorySlug,
      clean(formData.get("shortDescription")),
      clean(formData.get("description")),
      imageUrl,
      clean(formData.get("youtubeUrl")),
      companySlug,
      linesToJson(formData.get("features")),
      specsToJson(formData.get("specifications")),
      formData.get("isFeatured") ? 1 : 0,
      activeValue(formData),
      Number(formData.get("sortOrder") ?? 0)
    ]
  });

  revalidateCmsPaths();
  revalidatePath(`/products/${slug}`);
  revalidatePath(`/categories/${categorySlug}`);
  revalidatePath(`/partner-companies/${companySlug}`);
  redirectToSaved(formData, "Product saved. Website visibility is updated.");
}

export async function saveAssociatedCompany(formData: FormData) {
  await requireAdmin();
  const db = requireDatabase();
  const id = clean(formData.get("id")) || crypto.randomUUID();
  const name = clean(formData.get("name"));
  const slug = slugify(clean(formData.get("slug")) || name);
  const uploadedLogo = await saveUpload(formData.get("logoFile"), "companies", slug);
  const logoUrl = uploadedLogo || clean(formData.get("logoUrl"));

  await db.execute({
    sql: `INSERT INTO associated_companies (
      id, slug, name, summary, description, logo_url, website_url,
      is_featured, is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name = excluded.name,
      summary = excluded.summary,
      description = excluded.description,
      logo_url = excluded.logo_url,
      website_url = excluded.website_url,
      is_featured = excluded.is_featured,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      id,
      slug,
      name,
      clean(formData.get("summary")),
      clean(formData.get("description")),
      logoUrl,
      clean(formData.get("websiteUrl")) || null,
      formData.get("isFeatured") ? 1 : 0,
      activeValue(formData),
      Number(formData.get("sortOrder") ?? 0)
    ]
  });

  revalidateCmsPaths();
  revalidatePath(`/partner-companies/${slug}`);
  redirectToSaved(formData, "Partner company saved. Website visibility is updated.");
}

export async function saveTeamMember(formData: FormData) {
  await requireAdmin();
  const db = requireDatabase();
  const id = clean(formData.get("id")) || crypto.randomUUID();
  const name = clean(formData.get("name"));
  const uploadedImage = await saveUpload(formData.get("imageFile"), "team", name);
  const imageUrl = uploadedImage || clean(formData.get("imageUrl"));

  await db.execute({
    sql: `INSERT INTO team_members (
      id, name, role, bio, image_url, is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      role = excluded.role,
      bio = excluded.bio,
      image_url = excluded.image_url,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP`,
    args: [
      id,
      name,
      clean(formData.get("role")),
      clean(formData.get("bio")),
      imageUrl,
      activeValue(formData),
      Number(formData.get("sortOrder") ?? 0)
    ]
  });

  revalidatePath("/about");
  revalidatePath("/admin");
  revalidatePath("/admin/team");
  redirectToSaved(formData, "Team member saved and published.");
}

export async function archiveRecord(formData: FormData) {
  await requireAdmin();
  const db = requireDatabase();
  const table = clean(formData.get("table"));
  const id = clean(formData.get("id"));

  const allowedTables = new Set([
    "products",
    "product_categories",
    "associated_companies",
    "team_members",
    "cms_resources"
  ]);

  if (!allowedTables.has(table)) {
    throw new Error("Unsupported archive target.");
  }

  await db.execute({
    sql: `UPDATE ${table} SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [id]
  });

  revalidateCmsPaths();
  redirectToSaved(formData, "Item is hidden from the website.");
}

export async function updateSubmissionStatus(formData: FormData) {
  await requireAdmin();
  const db = requireDatabase();

  await db.execute({
    sql: "UPDATE contact_submissions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [clean(formData.get("status")) || "new", clean(formData.get("id"))]
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  redirectToSaved(formData, "Inquiry status updated.");
}

export async function submitInquiry(formData: FormData) {
  if (!hasDatabaseConfig()) {
    redirect("/contact?submitted=unavailable");
    return;
  }

  await ensureProductEnhancementColumns();
  const db = requireDatabase();

  await db.execute({
    sql: `INSERT INTO contact_submissions (
      id, name, organization, email, phone, interest, product_slug, product_name, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      clean(formData.get("name")),
      clean(formData.get("organization")),
      clean(formData.get("email")),
      clean(formData.get("phone")),
      clean(formData.get("interest")),
      clean(formData.get("productSlug")),
      clean(formData.get("productName")),
      clean(formData.get("message"))
    ]
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  redirect("/contact?submitted=1");
}

export async function submitProductInquiry(formData: FormData) {
  const productSlug = clean(formData.get("productSlug"));
  const productName = clean(formData.get("productName"));

  if (!hasDatabaseConfig()) {
    redirect(`/products/${productSlug}?inquiry=unavailable`);
    return;
  }

  await ensureProductEnhancementColumns();
  const db = requireDatabase();

  await db.execute({
    sql: `INSERT INTO contact_submissions (
      id, name, organization, email, phone, interest, product_slug, product_name, message
    ) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      clean(formData.get("name")),
      clean(formData.get("organization")),
      clean(formData.get("phone")),
      productName ? `Product inquiry: ${productName}` : "Product inquiry",
      productSlug,
      productName,
      productName
        ? `Inquiry submitted from the ${productName} product page.`
        : "Inquiry submitted from a product page."
    ]
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  redirect(`/products/${productSlug}?inquiry=1`);
}

export const createProduct = saveProduct;
export const createProductCategory = saveProductCategory;
export const createAssociatedCompany = saveAssociatedCompany;
export const createTeamMember = saveTeamMember;
