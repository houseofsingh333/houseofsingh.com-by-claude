#!/usr/bin/env node
/**
 * Shop design round 1, the sample content only (test data): Collection 01
 * opens at 9 pm in Toronto on 13 April 2027 (6:30 am on 14 April in
 * India), its sentence is in the first person ("makers I trust"), and the
 * sample shipping table gains India as a zone (from Canada and from
 * India). Changes only those fields, so an early access code generated in
 * the Studio, sold counts and everything else stay as they are.
 *
 *   SANITY_WRITE_TOKEN=... node scripts/editions-round1.mjs           looks only
 *   SANITY_WRITE_TOKEN=... node scripts/editions-round1.mjs --apply   changes them
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
const OPENS = "2027-04-14T01:00:00Z";
const INTRO = "Eight pieces for Vaisakhi: prints, clothing and objects, some made by hand, some with makers I trust. Released once, never restocked.";
const band = (key, upToKg, price) => ({ _type: "band", _key: key, upToKg, price });
const INDIA_ROUTES = [
  { _type: "route", _key: "ci", origin: "canada", zone: "india", bands: [band("a", 1, 34), band("b", 3, 52)] },
  { _type: "route", _key: "ii", origin: "india", zone: "india", bands: [band("a", 1, 8), band("b", 3, 14)] },
];

const [collection, shipping] = await Promise.all([
  client.fetch(`*[_id == $id][0]{ _id, opens, intro, isTestData }`, { id: COLLECTION }),
  client.fetch(`*[_id == "editionsShipping"][0]{ _id, routes[]{ _key, origin, zone } }`),
]);

const tx = client.transaction();
let changes = 0;

if (!collection) console.log("Collection 01 (sample) not found: nothing to change there.");
else if (!collection.isTestData) console.log("Collection 01 is not marked as test data: left alone.");
else {
  if (collection.opens !== OPENS) {
    console.log(`Collection 01 opens: ${collection.opens} → ${OPENS} (9 pm Toronto, 13 April 2027)`);
    changes++;
  }
  if (collection.intro !== INTRO) {
    console.log(`Collection 01 sentence → "${INTRO}"`);
    changes++;
  }
  tx.patch(COLLECTION, (p) => p.set({ opens: OPENS, intro: INTRO }));
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

if (!changes) console.log("Nothing to change.");
else if (!apply) console.log(`\n${changes} change(s). Nothing written: run again with --apply.`);
else {
  await tx.commit();
  console.log(`\nDone: ${changes} change(s) published.`);
}
