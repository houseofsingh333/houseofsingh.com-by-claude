#!/usr/bin/env node
/**
 * scripts/add-project-photos.mjs
 *
 * Adds a folder of photographs to a project's "Photographs" list in Sanity,
 * in file name order (01-car.jpg, 02-tailoring.jpg, ...). It creates the
 * project if it does not exist yet, or adds to it if it does. Each
 * photograph gets a drafted alt text, made from its file name and the
 * project's title, for Maninder to read and correct before publishing.
 * Everything lands in a DRAFT of the project: nothing appears on the
 * website until the draft is published in the Studio.
 *
 * Layout is left on Auto, so the page lays the photographs out from their
 * shapes. Photographs already in the list (same original file name) are
 * skipped, so running it twice adds nothing twice.
 *
 * Plain English guide: docs/add-project-photos.md
 *
 * Usage
 *   node scripts/add-project-photos.mjs <folder> --project <slug> [--title "Project title"] [--dry-run]
 *
 *   <folder>          the folder of photographs (jpg, jpeg, png, webp, tif, tiff, gif)
 *   --project <slug>  the project's address name, for example zamana
 *   --title <title>   the project's title, only needed for a new project
 *   --dry-run         show what would happen; upload and change nothing
 *
 * The write token comes from the environment: SANITY_WRITE_TOKEN (or
 * SANITY_API_TOKEN). It is never stored in the repository. A dry run needs
 * no token.
 */

import { createClient } from "@sanity/client";
import { createReadStream, readdirSync, statSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const PHOTO = /\.(jpe?g|png|webp|tiff?|gif)$/i;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function args(argv) {
  const out = { folder: null, project: null, title: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project") out.project = argv[++i];
    else if (a === "--title") out.title = argv[++i];
    else if (a === "--dry-run") out.dryRun = true;
    else if (!a.startsWith("--") && !out.folder) out.folder = a;
    else fail(`I do not understand "${a}". See the top of scripts/add-project-photos.mjs.`);
  }
  return out;
}

/** "02-the_tailoring.jpg" becomes "the tailoring". */
export function describe(file) {
  return basename(file, extname(file))
    .replace(/^[\d\s._-]+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** A drafted alt text, to be read and corrected before publishing. */
export function draftAlt(file, title) {
  const words = describe(file);
  return words ? `${title}: ${words}` : `${title}: photograph`;
}

/** File name order, with numbers compared as numbers (2 before 10). */
const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" }).compare;

async function main() {
  const opts = args(process.argv.slice(2));
  if (!opts.folder || !opts.project) fail("Please give a folder and a project, for example:\n  node scripts/add-project-photos.mjs ~/Pictures/Zamana --project zamana --dry-run");
  const folder = resolve(opts.folder);
  if (!existsSync(folder) || !statSync(folder).isDirectory()) fail(`There is no folder at ${folder}.`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(opts.project)) fail(`"${opts.project}" is not a project address name (lowercase letters, numbers and single hyphens).`);
  if (!opts.dryRun && !token) fail("No write token. Set SANITY_WRITE_TOKEN first (docs/add-project-photos.md explains how), or add --dry-run to only look.");

  const files = readdirSync(folder).filter((f) => PHOTO.test(f) && !f.startsWith(".")).sort(byName);
  if (!files.length) fail(`No photographs in ${folder} (jpg, jpeg, png, webp, tif, tiff or gif).`);

  // A dry run only reads, from the public CDN; a real run reads and writes with the token.
  const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token: token || undefined, useCdn: !token });
  const found = await client.fetch(
    `*[_type == "project" && slug.current == $slug] | order(_id desc)[0]{ _id, title, "files": photographs[].asset->originalFilename }`,
    { slug: opts.project },
  );
  const title = found?.title || opts.title;
  if (!title) fail(`There is no project "${opts.project}" yet. To create it, add its title: --title "Its title"`);
  const baseId = found ? found._id.replace(/^drafts\./, "") : `project-${opts.project}`;
  const draftId = `drafts.${baseId}`;
  const already = new Set((found?.files ?? []).filter(Boolean));
  const todo = files.filter((f) => !already.has(f));

  console.log(`\nProject: ${title} (${opts.project}) ${found ? "exists, photographs will be added to it" : "is new and will be created"}`);
  console.log(`Folder: ${folder}`);
  console.log(`${files.length} photographs found, ${todo.length} to add${already.size ? `, ${files.length - todo.length} already there` : ""}.\n`);
  todo.forEach((f, i) => {
    const kb = Math.round(statSync(join(folder, f)).size / 1024);
    console.log(`  ${String(i + 1).padStart(2, " ")}. ${f} (${kb} KB)\n      alt text, to check: "${draftAlt(f, title)}"`);
  });

  if (opts.dryRun) {
    console.log(`\nDry run: nothing was uploaded or changed. Run again without --dry-run to add them to a draft of the project.\n`);
    return;
  }
  if (!todo.length) {
    console.log("\nNothing new to add.\n");
    return;
  }

  // Make sure there is a draft to add to (a copy of the published project, or a new one).
  const published = found ? await client.getDocument(baseId) : null;
  const draft = await client.getDocument(draftId);
  if (!draft) {
    await client.createIfNotExists(
      published
        ? { ...published, _id: draftId }
        : { _id: draftId, _type: "project", title, slug: { _type: "slug", current: opts.project } },
    );
  }

  const items = [];
  for (const [i, f] of todo.entries()) {
    process.stdout.write(`Uploading ${i + 1} of ${todo.length}: ${f} ... `);
    const asset = await client.assets.upload("image", createReadStream(join(folder, f)), { filename: f });
    items.push({
      _type: "image",
      _key: randomUUID().replace(/-/g, "").slice(0, 12),
      asset: { _type: "reference", _ref: asset._id },
      alt: draftAlt(f, title),
      layout: "auto",
    });
    console.log("done");
  }
  await client.patch(draftId).setIfMissing({ photographs: [] }).append("photographs", items).commit();

  console.log(`\nAdded ${items.length} photographs to a draft of "${title}".`);
  console.log("Next: open the project in the Studio, read each alt text and correct it, add captions if you like, then Publish.\n");
}

main().catch((e) => fail(`Something went wrong: ${e.message}`));
