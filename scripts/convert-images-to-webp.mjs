#!/usr/bin/env node
/* eslint-disable no-console */

/* ========================================================================
 * convert-images-to-webp.mjs
 * ------------------------------------------------------------------------
 * One-shot backfill that converts every existing inventory image in
 * Firebase Storage into three webp variants (thumb / medium / full) and
 * updates the Firestore docs to point at the new files.
 *
 * What it does, per inventory item:
 *   1. Reads imageUrl / thumbnailUrl from the doc.
 *   2. If both already end in .webp AND a mediumUrl exists, skips it.
 *   3. Downloads the largest available source image (imageUrl → thumb).
 *   4. Re-encodes it with sharp into:
 *        thumb  600w  q72 webp →  inventory/{uid}/thumbnails/...
 *        medium 1000w q78 webp →  inventory/{uid}/medium/...
 *        full   1600w q82 webp →  inventory/{uid}/original/...
 *   5. Uploads the three new files (with image/webp content-type) and
 *      makes them publicly downloadable via signed URLs (long expiry).
 *   6. Updates the Firestore doc with the new URLs and Storage paths.
 *   7. Optionally deletes the old non-webp original (--delete-old).
 *
 * Usage
 * -----
 *   # 1. one-time install:
 *   npm install -D sharp
 *
 *   # 2. point at a service account JSON key:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *   #    or place it at scripts/serviceAccount.json (auto-detected)
 *
 *   # 3. dry-run first (downloads + encodes but writes nothing):
 *   node scripts/convert-images-to-webp.mjs --dry-run
 *
 *   # 4. real run:
 *   node scripts/convert-images-to-webp.mjs
 *
 *   # 5. real run + delete the old multi-MB JPEG originals after
 *   #    successful conversion:
 *   node scripts/convert-images-to-webp.mjs --delete-old
 *
 *   # filter to a single user:
 *   node scripts/convert-images-to-webp.mjs --user=<uid>
 *
 *   # process N items only (handy for spot checks):
 *   node scripts/convert-images-to-webp.mjs --limit=5
 * ====================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

import admin from "firebase-admin";
import sharp from "sharp";

// -----------------------------------------------------------------------
// CLI args
// -----------------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const opt = (name, fallback = null) => {
  const m = args.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split("=").slice(1).join("=") : fallback;
};

const DRY_RUN = flag("dry-run");
const DELETE_OLD = flag("delete-old");
const USER_FILTER = opt("user");
const LIMIT = opt("limit") ? Number(opt("limit")) : null;

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------
const PROJECT_ID = "gfacetvault";
const STORAGE_BUCKET = "gfacetvault.firebasestorage.app";

const VARIANTS = [
  { key: "thumb", maxWidth: 600, quality: 72, folder: "thumbnails", suffix: "thumb" },
  { key: "medium", maxWidth: 1000, quality: 78, folder: "medium", suffix: "medium" },
  { key: "full", maxWidth: 1600, quality: 82, folder: "original", suffix: "full" },
];

// -----------------------------------------------------------------------
// Firebase init
// -----------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const localKeyPath = resolvePath(__dirname, "serviceAccount.json");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(localKeyPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = localKeyPath;
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "ERROR: Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service account JSON,\n" +
      "       or place the key at scripts/serviceAccount.json."
  );
  process.exit(1);
}

const credentialJson = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(credentialJson),
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/**
 * A storage path can come in two shapes:
 *   - "inventory/{uid}/original/gem_123.jpg"  (already a path → use as-is)
 *   - "https://firebasestorage.googleapis.com/...?alt=media&token=..." (download URL)
 * For the latter we extract the object name from the URL.
 */
function pathFromUrlOrPath(value) {
  if (!value) return null;
  if (!value.startsWith("http")) return value;

  try {
    const url = new URL(value);
    // Format: /v0/b/{bucket}/o/{ENCODED_PATH}
    const m = url.pathname.match(/\/o\/(.+)$/);
    if (!m) return null;
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

async function downloadObject(path) {
  const file = bucket.file(path);
  const [buf] = await file.download();
  return buf;
}

async function uploadVariant(buffer, path) {
  const file = bucket.file(path);
  await file.save(buffer, {
    contentType: "image/webp",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      contentType: "image/webp",
    },
  });
  // Long-lived signed URL for direct browser access.
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2491",
  });
  return url;
}

async function encodeVariant(srcBuffer, variant) {
  return sharp(srcBuffer, { failOn: "none" })
    .rotate() // honor EXIF orientation
    .resize({
      width: variant.maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: variant.quality, effort: 5 })
    .toBuffer();
}

function looksLikeWebp(value) {
  if (!value) return false;
  const path = pathFromUrlOrPath(value) || value;
  return /\.webp(\?|$)/i.test(path);
}

function pickSourcePathForReencode(item) {
  // Prefer the largest existing image as the source.
  return (
    pathFromUrlOrPath(item.imagePath || item.imageUrl) ||
    pathFromUrlOrPath(item.mediumPath || item.mediumUrl) ||
    pathFromUrlOrPath(item.thumbnailPath || item.thumbnailUrl)
  );
}

