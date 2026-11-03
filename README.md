# Edward Trading Pvt. Ltd. Website

Marketing site and CMS for [edwardtrading.com](https://www.edwardtrading.com), a
Kathmandu-based medical equipment, healthcare, and hygiene supplier.

Built with Next.js 14 (App Router), Tailwind CSS, and a Turso (libSQL) database.
Deployed on Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Required environment variables (`.env.local` locally, Project Settings on Vercel):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Turso database URL |
| `DATABASE_AUTH_TOKEN` | Turso auth token |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap login for `/admin` |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie |

Without database credentials the public site renders from the built-in fallback
content in `src/lib/fallback-data.ts` and `src/lib/cms-data.ts`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Creates or upgrades the database schema (safe to re-run) |
| `npm run db:seed-company-seo` | Fills empty SEO fields on partner companies |
| `npm run db:seed-page-seo` | Replaces placeholder meta titles on CMS pages |

## Project structure

```
assets/brand/            Source logo files (not deployed)
db/                      Schema, migration, and one-off seed scripts
public/                  Static files; uploads/ holds legacy CMS images still in use
src/
  app/                   Routes (App Router)
    admin/               CMS (noindex, disallowed in robots.txt)
    categories/[slug]/   Product category pages
    products/[slug]/     Product pages
    partner-companies/   Partner brand index and distributor pages
    blog/                Blog index and articles
    medical-equipment-supplier-in-nepal/   Commercial landing page
    media/[id]/          Serves images uploaded through the CMS
    sitemap.xml/         Dynamic XML sitemap with image entries
    robots.ts            robots.txt
  components/
    admin/               CMS forms and editor
    layout/              Navbar and footer
    products/            Product and category cards
    sections/            Page sections (hero, CTA, supplier hub, ...)
    ui/                  Buttons, reveal animation, headings
  lib/
    cms-data.ts          All database reads, with fallbacks
    seo.ts               Metadata builder, keyword variants, JSON-LD helpers
    site-data.ts         Company details and static copy
```

## SEO notes

- Every page's metadata goes through `buildMetadata` in `src/lib/seo.ts`, which
  adds the canonical URL, Open Graph, and Twitter cards. CMS meta fields win;
  keyword-shaped fallbacks fill any blanks.
- The sitemap is generated per request, so new products, categories, partner
  companies, and blog posts appear without a redeploy.
- Products, categories, and partner pages emit Product, ItemList, FAQ, and
  Breadcrumb structured data; the layout emits Organization/LocalBusiness and
  WebSite.
