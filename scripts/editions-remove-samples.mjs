#!/usr/bin/env node
/**
 * Removes every piece of sample Shop data before launch, after writing a
 * JSON backup of all of it outside the repository
 * (~/house-of-singh-backups/, or --out <folder>):
 *
 * - the test Collection, sample pieces (with their holds) and the sample
 *   artist (marked as test data, or with an id starting editions-test-);
 * - test orders (Stripe test mode), the collectors and the collector
 *   counter they created (so the first real collector is No. 0001);
 * - notify requests and proposals saved during testing (the Shop has only
 *   ever been open on previews);
 * - test email records: Shop emails waiting to send, and Shop sign ups
 *   waiting for Kit.
 *
 * It keeps: the real Collection (editions-collection-01), Shop settings,
 * shipping rates, the categories, the daily email counts, and every
 * newsletter (letters) record, which comes from the live site.
 *
 *   SANITY_WRITE_TOKEN=... node scripts/editions-remove-samples.mjs           lists, writes the backup
 *   SANITY_WRITE_TOKEN=... node scripts/editions-remove-samples.mjs --apply   the same, then deletes
 *
 * --apply deletes exactly the documents in the backup it has just written,
 * in one transaction, and refuses if any of them changed in between.
 */
import { createClient } from "@sanity/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
if (!token) {
  console.error("No write token. Run it as: SANITY_WRITE_TOKEN=... node scripts/editions-remove-samples.mjs");
  process.exit(1);
}
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
  perspective: "raw",
});
const apply = process.argv.includes("--apply");
const outArg = process.argv.indexOf("--out");

import { KEEP, SAMPLE_GROUPS as GROUPS } from "./editions-samples.mjs";

const found = [];
for (const [label, query] of GROUPS) {
  const docs = (await client.fetch(query)).filter((d) => !KEEP.includes(d._id));
  console.log(`\n${label}: ${docs.length}`);
  for (const d of docs) console.log(`  ${d._id}  ${d.name ?? d.pieceName ?? d.season ?? d.email?.subject ?? (d.email && typeof d.email === "string" ? "(an email address)" : "") ?? ""}`.replace(/\S+@\S+/g, "(an email address)"));
  found.push(...docs);
}
const unique = [...new Map(found.map((d) => [d._id, d])).values()];

// A real order still pointing at a sample piece would block the piece's removal: say so.
const ids = unique.map((d) => d._id);
const blocking = await client.fetch(`*[references($ids) && !(_id in $ids)]{ _id, _type }`, { ids });
if (blocking.length) {
  console.log(`\nStill referring to sample content, and kept (check these before --apply): ${blocking.map((b) => `${b._id} (${b._type})`).join(", ")}`);
}

const folder = resolve(outArg > -1 ? process.argv[outArg + 1].replace(/^~(?=$|\/)/, homedir()) : join(homedir(), "house-of-singh-backups"));
mkdirSync(folder, { recursive: true });
const file = join(folder, `editions-samples-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(file, JSON.stringify({ project: client.config().projectId, dataset: client.config().dataset, takenAt: new Date().toISOString(), documents: unique }, null, 2));
console.log(`\n${unique.length} documents. Backup written to ${file}`);
console.log("It holds personal data from testing (email addresses): keep it private and delete it once you are satisfied.");

if (!apply) {
  console.log("\nNothing deleted: run again with --apply.");
  process.exit(0);
}
if (!unique.length) process.exit(0);
const tx = client.transaction();
// Only what the backup holds, and only as it was when backed up.
for (const d of unique) tx.delete(d._id);
const now = await client.fetch(`*[_id in $ids]{ _id, _rev }`, { ids });
const changed = now.filter((n) => unique.find((d) => d._id === n._id)?._rev !== n._rev);
if (changed.length) {
  console.error(`\nRefused: ${changed.length} document(s) changed since the backup (${changed.map((c) => c._id).join(", ")}). Run again.`);
  process.exit(1);
}
await tx.commit();
console.log(`\nDone: ${unique.length} documents deleted. The backup is the only copy.`);
