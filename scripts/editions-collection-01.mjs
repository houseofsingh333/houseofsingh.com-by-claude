#!/usr/bin/env node
/**
 * Creates the real Collection 01 (not test data), for the sealed Shop on
 * the live site: released at 7 pm in Toronto on 13 April 2027, the line
 * "Released on the eve of Vaisakhi", the sentence, open until the end of
 * 30 May 2027 in Toronto, no pieces and no In the making entries yet (the
 * section hides itself). Early access opens 24 hours before the release,
 * as How the release works says; it needs a code generated in the Studio.
 *
 *   SANITY_WRITE_TOKEN=... node scripts/editions-collection-01.mjs           looks only
 *   SANITY_WRITE_TOKEN=... node scripts/editions-collection-01.mjs --apply   creates it
 *
 * Run again at any time: it sets these fields and leaves everything else
 * (an early access code, a closing line, Journal entries) as it is.
 */
import { createClient } from "@sanity/client";

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
if (!token) {
  console.error("No write token. Run it as: SANITY_WRITE_TOKEN=... node scripts/editions-collection-01.mjs");
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

export const COLLECTION_01 = {
  _id: "editions-collection-01",
  _type: "editionsCollection",
  number: 1,
  season: "Vaisakhi 2027",
  colour: "saffron",
  releaseLine: "Released on the eve of Vaisakhi",
  intro: "Prints, clothing and objects. Released once, never restocked.",
  // 7 pm in Toronto on 13 April 2027 (EDT, UTC-4).
  opens: "2027-04-13T23:00:00Z",
  // 24 hours before, for those with the early access link.
  earlyAccessOpens: "2027-04-12T23:00:00Z",
  // The end of 30 May 2027 in Toronto.
  closes: "2027-05-31T03:59:00Z",
  isTestData: false,
};

const existing = await client.fetch(`*[_id == $id][0]`, { id: COLLECTION_01._id });
const others = await client.fetch(`*[_type == "editionsCollection" && number == 1 && _id != $id && !(_id in path("drafts.**"))]{ _id, isTestData }`, { id: COLLECTION_01._id });

console.log(existing ? "Collection 01 exists: these fields will be set." : "Collection 01 will be created:");
for (const [k, v] of Object.entries(COLLECTION_01)) if (!k.startsWith("_")) console.log(`  ${k}: ${JSON.stringify(v)}`);
if (others.length) {
  console.log(`\nNote: another Collection numbered 1 exists (${others.map((o) => `${o._id}${o.isTestData ? ", test data" : ""}`).join("; ")}).`);
  console.log("Remove the sample content first (scripts/editions-remove-samples.mjs) so the Shop shows only the real one.");
}

if (!apply) {
  console.log("\nNothing written: run again with --apply.");
  process.exit(0);
}
const { _id, _type, ...fields } = COLLECTION_01;
await client.transaction().createIfNotExists({ _id, _type, ...fields }).patch(_id, (p) => p.set(fields)).commit();
console.log(`\nDone: ${_id} ${existing ? "updated" : "created"} and published.`);
