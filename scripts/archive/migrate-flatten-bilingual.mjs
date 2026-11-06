/**
 * scripts/migrate-flatten-bilingual.mjs
 *
 * Sanity migration: flatten { en, pa } bilingual objects → single string.
 *
 * What it does
 * ────────────
 * For every document type that previously had bilingual fields, this script
 * reads the English value (.en) from each field and writes it back as a
 * plain string (or array) in place of the old bilingual object.
 *
 * Affected types and fields:
 *   navigation   → items[].label
 *   heroSlide    → heading, subheading, caption
 *   project      → title, excerpt, body
 *   journalEntry → title, excerpt, body
 *   aboutPage    → introQuote, founderRoles, founderBio, monikerText,
 *                  milestones[].title, milestones[].text,
 *                  testimonials[].quote
 *   contactPage  → heading, subheading, reasons[] items
 *   siteSettings → tagline, footerText
 *
 * Idempotency
 * ───────────
 * Each field is only patched when it is still an object with an .en key.
 * Re-running the script after it has already been applied is safe — already-
 * flattened string fields are skipped.
 *
 * Usage
 * ─────
 *   SANITY_PROJECT_ID=xxx \
 *   SANITY_DATASET=production \
 *   SANITY_AUTH_TOKEN=skXXX \
 *   node scripts/migrate-flatten-bilingual.mjs
 *
 * The token must have write access (Editor or above).
 * Create one at https://www.sanity.io/manage → project → API → Tokens.
 */

import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_AUTH_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env vars. Set SANITY_PROJECT_ID and SANITY_AUTH_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Return true when value is a bilingual object (has an .en or .pa key). */
function isBilingual(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    ("en" in value || "pa" in value)
  );
}

/** Extract English text from a bilingual object, or pass through if already flat. */
function flattenText(value) {
  if (!isBilingual(value)) return value; // already flat
  return value.en ?? value.pa ?? null;
}

/** Flatten a bilingual array-of-strings field ({ en: string[], pa: string[] } → string[]). */
function flattenStringArray(value) {
  if (!isBilingual(value)) return value;
  return value.en ?? value.pa ?? [];
}

/** Flatten a bilingual Portable Text field ({ en: block[], pa: block[] } → block[]). */
function flattenBlocks(value) {
  if (!isBilingual(value)) return value;
  return value.en ?? value.pa ?? [];
}

// ── Per-type migration functions ───────────────────────────────────────────

async function migrateNavigation() {
  const docs = await client.fetch(
    `*[_type == "navigation"]{ _id, items }`,
  );
  let patched = 0;

  for (const doc of docs) {
    if (!doc.items?.length) continue;

    const needsPatch = doc.items.some((item) => isBilingual(item.label));
    if (!needsPatch) continue;

    const items = doc.items.map((item) => ({
      ...item,
      label: isBilingual(item.label) ? flattenText(item.label) : item.label,
    }));

    await client.patch(doc._id).set({ items }).commit();
    console.log(`  navigation ${doc._id}: items[].label flattened`);
    patched++;
  }
  return patched;
}

async function migrateHeroSlides() {
  const docs = await client.fetch(
    `*[_type == "heroSlide"]{ _id, heading, subheading, caption }`,
  );
  let patched = 0;

  for (const doc of docs) {
    const patch = {};
    if (isBilingual(doc.heading))    patch.heading    = flattenText(doc.heading);
    if (isBilingual(doc.subheading)) patch.subheading = flattenText(doc.subheading);
    if (isBilingual(doc.caption))    patch.caption    = flattenText(doc.caption);

    if (Object.keys(patch).length === 0) continue;
    await client.patch(doc._id).set(patch).commit();
    console.log(`  heroSlide ${doc._id}: ${Object.keys(patch).join(", ")} flattened`);
    patched++;
  }
  return patched;
}

async function migrateProjects() {
  const docs = await client.fetch(
    `*[_type == "project"]{ _id, title, excerpt, body }`,
  );
  let patched = 0;

  for (const doc of docs) {
    const patch = {};
    if (isBilingual(doc.title))   patch.title   = flattenText(doc.title);
    if (isBilingual(doc.excerpt)) patch.excerpt  = flattenText(doc.excerpt);
    if (isBilingual(doc.body))    patch.body     = flattenBlocks(doc.body);

    if (Object.keys(patch).length === 0) continue;
    await client.patch(doc._id).set(patch).commit();
    console.log(`  project ${doc._id}: ${Object.keys(patch).join(", ")} flattened`);
    patched++;
  }
  return patched;
}

