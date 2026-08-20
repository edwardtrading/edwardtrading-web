/**
 * Optional starter SEO content for the existing partner companies.
 *
 * Usage: npm run db:seed-company-seo
 *
 * Only fills fields that are still empty, so anything already edited in the CMS
 * is left alone. Everything written here is editable afterwards under
 * Admin -> Partner Companies.
 *
 * NOTE ON "AUTHORIZED": `distributor_status` is deliberately left blank below.
 * The pages fall back to the neutral wording "Distributor". Set it to
 * "Authorized Distributor" in the CMS only for brands where Edward Trading
 * actually holds that appointment.
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
  diversey: {
    territory: "Nepal",
    heading: "Diversey Distributor in Nepal",
    highlights: [
      "Diversey cleaning and hygiene chemicals for hospitals, hotels, and facilities",
      "Product selection support matched to your cleaning protocols",
      "Supply across Kathmandu and the rest of Nepal",
      "Guidance on dilution, dosing, and safe handling"
    ],
    content: `<h2>Diversey products supplied across Nepal</h2>
<p>Edward Trading Pvt. Ltd. supplies Diversey professional cleaning and hygiene products to hospitals, hotels, restaurants, commercial buildings, and institutional facilities across Nepal. Our team helps buyers match Diversey product ranges to the cleaning protocols already in place at their site.</p>
<h2>Product ranges we support</h2>
<ul>
<li>Surface cleaning and disinfection products</li>
<li>Floor care chemicals for daily and periodic maintenance</li>
<li>Kitchen and warewashing hygiene products</li>
<li>Housekeeping and washroom care products</li>
</ul>
<h2>Who we supply</h2>
<p>Hospitals and clinics, hotels and resorts, restaurants and catering operations, commercial buildings, schools, and facility management contractors. If you are comparing options for a specific area of your facility, <a href="/contact">share your requirement</a> and we will help identify a suitable product.</p>
<h2>Ordering and delivery</h2>
<p>Share the product, pack size, and quantity range you need along with your timeline. We confirm availability and delivery expectations before supply moves. Delivery is coordinated for Kathmandu and other locations across Nepal.</p>`,
    faqs: [
      {
        question: "Does Edward Trading supply Diversey products in Nepal?",
        answer:
          "Yes. Edward Trading Pvt. Ltd. supplies Diversey cleaning and hygiene products to hospitals, hotels, and institutional facilities across Nepal."
      },
      {
        question: "How do I get a price for Diversey products in Nepal?",
        answer:
          "Send us the product name, pack size, and quantity range through the contact page or by phone, and our team will respond with availability and pricing."
      },
      {
        question: "Do you deliver Diversey products outside Kathmandu?",
        answer:
          "Yes. Delivery is coordinated across Nepal. Share your location and timeline with your enquiry so we can confirm delivery expectations."
      },
      {
        question: "Which Diversey product ranges are available?",
        answer:
          "Surface cleaning and disinfection, floor care, kitchen and warewashing hygiene, and housekeeping and washroom care ranges. Contact us for the current list for your facility type."
      }
    ]
  },

  taski: {
    territory: "Nepal",
    heading: "TASKI Distributor in Nepal",
    highlights: [
      "TASKI floor care machines and cleaning equipment",
      "Machine selection matched to floor type and area size",
      "Supply and delivery across Nepal",
      "Support on operation, consumables, and spares"
    ],
    content: `<h2>TASKI cleaning equipment in Nepal</h2>
<p>Edward Trading Pvt. Ltd. supplies TASKI professional floor care machines and cleaning equipment to hospitals, hotels, commercial buildings, and facility teams across Nepal. We help buyers select equipment based on floor type, area size, and the cleaning routine the site runs.</p>
<h2>Equipment categories</h2>
<ul>
<li>Scrubber driers for large floor areas</li>
<li>Single disc machines for scrubbing and polishing</li>
<li>Vacuum cleaners for dry and wet pickup</li>
<li>Accessories, pads, brushes, and consumables</li>
</ul>
<h2>Choosing the right machine</h2>
<p>Machine choice depends on the floor surface, the daily area to be covered, and how much time the cleaning team has. Tell us those three details and we will shortlist suitable TASKI models. You can also <a href="/solutions">browse our wider cleaning and hygiene range</a>.</p>
<h2>After supply</h2>
<p>We support ongoing requirements for consumables, pads, and spares so equipment stays in service. Repeat requirements are handled with consistent communication and category guidance.</p>`,
    faqs: [
      {
        question: "Does Edward Trading supply TASKI machines in Nepal?",
        answer:
          "Yes. Edward Trading Pvt. Ltd. supplies TASKI floor care machines and cleaning equipment to facilities across Nepal."
      },
      {
        question: "How do I choose the right TASKI machine?",
        answer:
          "Share your floor type, the area to be cleaned daily, and the time available for cleaning. Our team will shortlist suitable TASKI models for your site."
      },
      {
        question: "Do you supply TASKI spares and consumables in Nepal?",
        answer:
          "Yes. Pads, brushes, accessories, and consumables can be supplied for ongoing requirements alongside the machines."
      },
      {
        question: "What is the price of a TASKI scrubber drier in Nepal?",
        answer:
          "Pricing depends on the model and configuration. Contact us with your area size and floor type and we will respond with suitable options and pricing."
      }
    ]
  },

  medtech: {
    territory: "Nepal",
    heading: "Medtech Distributor in Nepal",
    highlights: [
      "Medtech products supplied to healthcare buyers in Nepal",
      "Support on product selection and specifications",
      "Availability and delivery coordination",
      "Ongoing supply for repeat requirements"
    ],
    content: `<h2>Medtech products supplied in Nepal</h2>
<p>Edward Trading Pvt. Ltd. supplies Medtech products to hospitals, clinics, and healthcare buyers across Nepal. Our team supports product selection, specification questions, availability, and delivery coordination.</p>
<h2>How we work with healthcare buyers</h2>
<p>We start from your requirement: the product category, the specifications your facility needs, quantity range, and timeline. From there we confirm what is available and what the supply timeline looks like before anything moves.</p>
<h2>Request product details</h2>
<p>For the current product list, specifications, or pricing, <a href="/contact">contact our team</a> with your requirement.</p>`,
    faqs: [
      {
        question: "Does Edward Trading supply Medtech products in Nepal?",
        answer:
          "Yes. Edward Trading Pvt. Ltd. supplies Medtech products to hospitals, clinics, and healthcare buyers across Nepal."
      },
      {
        question: "How do I request Medtech product pricing in Nepal?",
        answer:
          "Contact our team with the product category, required specifications, and quantity range, and we will respond with availability and pricing."
      },
      {
        question: "Do you deliver Medtech products outside Kathmandu?",
        answer:
          "Yes. Delivery is coordinated across Nepal. Include your location and timeline with your enquiry."
      }
    ]
  }
};

let updated = 0;
let skipped = 0;

for (const [slug, seed] of Object.entries(seeds)) {
  const existing = await db.execute({
    sql: "SELECT slug, heading, content, faqs, highlights, territory FROM associated_companies WHERE slug = ? LIMIT 1",
    args: [slug]
  });

  const row = existing.rows[0];

  if (!row) {
    console.log(`- ${slug}: no such company, skipped`);
    skipped += 1;
    continue;
  }

  // Only fill blanks so CMS edits are never overwritten.
  const next = {
    heading: String(row.heading || "") || seed.heading,
    territory: String(row.territory || "") || seed.territory,
    content: String(row.content || "") || seed.content,
    faqs:
      String(row.faqs || "[]") !== "[]"
        ? String(row.faqs)
        : JSON.stringify(seed.faqs),
    highlights:
      String(row.highlights || "[]") !== "[]"
        ? String(row.highlights)
        : JSON.stringify(seed.highlights)
  };

  await db.execute({
    sql: `UPDATE associated_companies
      SET heading = ?, territory = ?, content = ?, faqs = ?, highlights = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE slug = ?`,
    args: [next.heading, next.territory, next.content, next.faqs, next.highlights, slug]
  });

  console.log(`+ ${slug}: seeded`);
  updated += 1;
}

console.log(`\nDone. ${updated} companies updated, ${skipped} skipped.`);
