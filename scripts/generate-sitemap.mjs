import fs from "fs/promises";
import path from "path";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const SITE_URL = "https://facet-vault.vercel.app";

// CHANGE THESE IF YOUR FIRESTORE SETUP USES DIFFERENT ONES
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;

// Most likely collection name.
// If your inventory docs are stored somewhere else, change this.
const COLLECTION_NAME = "inventory";

// Adjust these if your field names differ.
const PUBLIC_FIELD = "isPublicSale";
const ACTIVE_FIELD = "isForSale";

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildStaticUrls(date) {
  return [
    {
      loc: `${SITE_URL}/`,
      lastmod: date,
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: `${SITE_URL}/collection`,
      lastmod: date,
      changefreq: "daily",
      priority: "0.9",
    },
    {
      loc: `${SITE_URL}/about`,
      lastmod: date,
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${SITE_URL}/how-to-buy`,
      lastmod: date,
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${SITE_URL}/contact`,
      lastmod: date,
      changefreq: "monthly",
      priority: "0.6",
    },
  ];
}

function docFieldToValue(field) {
  if (!field) return null;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("booleanValue" in field) return field.booleanValue;
  if ("timestampValue" in field) return field.timestampValue;
  return null;
}

async function fetchPublicStoneDocs() {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    throw new Error(
      "Missing VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_API_KEY in your .env file."
    );
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}?key=${FIREBASE_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Firestore docs: ${response.status} ${text}`);
  }

  const data = await response.json();
  const docs = Array.isArray(data.documents) ? data.documents : [];

  return docs
    .map((doc) => {
      const fullName = doc.name || "";
      const id = fullName.split("/").pop();
      const fields = doc.fields || {};

      const isPublicSale = docFieldToValue(fields[PUBLIC_FIELD]);
      const isForSale = docFieldToValue(fields[ACTIVE_FIELD]);
      const updatedAt = docFieldToValue(fields.updatedAt);
      const createdAt = docFieldToValue(fields.createdAt);

      return {
        id,
        isPublicSale,
        isForSale,
        updatedAt,
        createdAt,
      };
    })
    .filter((item) => {
      // Keep this flexible because your exact field logic may differ.
      // A stone will be included if either public field is true.
      return item.id && (item.isPublicSale === true || item.isForSale === true);
    });
}

function buildStoneUrls(items, fallbackDate) {
  return items.map((item) => {
    const timestamp = item.updatedAt || item.createdAt;
    const lastmod = timestamp
      ? new Date(timestamp).toISOString().split("T")[0]
      : fallbackDate;

    return {
      loc: `${SITE_URL}/stone/${encodeURIComponent(item.id)}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    };
  });
}

function buildXml(urls) {
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${escapeXml(url.changefreq)}</changefreq>
    <priority>${escapeXml(url.priority)}</priority>
  </url>`
    )
    .join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function main() {
  const today = todayIsoDate();

  const staticUrls = buildStaticUrls(today);
  let stoneUrls = [];

  try {
    const stoneDocs = await fetchPublicStoneDocs();
    stoneUrls = buildStoneUrls(stoneDocs, today);
    console.log(`Fetched ${stoneUrls.length} public stone URLs.`);
  } catch (error) {
    console.warn("Could not fetch public stones. Writing static sitemap only.");
    console.warn(error.message);
  }

  const allUrls = [...staticUrls, ...stoneUrls];
  const xml = buildXml(allUrls);

  const outputPath = path.resolve(process.cwd(), "public", "sitemap.xml");
  await fs.writeFile(outputPath, xml, "utf8");

  console.log(`Sitemap written to ${outputPath}`);
}

main().catch((error) => {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
});