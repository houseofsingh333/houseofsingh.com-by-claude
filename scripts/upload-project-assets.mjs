/**
 * scripts/upload-project-assets.mjs
 *
 * Bulk-upload a folder of photos into Sanity's asset library (media browser)
 * so they can be picked when building project pages in the Studio. Creates
 * NO documents — image assets only.
 *
 * Each asset's title is prefixed with the project slug (derived from the
 * folder name) so a project's photos cluster together in the media browser,
 * e.g. a file in `project-assets/sikhs-in-the-6ix/` → title
 * "sikhs-in-the-6ix — <name>".
 *
 * Optional `assets.csv` in the subfolder, columns: image_filename, alt, title
 *   - if present: use its `alt` for altText and its `title` for the asset
 *     title (still slug-prefixed).
 *   - if absent: every image uses its filename as the title and no alt.
 *
 * Re-running is safe: each file's SHA1 is computed and matched against any
 * existing sanity.imageAsset with the same hash — already-uploaded files are
 * skipped.
 *
 * Usage (run locally, with a write token)
 * ───────────────────────────────────────
 *   SANITY_PROJECT_ID=31g7gu7n \
 *   SANITY_DATASET=production \
 *   SANITY_AUTH_TOKEN=sk...   \
 *   node scripts/upload-project-assets.mjs --folder project-assets/sikhs-in-the-6ix
 *
 *   Flags:
 *     --folder <path>   the project's subfolder of photos (required)
 *     --dry-run         list what would be uploaded / skipped; upload nothing
 *
 * The token needs write access (Editor+). Create one at
 * https://www.sanity.io/manage → project → API → Tokens.
 */

import { createClient } from "@sanity/client";
import { createReadStream, readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { createHash } from "node:crypto";

// ─── args + config ───────────────────────────────────────────────
function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const projectId = process.env.SANITY_PROJECT_ID ?? "31g7gu7n";
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_API_TOKEN;
const dryRun = !!arg("dry-run", false);

const folderArg = arg("folder");
if (!folderArg || folderArg === true) {
  console.error("✗ Missing --folder. Example: --folder project-assets/sikhs-in-the-6ix");
  process.exit(1);
}
const folder = resolve(String(folderArg));
if (!existsSync(folder)) {
  console.error(`✗ Folder not found: ${folder}`);
  process.exit(1);
}
if (!dryRun && !token) {
  console.error(
    "✗ Missing write token. Set SANITY_AUTH_TOKEN (or SANITY_API_TOKEN) to a token with Editor access.",
  );
  process.exit(1);
}

const client =
  !dryRun && token
    ? createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false })
    : null;

// ─── helpers ─────────────────────────────────────────────────────
const blank = (v) => v == null || String(v).trim() === "";
const clean = (v) => (blank(v) ? "" : String(v).trim());

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// minimal robust CSV parser (quotes, commas + newlines inside quotes)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* ignore */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c && c.trim() !== ""));
}

const IMAGE_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tif", ".tiff", ".heic",
]);

function sha1File(path) {
  return createHash("sha1").update(readFileSync(path)).digest("hex");
}

// ─── build the work list ─────────────────────────────────────────
const slug = slugify(basename(folder));

// optional assets.csv → map of image_filename → { alt, title }
const csvPath = join(folder, "assets.csv");
const meta = new Map();
if (existsSync(csvPath)) {
  const table = parseCsv(readFileSync(csvPath, "utf8"));
  let rows = table;
  if (table[0] && clean(table[0][0]).toLowerCase() === "image_filename") rows = table.slice(1);
  for (const r of rows) {
    const [image_filename, alt, title] = r.map((c) => (c == null ? "" : c));
    if (clean(image_filename)) {
      meta.set(clean(image_filename), { alt: clean(alt), title: clean(title) });
    }
  }
  console.log(`Loaded assets.csv (${meta.size} row(s)).`);
} else {
  console.log("No assets.csv found — using filenames as titles, no alt.");
}

const files = readdirSync(folder)
  .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))
  .sort();

console.log(
  `\n${dryRun ? "DRY RUN — " : ""}Project "${slug}": ${files.length} image file(s) in ${folder}\n`,
);

// ─── run ─────────────────────────────────────────────────────────
let uploaded = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const path = join(folder, file);
  const row = meta.get(file);
  const baseTitle = row && row.title ? row.title : file;
  const assetTitle = `${slug} — ${baseTitle}`;
  const altText = row && row.alt ? row.alt : undefined;

  try {
    const hash = sha1File(path);
    const existing = client
      ? await client.fetch(`*[_type=="sanity.imageAsset" && sha1hash==$hash][0]{_id,title}`, { hash })
      : null;

    if (existing) {
      console.log(`  ⤳ skip (already uploaded): ${file}  →  ${existing._id}`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  • would upload: ${file}  →  title "${assetTitle}"${altText ? `  alt "${altText}"` : ""}`);
      uploaded++;
      continue;
    }

    const asset = await client.assets.upload("image", createReadStream(path), {
      filename: file,
      preserveFilename: true,
      title: assetTitle,
    });

    // Ensure title + altText are set on the asset document.
    const setFields = { title: assetTitle };
    if (altText) setFields.altText = altText;
    await client.patch(asset._id).set(setFields).commit();

    console.log(`  ✓ uploaded: ${file}  →  ${asset._id}  ("${assetTitle}"${altText ? `, alt "${altText}"` : ""})`);
    uploaded++;
  } catch (err) {
    console.log(`  ✗ FAILED: ${file}  —  ${err?.message || err}`);
    failed++;
  }
}

// ─── summary ─────────────────────────────────────────────────────
console.log("\n===== SUMMARY =====");
console.log(
  `${dryRun ? "Would upload" : "Uploaded"}: ${uploaded}   Skipped (already present): ${skipped}   Failed: ${failed}`,
);
console.log(`\nFind them in the Studio media browser by searching "${slug}".\n`);
