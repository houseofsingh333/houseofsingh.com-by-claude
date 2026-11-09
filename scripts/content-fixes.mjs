#!/usr/bin/env node
/**
 * scripts/content-fixes.mjs
 *
 * Content fixes in Sanity, prepared for Maninder's approval. By default it
 * is a dry run: it reads the live content, prints every change it would
 * make (where, what is there now, what it would become) and changes
 * nothing. Nothing is written unless BOTH are true:
 *   1. it is run with --apply, and
 *   2. a Sanity write token is in the environment (SANITY_WRITE_TOKEN or
 *      SANITY_API_TOKEN). The token is never stored in the repository.
 *
 * What it covers:
 *   A. Search descriptions: the home page (Site Settings, Default Meta
 *      Description), the journal entries and projects proposed in the read
 *      only report of 7 Nov (each entry's SEO, Meta Description), and the
 *      stray leading space on two older descriptions.
 *   B. Search titles: the second "Sakura" entry gains its year; Ik Onkar's
 *      title matches its heading.
 *   C. Zamana: the stray "hi" at the end of its intro.
 *   D. The Journal line under its heading: "A diary in photographs."
 *   E. Draft excerpts for Sifti da Ghar, 35 Akhri and Sikhs in the 6ix,
 *      written to a DRAFT of each project, so nothing shows on the site
 *      until Maninder reads it in the Studio and presses Publish.
 *   F. The four unused project category documents, deleted (only if still
 *      referenced by nothing at the moment of applying).
 *
 * A change whose field already holds the new value is skipped, so running
 * it twice changes nothing twice.
 *
 * Usage
 *   node scripts/content-fixes.mjs            (dry run, needs no token)
 *   SANITY_WRITE_TOKEN=... node scripts/content-fixes.mjs --apply
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
const apply = process.argv.includes("--apply");

for (const a of process.argv.slice(2)) {
  if (a !== "--apply") {
    console.error(`\nI do not understand "${a}". Run with no options for a dry run, or --apply to write.\n`);
    process.exit(1);
  }
}
if (apply && !token) {
  console.error("\n--apply needs a Sanity write token in SANITY_WRITE_TOKEN (or SANITY_API_TOKEN). Nothing was changed.\n");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  // With a token: the live API, drafts included. Without one (a dry run):
  // the public, published content from the CDN.
  useCdn: !token,
  ...(token ? { token, perspective: "raw" } : {}),
});

// ——— The proposed values (from the read only report of 7 Nov) ———

const HOME_DESCRIPTION =
  "House of Singh is the creative world of Maninder Singh, a Toronto based creative director and photographer working across design and photography.";

/** Journal entries, by address name: the proposed search description. */
const JOURNAL_DESCRIPTIONS = {
  "the-edge":
    "Turquoise water at the edge of the Bruce Peninsula in Tobermory, Ontario. A personal journal entry and photograph by Maninder Singh.",
  "two-people-one-sidewalk":
    "A candid moment outside a New York City flower shop, and a note on observation and patience. Street photography by Maninder Singh.",
  "cone-and-calm":
    "Ice cream and a perfectly round tree on Vancouver Island. A House of Singh entry on slowing down and calling it a good day.",
  "pink-burial":
    "A pink winter sunset after heavy snowfall in Mississauga, Ontario. Maninder Singh on winter, patience, and finding beauty in the chaos.",
  "grain-and-grin":
    "A candid sepia portrait of Maninder Singh under a spring tree. A reflective entry on looking back and finding lightness in unexpected places.",
  "before-every-trip":
    "One Fujifilm body and a 23mm lens. House of Singh on sticking with one camera system, and why gear loyalty matters more than upgrades.",
  "earned-this-view":
    "From the driving range to Royal Ontario Golf Club in one year. A House of Singh entry on golf, discipline, and showing up regardless.",
  "sakura":
    "Cherry blossom season in Toronto. A reflective entry by Maninder Singh on impermanence, and on photographing something that never stays.",
  "lodge-weather":
    "Whistler Village in spring: stone, timber, and mountains that feel like a film set. A House of Singh entry on architecture and travel.",
  "between-towers":
    "The CN Tower framed between condos on a snowy January night in Toronto. Maninder Singh on home, winter, and night photography.",
  "edge-point":
    "A forest lookout in Vancouver with snow capped mountains in the distance. A reflective entry on nature and photography by Maninder Singh.",
  "morning-decision":
    "Maninder Singh lays out his full turban collection. A journal entry on Sikh identity, colour, and the first creative choice of the day.",
  "summer-shelf":
    "Kayaks lined up on the Toronto waterfront like a colour palette. A House of Singh entry on noticing design in everyday places.",
  "old-bark":
    "A portrait against an old tree at golden hour. A House of Singh journal entry on showing up without performing, by Maninder Singh.",
  "that-corner-in-gastown":
    "Photographing the Hotel Europe in Gastown, Vancouver. A reflective entry by Maninder Singh on architecture, light, and quiet observation.",
  "plum-crazy":
    "Purple turban, purple Hellcat Redeye, zero planning. A House of Singh journal entry on colour, cars, and accidental coordination.",
  "darbar-sahib":
    "Darbar Sahib at night, the Golden Temple in Amritsar reflected in the sarovar. On returning to a place that never loses its weight.",
  "the-chief":
    "The Stawamus Chief in Squamish, on the Sea to Sky Highway. A reflective entry on nature and perspective by Maninder Singh.",
  "house-meets-house":
    "Standing under The House of Chester sign on Vancouver Island. A House of Singh entry on coincidence, travel, and building something in your name.",
  "first-swings":
    "Early days learning golf at a driving range in Mississauga. A House of Singh entry on discipline, mental clarity, and starting something new.",
  "a-decade-of-listening":
    "Learning the dilruba during the pandemic, after years of listening to Jatinder Singh Durhailay. Maninder Singh on patience and Sikh music.",
  "golden-haze":
    "The Vancouver skyline from a mountain lookout at golden hour. A reflective entry on travel and photography by Maninder Singh.",
  "kayak-view":
    "Kayaking in Tobermory as the ferry passes by. A House of Singh journal entry on slowing down and seeing Ontario from the water, by Maninder Singh.",
  "still-paddling":
    "Kayaking at Deep Cove in Vancouver, surrounded by mountains. A House of Singh journal entry on stillness, water, and being present.",
  "dock-raga":
    "A dilruba on a dock at golden hour. House of Singh on taking music outside, and the moment an instrument starts to feel like yours.",
  "found-advice":
    "A postcard from Whistler that said the right thing at the right time. House of Singh on travel, intuition, and listening to small messages.",
  "blue-hour-sailing":
    "The sunset return on BC Ferries from Vancouver Island. Maninder Singh on booking the late crossing, and why the ride home is the best part.",
  "no-signal":
    "Somewhere deep in British Columbia. Maninder Singh on rivers, road trips, and putting the camera down. A reflective House of Singh entry.",
  "good-earth":
    "Green chairs set out in the February cold outside a downtown coffeehouse. A quiet entry from the House of Singh journal by Maninder Singh.",
  "mending":
    "Restringing loose beads while the coffee went cold, caught by someone else. On small repairs and their own kind of quiet. By Maninder Singh.",
  "interlude":
    "A dilruba resting in a dandelion field, and a lesson in letting sound go. From the House of Singh journal by Maninder Singh, Toronto.",
  "ik-onkar":
    "Ik Onkar, the opening words of the faith I was raised in, drawn by hand one stroke at a time. A House of Singh entry by Maninder Singh.",
  "two-sails":
    "Two sailboats out on the first open water of the season. A quiet entry from the House of Singh journal by Maninder Singh, Toronto.",
};

