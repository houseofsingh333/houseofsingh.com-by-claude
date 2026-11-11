#!/usr/bin/env node
/**
 * Brings the sample content (test data) up to the Shop design rounds 1
 * and 2: Collection 01 opens at 7 pm in Toronto on 13 April 2027, with
 * the line "Released on the eve of Vaisakhi" and the sentence "Prints,
 * clothing and objects. Released once, never restocked."; In the making
 * shows the three latest Journal entries (if none are chosen yet); and the
 * sample shipping table gains India as a zone (from Canada and from
 * India), and "Made with" for the two sample pieces made with a workshop
 * (Shop design round 3). Changes only those fields, so an early access code generated in
 * the Studio, sold counts and everything else stay as they are.
 *
 *   SANITY_WRITE_TOKEN=... node scripts/editions-sample-update.mjs           looks only
 *   SANITY_WRITE_TOKEN=... node scripts/editions-sample-update.mjs --apply   changes them
 */
import { createClient } from "@sanity/client";

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
if (!token) {
  console.error("No write token. Set SANITY_WRITE_TOKEN first.");
  process.exit(1);
}
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});
const apply = process.argv.includes("--apply");

const COLLECTION = "editions-test-collection-01";
const OPENS = "2027-04-13T23:00:00Z";
const INTRO = "Prints, clothing and objects. Released once, never restocked.";
const RELEASE_LINE = "Released on the eve of Vaisakhi";
const band = (key, upToKg, price) => ({ _type: "band", _key: key, upToKg, price });
const INDIA_ROUTES = [
  { _type: "route", _key: "ci", origin: "canada", zone: "india", bands: [band("a", 1, 34), band("b", 3, 52)] },
  { _type: "route", _key: "ii", origin: "india", zone: "india", bands: [band("a", 1, 8), band("b", 3, 14)] },
];

const [collection, shipping] = await Promise.all([
  client.fetch(`*[_id == $id][0]{ _id, opens, intro, releaseLine, "journal": count(journalEntries), isTestData }`, { id: COLLECTION }),
  client.fetch(`*[_id == "editionsShipping"][0]{ _id, routes[]{ _key, origin, zone } }`),
]);

const tx = client.transaction();
let changes = 0;

if (!collection) console.log("Collection 01 (sample) not found: nothing to change there.");
else if (!collection.isTestData) console.log("Collection 01 is not marked as test data: left alone.");
else {
  const set = {};
  if (collection.opens !== OPENS) {
    console.log(`Collection 01 opens: ${collection.opens} → ${OPENS} (7 pm Toronto, 13 April 2027)`);
    set.opens = OPENS;
  }
  if (collection.intro !== INTRO) {
    console.log(`Collection 01 sentence → "${INTRO}"`);
    set.intro = INTRO;
  }
  if (collection.releaseLine !== RELEASE_LINE) {
    console.log(`Collection 01 line before the release → "${RELEASE_LINE}"`);
    set.releaseLine = RELEASE_LINE;
  }
  if (!collection.journal) {
    const latest = await client.fetch(`*[_type == "journalEntry" && defined(slug.current) && !(_id in path("drafts.**"))] | order(date desc)[0...3]{ _id, title }`);
    if (latest.length) {
      console.log(`In the making: ${latest.map((j) => j.title).join(", ")}`);
      set.journalEntries = latest.map((j, i) => ({ _type: "reference", _ref: j._id, _key: `j${i}` }));
    }
  }
  changes += Object.keys(set).length;
  if (Object.keys(set).length) tx.patch(COLLECTION, (p) => p.set(set));
}

if (!shipping) console.log("No shipping table: nothing to add.");
else {
  const missing = INDIA_ROUTES.filter((r) => !(shipping.routes ?? []).some((x) => x.origin === r.origin && x.zone === "india"));
  for (const r of missing) console.log(`Shipping: add ${r.origin} to India (sample prices ${r.bands.map((b) => `$${b.price}`).join(", ")})`);
  if (missing.length) {
    tx.patch("editionsShipping", (p) => p.setIfMissing({ routes: [] }).append("routes", missing));
    changes += missing.length;
  }
}

// Made by (round 3): the sample pieces made with a workshop that has no page.
const MADE_WITH = { "editions-test-piece-8": "a bindery in Toronto", "editions-test-piece-2": "a workshop in Ludhiana" };
const madeWith = await client.fetch(`*[_id in $ids]{ _id, madeWith, isTestData }`, { ids: Object.keys(MADE_WITH) });
for (const p of madeWith) {
  if (!p.isTestData || p.madeWith) continue;
  console.log(`${p._id}: Made with "${MADE_WITH[p._id]}"`);
  tx.patch(p._id, (patch) => patch.set({ madeWith: MADE_WITH[p._id] }));
  changes++;
}

if (!changes) console.log("Nothing to change.");
else if (!apply) console.log(`\n${changes} change(s). Nothing written: run again with --apply.`);
else {
  await tx.commit();
  console.log(`\nDone: ${changes} change(s) published.`);
}
