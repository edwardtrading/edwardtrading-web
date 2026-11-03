/**
 * Replaces placeholder meta titles on the CMS pages with search-focused ones.
 *
 * Usage: npm run db:seed-page-seo
 *
 * A title is only replaced when it is blank or still one of the generic
 * placeholders listed under `replaces` (e.g. "Solutions"), so anything an editor
 * has written is left alone. Everything is editable afterwards under
 * Admin -> Pages.
 */
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");

  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const index = line.indexOf("=");
      if (index === -1 || line.trim().startsWith("#")) continue;
      const key = line.slice(0, index).trim();
      if (!process.env[key]) {
        process.env[key] = line.slice(index + 1).trim();
      }
    }
  }
}

loadEnv();

if (!process.env.DATABASE_URL || !process.env.DATABASE_AUTH_TOKEN) {
  console.error("DATABASE_URL and DATABASE_AUTH_TOKEN are required.");
  process.exit(1);
}

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

const seeds = {
  "home-hero": {
    metaTitle: "Medical Equipment Supplier in Nepal | Edward Trading",
    replaces: [
      "Edward Trading Pvt. Ltd.",
      "Healthcare, Hygiene & Medical Supplies Nepal|Edward Trading"
    ]
  },
  solutions: {
    metaTitle: "Medical, Surgical & Hygiene Products in Nepal",
    replaces: ["Solutions"]
  },
  "partner-companies": {
    metaTitle: "Partner Brands & Distributorships in Nepal",
    replaces: ["Partner Companies", "Associated Companies"]
  },
  "cleaning-solutions": {
    metaTitle: "Cleaning & Hygiene Solutions Supplier in Nepal",
    replaces: ["Cleaning & Hygiene", "Cleaning Solutions"]
  },
  "surgical-instruments": {
    metaTitle: "Surgical Instruments Supplier in Nepal",
    replaces: ["Surgical Instruments"]
  },
  industries: {
    metaTitle: "Hospitals, Hotels & Facilities We Supply in Nepal",
    replaces: ["Areas We Serve", "Industries Served"]
  },
  blog: {
    metaTitle: "Medical & Hygiene Supply Guides for Nepal",
    replaces: ["Blog"]
  },
  about: {
    metaTitle: "About Edward Trading | Healthcare Supplier in Nepal",
    replaces: ["About Us"]
  },
  contact: {
    metaTitle: "Contact Edward Trading | Request a Product Quote",
    replaces: ["Contact Us"]
  }
};

let updated = 0;

for (const [slug, seed] of Object.entries(seeds)) {
  const result = await db.execute({
    sql: "SELECT meta_title FROM cms_pages WHERE slug = ? LIMIT 1",
    args: [slug]
  });
  const row = result.rows[0];

  if (!row) {
    console.log(`- ${slug}: no stored page, built-in default already applies`);
    continue;
  }

  const current = String(row.meta_title ?? "").trim();

  if (current && !seed.replaces.includes(current)) {
    console.log(`- ${slug}: kept editor title "${current}"`);
    continue;
  }

  await db.execute({
    sql: "UPDATE cms_pages SET meta_title = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
    args: [seed.metaTitle, slug]
  });
  updated += 1;
  console.log(`+ ${slug}: "${current}" -> "${seed.metaTitle}"`);
}

console.log(`Done. ${updated} page title(s) updated.`);