/** Projects, by address name: the proposed search description. */
const PROJECT_DESCRIPTIONS = {
  "sikhs-in-the-6ix":
    "Sikhs in the 6ix, an upcoming portrait series by House of Singh documenting Sikh identity, style, and presence across Toronto.",
  "sifti-da-ghar":
    "Sifti da Ghar, a photography project from House of Singh by Maninder Singh, creative director, photographer and multidisciplinary designer.",
  "35-akhri":
    "35 Akhri, a collaboration from House of Singh: one collection bringing together the work of 35 photographers, presented by Maninder Singh.",
};

/** Older entries whose legacy description starts with a space. */
const LEADING_SPACE = ["before-every-trip", "dock-raga"];

const TITLES = {
  // The 2024 entry: "sakura" (21 April 2021) keeps "Sakura | House of Singh Journal".
  "sakura-2024": "Sakura 2024 | House of Singh Journal",
  // The heading is "Ik Onkar"; the search title still said "Line work".
  "ik-onkar": "Ik Onkar | House of Singh Journal",
};

const JOURNAL_TAGLINE = "A diary in photographs.";

/**
 * DRAFTS for approval, from each project's own page text. Written to a draft
 * of the project, never to the published document.
 */
const DRAFT_EXCERPTS = {
  // From its intro: "A portrait series documenting Sikh identity, style, and presence across Toronto."
  "sikhs-in-the-6ix": "An upcoming portrait series documenting Sikh identity, style, and presence across Toronto.",
  // From its excerpt "35 Photographers" and its text "35 photographer collection".
  "35-akhri": "A collection bringing together the work of 35 photographers.",
  // The page has no text of its own: only its title and its category, Photography.
  "sifti-da-ghar": "Sifti da Ghar, a photography project by House of Singh.",
};

