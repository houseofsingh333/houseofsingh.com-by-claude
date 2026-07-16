/**
 * scripts/delete-import-drafts.mjs
 *
 * Delete the journalEntry draft documents created by the import test batch.
 *
 * It fetches every id matching the import test patterns and deletes each one.
 * It ONLY ever deletes ids matching `drafts.journal-*` or the legacy
 * `drafts.import-journal-*` — every id is re-checked against those patterns
 * immediately before deletion, so no other journal entry (or any other
 * document) can be touched.
 *
 * Usage (run locally, with a write token)
 * ───────────────────────────────────────
 *   SANITY_PROJECT_ID=31g7gu7n \
 *   SANITY_DATASET=production \
 *   SANITY_AUTH_TOKEN=sk...   \
 *   node scripts/delete-import-drafts.mjs           # deletes them
 *   node scripts/delete-import-drafts.mjs --dry-run # lists only, deletes nothing
 *
 * The token needs write access (Editor+). Create one at
 * https://www.sanity.io/manage → project → API → Tokens.
 */

import { createClient } from "@sanity/client";

// ─── config ──────────────────────────────────────────────────────
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

// The only patterns this script is ever allowed to delete: the current
// slug-based ids (drafts.journal-*) and the legacy row-numbered ids
// (drafts.import-journal-*), so older test drafts can still be cleaned up.
const ID_PREFIXES = ["drafts.journal-", "drafts.import-journal-"];
const GROQ = `*[_type=="journalEntry" && (_id match "drafts.journal-*" || _id match "drafts.import-journal-*")]._id`;
const isSafeId = (id) =>
  typeof id === "string" && ID_PREFIXES.some((p) => id.startsWith(p));

if (!token) {
  console.error(
    "✗ Missing write token. Set SANITY_AUTH_TOKEN (or SANITY_API_TOKEN) to a token with Editor access.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

// ─── run ─────────────────────────────────────────────────────────
const ids = await client.fetch(GROQ);

if (!Array.isArray(ids) || ids.length === 0) {
  console.log(
    `\nNothing to delete — no journalEntry documents match ${ID_PREFIXES.map((p) => `"${p}*"`).join(" or ")} in ${projectId}/${dataset}.\n`,
  );
  process.exit(0);
}

console.log(
  `\n${dryRun ? "DRY RUN — " : ""}Found ${ids.length} import draft(s) in ${projectId}/${dataset}:\n`,
);

let deleted = 0;
let skipped = 0;

for (const id of ids) {
  // Defence in depth: never delete anything outside the import pattern.
  if (!isSafeId(id)) {
    console.log(`  ⃠ SKIP (matches no allowed prefix): ${id}`);
    skipped++;
    continue;
  }

  if (dryRun) {
    console.log(`  • would delete: ${id}`);
    deleted++;
    continue;
  }

  await client.delete(id);
  console.log(`  ✓ deleted: ${id}`);
  deleted++;
}

console.log("\n===== SUMMARY =====");
console.log(
  `${dryRun ? "Would delete" : "Deleted"} ${deleted} import draft(s)${
    skipped ? `; skipped ${skipped} non-matching id(s)` : ""
  }.\n`,
);
