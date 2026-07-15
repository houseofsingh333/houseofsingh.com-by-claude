/**
 * scripts/import-journal-entries.mjs
 *
 * Bulk-import journalEntry documents from a CSV + a folder of photos.
 *
 * For each CSV row it:
 *   1. uploads the image file to Sanity as an image asset (standard pipeline),
 *   2. creates a journalEntry document with fields mapped to the real schema:
 *      title, slug (generated from title if blank), date (omitted if CHECK/
 *      blank/non-ISO — never invented), excerpt, body (plain text → Portable
 *      Text), coverImage (uploaded asset + alt + caption), seo (metaTitle /
 *      metaDescription). Blanks are handled gracefully, never fatal.
 *
 * CSV column order (with or without a header row):
 *   image_filename, title, slug, date, excerpt, body, alt, caption,
 *   seo_title, seo_description
 *
 * Safety
 * ──────
 *   - Documents are created as DRAFTS by default (id "drafts.import-journal-*")
 *     so they stay off the live site and are easy to find and delete.
 *   - Deterministic ids + createOrReplace → re-running is idempotent.
 *   - Use --limit 5 to run the small test batch first.
 *
 * Usage (run locally, where the folder + token + Sanity access exist)
 * ──────────────────────────────────────────────────────────────────
 *   SANITY_PROJECT_ID=31g7gu7n \
 *   SANITY_DATASET=production \
 *   SANITY_AUTH_TOKEN=sk...   \
 *   node scripts/import-journal-entries.mjs \
 *     --folder journal-import \
 *     --csv journal-import/journal_import.csv \
 *     --limit 5
 *
 *   Flags:
 *     --folder <path>   folder containing the photos (default: journal-import)
 *     --csv <path>      CSV path (default: <folder>/journal_import.csv)
 *     --limit <n>       import only the first n rows (omit for all)
 *     --publish         create as published docs instead of drafts
 *     --prefix <name>   id prefix (default: import-journal)
 *     --dry-run         parse + report only; upload nothing, create nothing
 *
 * The token needs write access (Editor+). Create one at
 * https://www.sanity.io/manage → project → API → Tokens.
 */

import { createClient } from "@sanity/client";
import { createReadStream, readFileSync, existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

// ─── args + config ───────────────────────────────────────────────
function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true; // bare flag → boolean true
}

const projectId = process.env.SANITY_PROJECT_ID ?? "31g7gu7n";
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_API_TOKEN;

const folder = resolve(String(arg("folder", "journal-import")));
const csvPath = resolve(String(arg("csv", join(folder, "journal_import.csv"))));
const limitRaw = arg("limit");
const limit = limitRaw ? parseInt(String(limitRaw), 10) : Infinity;
const publish = !!arg("publish", false);
const dryRun = !!arg("dry-run", false);
const idPrefix = String(arg("prefix", "import-journal"));

if (!dryRun && !token) {
  console.error(
    "✗ Missing write token. Set SANITY_AUTH_TOKEN (or SANITY_API_TOKEN) to a token with Editor access.",
  );
  process.exit(1);
}
if (!existsSync(csvPath)) {
  console.error(`✗ CSV not found: ${csvPath}`);
  process.exit(1);
}

const client =
  !dryRun && token
    ? createClient({
        projectId,
        dataset,
        token,
        apiVersion: "2024-10-01",
        useCdn: false,
      })
    : null;

// ─── minimal robust CSV parser (quotes, commas + newlines inside quotes) ──
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // ignore
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ─── helpers ─────────────────────────────────────────────────────
const blank = (v) => v == null || String(v).trim() === "";
const clean = (v) => (blank(v) ? "" : String(v).trim());
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

// date: only accept a real ISO YYYY-MM-DD. CHECK/blank/anything else → null.
function normalizeDate(v) {
  const s = clean(v);
  if (!s || s.toUpperCase() === "CHECK") return { value: null, note: s ? s : "blank" };
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { value: s, note: null };
  return { value: null, note: `non-ISO "${s}"` };
}

// plain text → Portable Text blocks; blank lines separate paragraphs.
function toPortableText(text) {
  const s = clean(text);
  if (!s) return undefined;
  const paras = s
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  const src = paras.length ? paras : [s];
  return src.map((p) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text: p, marks: [] }],
  }));
}

// ─── run ─────────────────────────────────────────────────────────
const table = parseCsv(readFileSync(csvPath, "utf8")).filter((r) =>
  r.some((c) => c && c.trim() !== ""),
);

let dataRows = table;
if (
  table[0] &&
  clean(table[0][0]).toLowerCase() === "image_filename"
) {
  dataRows = table.slice(1);
}
dataRows = dataRows.slice(0, limit);

console.log(
  `\n${dryRun ? "DRY RUN — " : ""}Importing ${dataRows.length} row(s) as ${
    publish ? "PUBLISHED" : "DRAFTS"
  } into ${projectId}/${dataset}\n`,
);

