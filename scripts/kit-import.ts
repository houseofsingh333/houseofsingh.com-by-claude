/**
 * Moves the existing list to Kit, once (docs/email.md, "Moving to Kit").
 *
 * 1. Reads every newsletter subscriber and every Shop notify request kept
 *    privately in Sanity.
 * 2. Writes a CSV backup of them all (email, source, tag, date, consent) to
 *    a folder on this computer, outside the repository, and prints where.
 * 3. Dry run (the default): stops there, and says what it would do.
 * 4. With --apply: adds each person to Kit with their tag ("Letters" for
 *    newsletter subscribers, the Collection's title for notify requests),
 *    then checks with Kit that the person and tag are there, and only then
 *    deletes that record from Sanity. Anything not confirmed stays.
 *
 *   SANITY_WRITE_TOKEN=... KIT_API_KEY=... npx tsx scripts/kit-import.ts [--apply] [--out ~/somewhere]
 *
 * Prints counts only, never an address. The backup holds personal data:
 * keep it private, and delete it once Kit's own export has been checked.
 */
import { createClient } from "@sanity/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, sep } from "node:path";
import { kitHasTag, kitSubscribe, type ConsentKind } from "../src/lib/email/kit";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
const apply = process.argv.includes("--apply");
const outArg = process.argv.indexOf("--out");
const REPO = resolve(__dirname, "..");

type Row = { _id: string; email: string; source: "newsletter" | "notify"; tag: string; date: string; consent: string; kind: ConsentKind };

function csvCell(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

async function main() {
  if (!token) throw new Error("Set SANITY_WRITE_TOKEN (a Sanity token with write access) first.");
  if (apply && !process.env.KIT_API_KEY) throw new Error("Set KIT_API_KEY to import (or leave out --apply for a dry run).");
  const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false, perspective: "raw" });

  const docs = await client.fetch<{ _id: string; _type: string; email?: string; collection?: string; consent?: boolean; subscribedAt?: string; submittedAt?: string; _createdAt: string }[]>(
    `*[_type in ["newsletterSubscriber", "editionsNotify"] && !(_id in path("drafts.**"))]{ _id, _type, email, collection, consent, subscribedAt, submittedAt, _createdAt }`,
  );
  const rows: Row[] = docs
    .filter((d) => typeof d.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    .map((d) => {
      const date = d.subscribedAt || d.submittedAt || d._createdAt;
      if (d._type === "newsletterSubscriber") {
        return { _id: d._id, email: d.email!.trim(), source: "newsletter", tag: "Letters", date, kind: "letters", consent: `Signed up through the newsletter form on houseofsingh.com (${date})` };
      }
      const tag = /^Collection \d{2,}$/.test(d.collection ?? "") ? d.collection! : "The next Collection";
      return { _id: d._id, email: d.email!.trim(), source: "notify", tag, date, kind: "shop", consent: `${d.consent === false ? "No consent recorded" : "Asked to hear about"} ${tag} through Notify me on houseofsingh.com (${date})` };
    });

  // The backup, outside the repository.
  const folder = resolve(outArg > -1 ? process.argv[outArg + 1].replace(/^~(?=$|\/)/, homedir()) : join(homedir(), "house-of-singh-backups"));
  if (folder === REPO || folder.startsWith(REPO + sep)) throw new Error("The backup must be outside the repository (it holds personal data). Choose another --out folder.");
  mkdirSync(folder, { recursive: true });
  const file = join(folder, `subscribers-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.csv`);
  const csv = ["email,source,tag,date,consent", ...rows.map((r) => [r.email, r.source, r.tag, r.date, r.consent].map(csvCell).join(","))].join("\n") + "\n";
  writeFileSync(file, csv, { mode: 0o600 });

  const byTag = rows.reduce<Record<string, number>>((m, r) => ((m[r.tag] = (m[r.tag] ?? 0) + 1), m), {});
  console.log(`Records found: ${rows.length} (${docs.length - rows.length} without a valid email left alone).`);
  for (const [tag, n] of Object.entries(byTag)) console.log(`  ${tag}: ${n}`);
  console.log(`Backup written: ${file}`);

  if (!apply) {
    console.log("Dry run: nothing imported, nothing deleted. Run again with --apply to import into Kit.");
    return;
  }

  let imported = 0, confirmed = 0, deleted = 0, failed = 0;
  for (const r of rows) {
    try {
      await kitSubscribe({ email: r.email, tag: r.tag, kind: r.kind, consent: r.consent });
      imported++;
      if (await kitHasTag(r.email, r.tag)) {
        confirmed++;
        await client.delete(r._id);
        deleted++;
      }
    } catch {
      failed++;
    }
  }
  const left = await client.fetch<number>(`count(*[_type in ["newsletterSubscriber", "editionsNotify"] && !(_id in path("drafts.**"))])`);
  console.log(`Imported ${imported}, confirmed in Kit ${confirmed}, deleted from Sanity ${deleted}, failed ${failed}. Left in Sanity: ${left}.`);
  if (failed || imported !== confirmed) console.log("Anything not confirmed is still in Sanity; run the script again to retry it.");
}

main()
  // Exit explicitly: open connections must not keep the script waiting.
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