const UNUSED_CATEGORY_TITLES = ["Art", "Photography", "Design", "Collborations"];

// ——— Reading the live content ———

const data = await client.fetch(`{
  "settings": *[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{ _id, defaultMetaDescription, journalTagline },
  "entries": *[_type == "journalEntry" && !(_id in path("drafts.**"))]{ _id, title, "slug": slug.current, seo, seoTitle, seoDescription },
  "projects": *[_type == "project" && !(_id in path("drafts.**"))]{ _id, title, "slug": slug.current, seo, shortIntro, excerpt },
  "projectDrafts": *[_type == "project" && _id in path("drafts.**")]{ _id, excerpt },
  "categories": *[_type == "projectCategory"]{ _id, title, "refs": count(*[references(^._id)]) }
}`);

const bySlug = (list) => new Map(list.map((d) => [d.slug, d]));
const entries = bySlug(data.entries);
const projects = bySlug(data.projects);

/** Every change: where, which field, now, after, and how to write it. */
const changes = [];
const problems = [];

function change(group, doc, label, field, before, after, write) {
  if ((before ?? "") === after) return;
  changes.push({ group, id: doc._id, label, field, before, after, write });
}

const setSeo = (path, value) => (tx, id) =>
  tx.patch(id, (p) => p.setIfMissing({ seo: { _type: "seo" } }).set({ [path]: value }));

// A. Search descriptions
change("A", data.settings, "Home (Site Settings)", "defaultMetaDescription", data.settings?.defaultMetaDescription, HOME_DESCRIPTION, (tx, id) =>
  tx.patch(id, (p) => p.set({ defaultMetaDescription: HOME_DESCRIPTION })),
);
for (const [slug, value] of Object.entries(JOURNAL_DESCRIPTIONS)) {
  const doc = entries.get(slug);
  if (!doc) { problems.push(`journal entry "${slug}" not found`); continue; }
  const now = doc.seo?.metaDescription ?? doc.seoDescription ?? null;
  change("A", doc, `Journal: ${doc.title} (/journal/${slug})`, "seo.metaDescription", now, value, setSeo("seo.metaDescription", value));
}
for (const slug of LEADING_SPACE) {
  const doc = entries.get(slug);
  if (!doc?.seoDescription) continue;
  const trimmed = doc.seoDescription.trim();
  change("A", doc, `Journal: ${doc.title} (/journal/${slug}), older description field`, "seoDescription", doc.seoDescription, trimmed, (tx, id) =>
    tx.patch(id, (p) => p.set({ seoDescription: trimmed })),
  );
}
for (const [slug, value] of Object.entries(PROJECT_DESCRIPTIONS)) {
  const doc = projects.get(slug);
  if (!doc) { problems.push(`project "${slug}" not found`); continue; }
  change("A", doc, `Project: ${doc.title} (/projects/${slug})`, "seo.metaDescription", doc.seo?.metaDescription ?? null, value, setSeo("seo.metaDescription", value));
}

// B. Search titles
for (const [slug, value] of Object.entries(TITLES)) {
  const doc = entries.get(slug);
  if (!doc) { problems.push(`journal entry "${slug}" not found`); continue; }
  const now = doc.seo?.metaTitle ?? doc.seoTitle ?? null;
  change("B", doc, `Journal: ${doc.title} (/journal/${slug})`, "seo.metaTitle", now, value, setSeo("seo.metaTitle", value));
}