const created = [];
const attention = [];
const usedSlugs = new Set();

for (let i = 0; i < dataRows.length; i++) {
  const cols = dataRows[i].map((c) => (c == null ? "" : c));
  const [
    image_filename,
    title,
    slug,
    date,
    excerpt,
    body,
    alt,
    caption,
    seo_title,
    seo_description,
  ] = cols;
  const rowNum = i + 1;
  const flags = [];

  // title
  let finalTitle = clean(title);
  if (!finalTitle) {
    finalTitle = `[NO TITLE — import row ${rowNum}]`;
    flags.push("blank title (placeholder set)");
  }

  // slug (+ de-dupe across batch)
  let slugCurrent = clean(slug) ? slugify(slug) : slugify(finalTitle);
  if (!slugCurrent) slugCurrent = `${idPrefix}-row-${rowNum}`;
  if (usedSlugs.has(slugCurrent)) {
    const deduped = `${slugCurrent}-${rowNum}`;
    flags.push(`duplicate slug → "${deduped}"`);
    slugCurrent = deduped;
  }
  usedSlugs.add(slugCurrent);

  // date
  const d = normalizeDate(date);
  if (d.value === null) flags.push(`date unset (${d.note})`);

  // image → coverImage
  let coverImage;
  const imgName = clean(image_filename);
  if (!imgName) {
    flags.push("no image_filename (coverImage omitted)");
  } else {
    const imgPath = join(folder, imgName);
    if (!existsSync(imgPath)) {
      flags.push(`image file missing: ${imgName} (coverImage omitted)`);
    } else if (dryRun) {
      coverImage = { _type: "image", asset: { _type: "reference", _ref: "(dry-run)" } };
      if (clean(alt)) coverImage.alt = clean(alt);
      else flags.push("blank alt (add in Studio)");
      if (clean(caption)) coverImage.caption = clean(caption);
    } else {
      const asset = await client.assets.upload("image", createReadStream(imgPath), {
        filename: basename(imgPath),
      });
      coverImage = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
      if (clean(alt)) coverImage.alt = clean(alt);
      else flags.push("blank alt (add in Studio)");
      if (clean(caption)) coverImage.caption = clean(caption);
    }
  }

  // seo
  const seo = {};
  if (clean(seo_title)) seo.metaTitle = clean(seo_title);
  if (clean(seo_description)) seo.metaDescription = clean(seo_description);

  const _id = `${publish ? "" : "drafts."}${idPrefix}-${String(rowNum).padStart(
    3,
    "0",
  )}-${slugCurrent}`.slice(0, 120);

  const doc = {
    _id,
    _type: "journalEntry",
    title: finalTitle,
    slug: { _type: "slug", current: slugCurrent },
    ...(d.value ? { date: d.value } : {}),
    ...(clean(excerpt) ? { excerpt: clean(excerpt) } : {}),
    ...(toPortableText(body) ? { body: toPortableText(body) } : {}),
    ...(coverImage ? { coverImage } : {}),
    ...(Object.keys(seo).length ? { seo: { _type: "seo", ...seo } } : {}),
    author: "Maninder Singh",
  };

  if (dryRun) {
    console.log(`• row ${rowNum}: would create ${_id}${flags.length ? "  ⚠ " + flags.join("; ") : ""}`);
  } else {
    const res = await client.createOrReplace(doc);
    console.log(`✓ row ${rowNum}: ${res._id}${flags.length ? "  ⚠ " + flags.join("; ") : ""}`);
    created.push({ row: rowNum, _id: res._id, title: finalTitle, slug: slugCurrent });
  }
  if (flags.length) attention.push({ row: rowNum, title: finalTitle, flags });
}

// ─── summary ─────────────────────────────────────────────────────
console.log("\n===== SUMMARY =====");
console.log(
  `${dryRun ? "Would create" : "Created"} ${dataRows.length} ${
    publish ? "published" : "draft"
  } journalEntry doc(s).`,
);
if (created.length) console.table(created);

if (attention.length) {
  console.log("\n----- NEEDS ATTENTION -----");
  for (const a of attention) console.log(`Row ${a.row} "${a.title}": ${a.flags.join("; ")}`);
}

console.log("\nFind the imported set in the Studio (Drafts), or query with GROQ:");
console.log(`  *[_type=="journalEntry" && _id match "${publish ? "" : "drafts."}${idPrefix}-*"]{_id,title,date}`);
console.log("\nDelete the whole test set (from the repo root, with your token):");
console.log(
  `  npx sanity@latest documents query '*[_type=="journalEntry" && _id match "${
    publish ? "" : "drafts."
  }${idPrefix}-*"]._id' --dataset ${dataset} | xargs -n1 npx sanity@latest documents delete`,
);
console.log("(or just select and delete them in the Studio).\n");
