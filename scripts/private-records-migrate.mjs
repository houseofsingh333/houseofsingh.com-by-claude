#!/usr/bin/env node
/**
 * Moves existing contact form submissions and newsletter subscribers to
 * private ids. Sanity's public dataset lets anyone read a document whose
 * id has no dot in it; these records were written that way, so names,
 * emails and phone numbers could be read by anyone who asked. From this
 * change the site writes them as "private.contact-…" and
 * "private.newsletter-…", which only a token can read. This script copies
 * each older record to a private id and deletes the public one, in one
 * transaction per record, keeping every field.
 *
 *   node scripts/private-records-migrate.mjs           look only (dry run)
 *   node scripts/private-records-migrate.mjs --apply   move them
 *
 * Needs a write token: SANITY_WRITE_TOKEN (or SANITY_API_TOKEN). Prints
 * counts only, never a name or an email.
 */
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
if (!token) {
  console.error("No write token. Set SANITY_WRITE_TOKEN first.");
  process.exit(1);
}
const apply = process.argv.includes("--apply");
const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false, perspective: "raw" });

const KINDS = { contactSubmission: "contact", newsletterSubscriber: "newsletter" };

const docs = await client.fetch(`*[_type in $types && !(_id in path("private.**")) && !(_id in path("drafts.**"))]`, { types: Object.keys(KINDS) });
const counts = Object.fromEntries(Object.keys(KINDS).map((t) => [t, docs.filter((d) => d._type === t).length]));
console.log(`Public records found: ${counts.contactSubmission} contact submissions, ${counts.newsletterSubscriber} newsletter subscribers.`);

if (!apply) {
  console.log("Dry run: nothing changed. Run again with --apply to move them.");
  process.exit(0);
}

let moved = 0;
for (const d of docs) {
  const fields = Object.fromEntries(Object.entries(d).filter(([k]) => !["_id", "_rev", "_updatedAt"].includes(k)));
  const _id = d._id;
  await client
    .transaction()
    .create({ ...fields, _id: `private.${KINDS[d._type]}-${randomUUID()}` })
    .delete(_id)
    .commit();
  moved += 1;
}
const left = await client.fetch(`count(*[_type in $types && !(_id in path("private.**"))])`, { types: Object.keys(KINDS) });
console.log(`Moved ${moved}. Public records left: ${left}.`);
process.exit(0);