// C. Zamana's stray "hi"
{
  const doc = projects.get("zamana");
  const now = doc?.shortIntro ?? "";
  if (/\s+hi\s*$/.test(now)) {
    const fixed = now.replace(/\s+hi\s*$/, "");
    change("C", doc, "Project: Zamana (/projects/zamana), the intro", "shortIntro", now, fixed, (tx, id) => tx.patch(id, (p) => p.set({ shortIntro: fixed })));
  }
}

// D. The Journal line
change("D", data.settings, "Journal page, the line under its heading (Site Settings)", "journalTagline", data.settings?.journalTagline ?? null, JOURNAL_TAGLINE, (tx, id) =>
  tx.patch(id, (p) => p.set({ journalTagline: JOURNAL_TAGLINE })),
);

// E. Draft excerpts (to a draft of each project)
const drafts = new Map(data.projectDrafts.map((d) => [d._id, d]));
for (const [slug, value] of Object.entries(DRAFT_EXCERPTS)) {
  const doc = projects.get(slug);
  if (!doc) { problems.push(`project "${slug}" not found`); continue; }
  const draftId = `drafts.${doc._id}`;
  const now = drafts.get(draftId)?.excerpt ?? doc.excerpt ?? null;
  change("E", { _id: draftId }, `Project: ${doc.title} (/projects/${slug}), DRAFT for approval`, "excerpt", now, value, async (tx, id) => {
    if (!drafts.has(id)) {
      // Start the draft from the published project, so only the excerpt differs.
      const published = await client.getDocument(doc._id);
      tx.createIfNotExists({ ...published, _id: id });
    }
    tx.patch(id, (p) => p.set({ excerpt: value }));
  });
}

// F. Unused project categories
for (const title of UNUSED_CATEGORY_TITLES) {
  const doc = data.categories.find((c) => c.title === title);
  if (!doc) continue;
  if (doc.refs > 0) { problems.push(`project category "${title}" is referenced by ${doc.refs} document(s), so it is kept`); continue; }
  changes.push({ group: "F", id: doc._id, label: `Project category: ${title}`, field: "(whole document)", before: "exists, referenced by nothing", after: "deleted", write: (tx, id) => tx.delete(id) });
}

// ——— Report ———

const GROUPS = {
  A: "Search descriptions",
  B: "Search titles",
  C: "Zamana's intro",
  D: "Journal line",
  E: "Draft excerpts (to drafts, for approval)",
  F: "Unused project categories",
};
const show = (v) => (v === null || v === undefined || v === "" ? "(empty)" : JSON.stringify(v));
const len = (v) => (typeof v === "string" ? ` [${v.length} characters]` : "");

console.log(`\nContent fixes for Sanity ${projectId}/${dataset}: ${apply ? "APPLYING" : "DRY RUN, nothing is changed"}\n`);
for (const [group, title] of Object.entries(GROUPS)) {
  const list = changes.filter((c) => c.group === group);
  console.log(`${group}. ${title}: ${list.length} change${list.length === 1 ? "" : "s"}`);
  for (const c of list) {
    console.log(`\n  ${c.label}`);
    console.log(`    document  ${c.id}`);
    console.log(`    field     ${c.field}`);
    console.log(`    now       ${show(c.before)}${len(c.before)}`);
    console.log(`    becomes   ${show(c.after)}${len(c.after)}`);
    if (c.field === "seo.metaDescription" && (c.after.length < 120 || c.after.length > 155)) {
      console.log("    note      outside 120 to 155 characters");
    }
  }
  console.log("");
}
if (problems.length) {
  console.log("Not changed:");
  for (const p of problems) console.log(`  ${p}`);
  console.log("");
}
console.log(`${changes.length} changes in total.`);

if (!apply) {
  console.log("Dry run: nothing was written. To apply, after approval:\n  SANITY_WRITE_TOKEN=... node scripts/content-fixes.mjs --apply\n");
  process.exit(0);
}

const tx = client.transaction();
for (const c of changes) await c.write(tx, c.id);
const result = await tx.commit({ visibility: "sync" });
console.log(`\nApplied ${changes.length} changes in one transaction (${result.transactionId}).`);
console.log("The draft excerpts are drafts: open each project in the Studio, read it, and press Publish.\n");