async function migrateJournalEntries() {
  const docs = await client.fetch(
    `*[_type == "journalEntry"]{ _id, title, excerpt, body }`,
  );
  let patched = 0;

  for (const doc of docs) {
    const patch = {};
    if (isBilingual(doc.title))   patch.title   = flattenText(doc.title);
    if (isBilingual(doc.excerpt)) patch.excerpt  = flattenText(doc.excerpt);
    if (isBilingual(doc.body))    patch.body     = flattenBlocks(doc.body);

    if (Object.keys(patch).length === 0) continue;
    await client.patch(doc._id).set(patch).commit();
    console.log(`  journalEntry ${doc._id}: ${Object.keys(patch).join(", ")} flattened`);
    patched++;
  }
  return patched;
}

async function migrateAboutPage() {
  const docs = await client.fetch(`*[_type == "aboutPage"]{
    _id,
    introQuote, founderRoles, founderBio, monikerText,
    milestones, testimonials
  }`);
  let patched = 0;

  for (const doc of docs) {
    const patch = {};

    if (isBilingual(doc.introQuote))  patch.introQuote  = flattenText(doc.introQuote);
    if (isBilingual(doc.founderRoles)) patch.founderRoles = flattenStringArray(doc.founderRoles);
    if (isBilingual(doc.founderBio))  patch.founderBio  = flattenBlocks(doc.founderBio);
    if (isBilingual(doc.monikerText)) patch.monikerText = flattenBlocks(doc.monikerText);

    if (doc.milestones?.length) {
      const milestonesNeedPatch = doc.milestones.some(
        (m) => isBilingual(m.title) || isBilingual(m.text),
      );
      if (milestonesNeedPatch) {
        patch.milestones = doc.milestones.map((m) => ({
          ...m,
          title: isBilingual(m.title) ? flattenText(m.title) : m.title,
          text:  isBilingual(m.text)  ? flattenText(m.text)  : m.text,
        }));
      }
    }

    if (doc.testimonials?.length) {
      const testimonialsNeedPatch = doc.testimonials.some((t) =>
        isBilingual(t.quote),
      );
      if (testimonialsNeedPatch) {
        patch.testimonials = doc.testimonials.map((t) => ({
          ...t,
          quote: isBilingual(t.quote) ? flattenText(t.quote) : t.quote,
        }));
      }
    }

    if (Object.keys(patch).length === 0) continue;
    await client.patch(doc._id).set(patch).commit();
    console.log(`  aboutPage ${doc._id}: ${Object.keys(patch).join(", ")} flattened`);
    patched++;
  }
  return patched;
}

async function migrateContactPage() {
  const docs = await client.fetch(
    `*[_type == "contactPage"]{ _id, heading, subheading, reasons }`,
  );
  let patched = 0;

  for (const doc of docs) {
    const patch = {};

    if (isBilingual(doc.heading))    patch.heading    = flattenText(doc.heading);
    if (isBilingual(doc.subheading)) patch.subheading = flattenText(doc.subheading);

    // reasons was an array of { en, pa } objects → flatten to array of strings
    if (doc.reasons?.length && doc.reasons.some((r) => isBilingual(r))) {
      patch.reasons = doc.reasons.map((r) =>
        isBilingual(r) ? (flattenText(r) ?? "") : r,
      );
    }

    if (Object.keys(patch).length === 0) continue;
    await client.patch(doc._id).set(patch).commit();
    console.log(`  contactPage ${doc._id}: ${Object.keys(patch).join(", ")} flattened`);
    patched++;
  }
  return patched;
}

async function migrateSiteSettings() {
  const docs = await client.fetch(
    `*[_type == "siteSettings"]{ _id, tagline, footerText }`,
  );
  let patched = 0;

  for (const doc of docs) {
    const patch = {};
    if (isBilingual(doc.tagline))    patch.tagline    = flattenText(doc.tagline);
    if (isBilingual(doc.footerText)) patch.footerText = flattenText(doc.footerText);

    if (Object.keys(patch).length === 0) continue;
    await client.patch(doc._id).set(patch).commit();
    console.log(`  siteSettings ${doc._id}: ${Object.keys(patch).join(", ")} flattened`);
    patched++;
  }
  return patched;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    `\nFlattening bilingual fields in ${projectId}/${dataset}…\n`,
  );

  const results = await Promise.all([
    migrateNavigation().then((n)    => ({ type: "navigation",   n })),
    migrateHeroSlides().then((n)    => ({ type: "heroSlide",    n })),
    migrateProjects().then((n)      => ({ type: "project",      n })),
    migrateJournalEntries().then((n)=> ({ type: "journalEntry", n })),
    migrateAboutPage().then((n)     => ({ type: "aboutPage",    n })),
    migrateContactPage().then((n)   => ({ type: "contactPage",  n })),
    migrateSiteSettings().then((n)  => ({ type: "siteSettings", n })),
  ]);

  console.log("\n── Summary ──────────────────────────────────────────────");
  let total = 0;
  for (const { type, n } of results) {
    console.log(`  ${type.padEnd(16)} ${n} document(s) patched`);
    total += n;
  }
  console.log(`\n  Total: ${total} document(s) patched`);
  console.log("\nMigration complete. Re-run any time — it is idempotent.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
