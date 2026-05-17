#!/usr/bin/env node
/* eslint-disable no-console */

/* ========================================================================
 * cleanup-old-originals.mjs
 * ------------------------------------------------------------------------
 * Deletes every non-webp file under inventory/ in Firebase Storage that
 * is no longer referenced by any Firestore inventory document.
 *
 * Safety first:
 *   - Collects ALL paths/URLs referenced in Firestore before touching anything
 *   - Only deletes files that are (a) not .webp AND (b) not referenced
 *   - Dry-run mode prints what would be deleted without deleting anything
 *
 * Usage:
 *   # preview — no deletes:
 *   node scripts/cleanup-old-originals.mjs --dry-run
 *
 *   # real run:
 *   node scripts/cleanup-old-originals.mjs
 * ====================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

import admin from "firebase-admin";

// -----------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

// -----------------------------------------------------------------------
// Firebase init (mirrors convert-images-to-webp.mjs)
// -----------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const localKeyPath = resolvePath(__dirname, "serviceAccount.json");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(localKeyPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = localKeyPath;
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "ERROR: Set GOOGLE_APPLICATION_CREDENTIALS or place the key at scripts/serviceAccount.json."
  );
  process.exit(1);
}

const credentialJson = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(credentialJson),
  projectId: "gfacetvault",
  storageBucket: "gfacetvault.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function storagePathFromUrl(value) {
  if (!value || value.startsWith("inventory/")) return value || null;
  try {
    const m = new URL(value).pathname.match(/\/o\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function bytesToKb(n) {
  return (n / 1024).toFixed(1);
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------
async function main() {
  console.log("\n========================================================");
  console.log("FacetVault — Storage cleanup (delete old non-webp files)");
  console.log("========================================================");
  console.log(`Dry run : ${DRY_RUN ? "YES (no deletes)" : "no"}`);
  console.log("--------------------------------------------------------\n");

  // Step 1 — collect every path currently referenced in Firestore
  console.log("Step 1: Reading Firestore inventory to collect referenced paths…");
  const snap = await db.collection("inventory").get();
  const referencedPaths = new Set();

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const urlFields = [d.imageUrl, d.mediumUrl, d.thumbnailUrl];
    const pathFields = [d.imagePath, d.mediumPath, d.thumbnailPath];

    for (const v of [...urlFields, ...pathFields]) {
      const p = storagePathFromUrl(v);
      if (p) referencedPaths.add(p);
    }
  }

  console.log(`  ${snap.size} docs → ${referencedPaths.size} referenced paths\n`);

  // Step 2 — list every file under inventory/ in Storage
  console.log("Step 2: Listing Storage files under inventory/…");
  const [files] = await bucket.getFiles({ prefix: "inventory/" });
  console.log(`  ${files.length} files found\n`);

  // Step 3 — identify candidates: non-webp AND not referenced
  const toDelete = files.filter((file) => {
    const name = file.name;
    const isWebp = name.toLowerCase().endsWith(".webp");
    const isReferenced = referencedPaths.has(name);
    return !isWebp && !isReferenced;
  });

  const stillReferenced = files.filter((file) => {
    const name = file.name;
    const isWebp = name.toLowerCase().endsWith(".webp");
    return !isWebp && referencedPaths.has(name);
  });

  if (stillReferenced.length > 0) {
    console.log("⚠️  Non-webp files still referenced in Firestore (SKIPPING):");
    for (const f of stillReferenced) {
      console.log(`    KEEP  ${f.name}`);
    }
    console.log();
  }

  if (toDelete.length === 0) {
    console.log("✓ Nothing to delete — Storage is already clean.\n");
    process.exit(0);
  }

  console.log(`Step 3: ${DRY_RUN ? "Would delete" : "Deleting"} ${toDelete.length} orphaned non-webp file(s):\n`);

  let deletedCount = 0;
  let deletedBytes = 0;
  let failedCount = 0;

  for (const file of toDelete) {
    try {
      const [meta] = await file.getMetadata();
      const size = Number(meta.size || 0);

      if (DRY_RUN) {
        console.log(`  DRY   ${file.name}  (${bytesToKb(size)} KB)`);
        deletedBytes += size;
        deletedCount++;
      } else {
        await file.delete();
        console.log(`  ✓     ${file.name}  (${bytesToKb(size)} KB)`);
        deletedBytes += size;
        deletedCount++;
      }
    } catch (err) {
      failedCount++;
      console.log(`  ✗     ${file.name}  FAILED: ${err.message}`);
    }
  }

  console.log("\n========================================================");
  console.log(`${DRY_RUN ? "Would delete" : "Deleted"} : ${deletedCount} files`);
  console.log(`Space freed : ${bytesToKb(deletedBytes)} KB`);
  if (failedCount) console.log(`Failed      : ${failedCount}`);
  console.log("========================================================\n");

  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
