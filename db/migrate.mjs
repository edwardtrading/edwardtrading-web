/**
 * Idempotent Turso schema migration.
 *
 * Usage: npm run db:migrate
 *
 * Reads DATABASE_URL / DATABASE_AUTH_TOKEN from the environment, falling back
 * to .env.local so it can be run locally without extra tooling.
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

const createStatements = [
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
  `CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
    ON blog_posts(published_at DESC)`
];

// [table, column, definition] — applied with ALTER TABLE, ignoring duplicates.
const columns = [
  ["products", "meta_title", "TEXT NOT NULL DEFAULT ''"],
  ["products", "meta_description", "TEXT NOT NULL DEFAULT ''"],
  ["products", "meta_keywords", "TEXT NOT NULL DEFAULT ''"],

  ["product_categories", "meta_title", "TEXT NOT NULL DEFAULT ''"],
  ["product_categories", "meta_description", "TEXT NOT NULL DEFAULT ''"],
  ["product_categories", "meta_keywords", "TEXT NOT NULL DEFAULT ''"],

  ["associated_companies", "meta_title", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "meta_description", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "meta_keywords", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "heading", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "eyebrow", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "content", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "faqs", "TEXT NOT NULL DEFAULT '[]'"],
  ["associated_companies", "highlights", "TEXT NOT NULL DEFAULT '[]'"],
  ["associated_companies", "distributor_status", "TEXT NOT NULL DEFAULT ''"],
  ["associated_companies", "territory", "TEXT NOT NULL DEFAULT ''"],

  ["cms_pages", "meta_keywords", "TEXT NOT NULL DEFAULT ''"]
];

let created = 0;
let added = 0;
let skipped = 0;

for (const sql of createStatements) {
  await db.execute(sql);
  created += 1;
}

for (const [table, column, definition] of columns) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`+ ${table}.${column}`);
    added += 1;
  } catch (error) {
    if (String(error?.message ?? "").includes("duplicate column name")) {
      skipped += 1;
    } else {
      throw error;
    }
  }
}

console.log(
  `\nMigration complete. ${created} create statements run, ${added} columns added, ${skipped} already present.`
);