function isAlreadyConverted(item) {
  return (
    looksLikeWebp(item.imageUrl) &&
    looksLikeWebp(item.thumbnailUrl) &&
    !!item.mediumUrl &&
    looksLikeWebp(item.mediumUrl)
  );
}

function bytesToKb(n) {
  return (n / 1024).toFixed(1);
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------
async function main() {
  console.log("\n========================================================");
  console.log("FacetVault image → webp backfill");
  console.log("========================================================");
  console.log(`Project        : ${PROJECT_ID}`);
  console.log(`Bucket         : ${STORAGE_BUCKET}`);
  console.log(`Dry run        : ${DRY_RUN ? "YES (no writes)" : "no"}`);
  console.log(`Delete old     : ${DELETE_OLD ? "yes" : "no"}`);
  if (USER_FILTER) console.log(`User filter    : ${USER_FILTER}`);
  if (LIMIT) console.log(`Limit          : ${LIMIT}`);
  console.log("--------------------------------------------------------\n");

  let q = db.collection("inventory");
  if (USER_FILTER) q = q.where("userId", "==", USER_FILTER);

  const snap = await q.get();
  console.log(`Loaded ${snap.size} inventory documents.\n`);

  let processed = 0;
  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const docSnap of snap.docs) {
    if (LIMIT && processed >= LIMIT) break;

    const id = docSnap.id;
    const item = docSnap.data();
    const userId = item.userId;
    const name = item.name || item.stoneCode || id;
    processed += 1;

    if (!item.imageUrl && !item.thumbnailUrl) {
      skipped += 1;
      console.log(`SKIP   [${id}] "${name}" — no image fields.`);
      continue;
    }

    if (isAlreadyConverted(item)) {
      skipped += 1;
      console.log(`SKIP   [${id}] "${name}" — already webp + medium.`);
      continue;
    }

    const sourcePath = pickSourcePathForReencode(item);
    if (!sourcePath) {
      skipped += 1;
      console.log(
        `SKIP   [${id}] "${name}" — could not resolve a Storage path.`
      );
      continue;
    }

    const timestamp = Date.now();
    const newPaths = {
      thumb: `inventory/${userId}/thumbnails/gem_${timestamp}_thumb.webp`,
      medium: `inventory/${userId}/medium/gem_${timestamp}_medium.webp`,
      full: `inventory/${userId}/original/gem_${timestamp}_full.webp`,
    };

    try {
      console.log(`→      [${id}] "${name}"`);
      console.log(`        source: ${sourcePath}`);

      const srcBuf = await downloadObject(sourcePath);
      const sourceKb = Number(bytesToKb(srcBuf.length));
      console.log(`        downloaded: ${sourceKb} KB`);

      const updates = {};
      let totalNewBytes = 0;

      for (const variant of VARIANTS) {
        const buf = await encodeVariant(srcBuf, variant);
        totalNewBytes += buf.length;
        const path = newPaths[variant.key];

        if (DRY_RUN) {
          console.log(
            `        ${variant.key.padEnd(6)} → ${bytesToKb(buf.length)} KB (dry-run, not uploaded)`
          );
          continue;
        }

        const url = await uploadVariant(buf, path);
        console.log(
          `        ${variant.key.padEnd(6)} → ${bytesToKb(buf.length)} KB · ${path}`
        );

        if (variant.key === "thumb") {
          updates.thumbnailUrl = url;
          updates.thumbnailPath = path;
        } else if (variant.key === "medium") {
          updates.mediumUrl = url;
          updates.mediumPath = path;
        } else if (variant.key === "full") {
          updates.imageUrl = url;
          updates.imagePath = path;
        }
      }

      const saved = srcBuf.length - totalNewBytes;
      savedBytes += saved;
      console.log(
        `        total saved: ${bytesToKb(saved)} KB (source ${sourceKb} → 3 variants ${bytesToKb(totalNewBytes)})`
      );

      if (DRY_RUN) {
        converted += 1;
        continue;
      }

      // Cleanup old originals/thumbs we're replacing.
      if (DELETE_OLD) {
        const oldPaths = [
          item.imagePath,
          item.mediumPath,
          item.thumbnailPath,
        ].filter(
          (p) =>
            p &&
            p !== updates.imagePath &&
            p !== updates.mediumPath &&
            p !== updates.thumbnailPath
        );

        for (const oldPath of oldPaths) {
          try {
            await bucket.file(oldPath).delete();
            console.log(`        deleted old: ${oldPath}`);
          } catch (err) {
            if (err.code === 404) continue;
            console.log(`        could not delete ${oldPath}: ${err.message}`);
          }
        }
      }

      await docSnap.ref.update({
        ...updates,
        imageVariantsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      converted += 1;
      console.log(`        ✓ Firestore updated.\n`);
    } catch (err) {
      failed += 1;
      console.log(`        ✗ FAILED: ${err.message}\n`);
    }
  }

  console.log("========================================================");
  console.log(`Processed : ${processed}`);
  console.log(`Converted : ${converted}`);
  console.log(`Skipped   : ${skipped}`);
  console.log(`Failed    : ${failed}`);
  console.log(`Saved     : ${bytesToKb(savedBytes)} KB total`);
  console.log("========================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
