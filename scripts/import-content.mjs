#!/usr/bin/env node
/**
 * scripts/import-content.mjs
 *
 * One tool for the HOS-content folder: the homepage hero slides, projects,
 * Journal entries, the Journey, Featured on and the Shop's artists. Each
 * item is a folder holding an item.md (front matter, then Markdown text)
 * and its photographs. Plain English guide: docs/content-import.md;
 * a template item.md per section: docs/content-import/.
 *
 *   node scripts/import-content.mjs <HOS-content folder>              dry run: shows everything, changes nothing
 *   node scripts/import-content.mjs <HOS-content folder> --apply      publishes the changes
 *
 *   --only <list>   limit the run: a section, or section/item, comma separated
 *                   (for example --only projects/zamana,hero)
 *   --replace       also remove what the folder no longer has: photographs
 *                   and items missing from it are deleted (shown first in
 *                   the dry run). Without it nothing is ever deleted.
 *
 * Items are matched by their address (slug) or, where there is none, by
 * their caption (slides) or year and title (Journey); a match is updated,
 * never duplicated. Photographs are prepared as in scripts/photo-prep.mjs
 * (JPEG quality 83, progressive, colour profile kept, location and camera
 * metadata removed) and checked; a hero under 1600px wide is refused.
 *
 * The write token comes only from SANITY_WRITE_TOKEN; it is never stored.
 */
import { createClient } from "@sanity/client";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { itemFolders, readItem } from "./import/read.mjs";
import { markdownToBlocks } from "./import/markdown.mjs";
import { SECTIONS, LATER } from "./import/sections.mjs";
import { preparePhoto, loadSharp, kb } from "./photo-prep.mjs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || "";
const hasToken = () => !!token;
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

export function parseArgs(argv) {
  const out = { folder: null, apply: false, replace: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") out.apply = true;
    else if (a === "--replace") out.replace = true;
    else if (a === "--only") out.only = String(argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--dry-run") out.apply = false;
    else if (!a.startsWith("--") && !out.folder) out.folder = a;
    else fail(`I do not understand "${a}". See the top of scripts/import-content.mjs.`);
  }
  return out;
}

/** Whether --only lets this section (and item) through. */
function wanted(only, section, slug) {
  if (!only) return true;
  return only.some((o) => o === section || o === `${section}/${slug}`);
}

/** Which image fields each role may carry (as in the schema). */
const IMAGE_FIELDS = {
  "hero:image": ["alt"],
  "projects:coverImage": ["alt", "isDecorative"],
  "projects:photographs": ["alt", "isDecorative", "caption", "layout"],
  "journal:coverImage": ["alt", "isDecorative", "caption"],
  "journal:body": ["alt", "isDecorative", "caption"],
  "journey:image": ["alt", "isDecorative"],
  "featured:logo": [],
  "featured:image": ["alt", "isDecorative"],
  "collaborators:portrait": ["alt"],
};

function imageValue(section, role, image, assetId, withKey) {
  const allowed = IMAGE_FIELDS[`${section}:${role}`] ?? ["alt"];
  const v = { _type: "image", asset: { _type: "reference", _ref: assetId } };
  if (withKey) v._key = key();
  if (allowed.includes("alt")) v.alt = image.decorative ? "" : image.alt;
  if (allowed.includes("isDecorative") && image.decorative) v.isDecorative = true;
  if (allowed.includes("caption") && image.caption) v.caption = image.caption;
  if (allowed.includes("layout")) v.layout = "auto";
  return v;
}

/** Plain text of Portable Text, to tell whether a text changed. */
const plain = (blocks) => (Array.isArray(blocks) ? blocks.filter((b) => b._type === "block").map((b) => (b.children ?? []).map((c) => c.text).join("")).join("\n").replace(/\s+/g, " ").trim() : "");

/** What is in Sanity now, for one section. */
async function existing(client, name, def) {
  if (def.kind === "list") {
    const about = await client.fetch(
      `*[_type == "aboutPage" && !(_id in path("drafts.**"))][0]{ _id, "entries": ${def.field}[]{ ..., "files": { "image": image.asset->sha1hash, "logo": logo.asset->sha1hash } } }`,
    );
    return { aboutId: about?._id ?? null, entries: about?.entries ?? [] };
  }
  const docs = await client.fetch(
    `*[_type == $type && !(_id in path("drafts.**"))]{ ..., "slugValue": slug.current, "files": {
      "image": image.asset->sha1hash, "coverImage": coverImage.asset->sha1hash,
      "portrait": portrait.asset->sha1hash, "photographs": photographs[].asset->sha1hash,
      "body": body[_type == "image"].asset->sha1hash } }`,
    { type: def.type },
  );
  const drafts = hasToken() || client.recordsWrites ? await client.fetch(`*[_id in path("drafts.**") && _type == $type]._id`, { type: def.type }) : [];
  return { docs, drafts: new Set(drafts.map((id) => id.replace(/^drafts\./, ""))) };
}

function matchDoc(def, docs, item) {
  if (def.slugged) return docs.find((d) => d.slugValue === item.slug);
  return docs.find((d) => d._id === `${def.idPrefix}-${item.slug}`) ?? docs.find((d) => def.matchKey(d) === def.itemKey(item));
}

function matchEntry(def, entries, item) {
  return entries.find((e) => e._key === item.slug) ?? entries.find((e) => def.matchKey(e) === def.itemKey(item));
}

/** The fields that differ from what is there (scalars and arrays of plain values). */
function changedFields(fields, current) {
  const changed = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v && typeof v === "object" && "markdown" in v) continue;
    const now = current?.[k];
    const same = k === "links" ? JSON.stringify((now ?? []).map(({ label, url }) => ({ label, url }))) === JSON.stringify(v.map(({ label, url }) => ({ label, url }))) : JSON.stringify(now) === JSON.stringify(v);
    if (!same) changed[k] = v;
  }
  return changed;
}

/**
 * The import itself. `client` is a Sanity client (the test passes a stand-in
 * that records the writes). Returns the number of items with a problem.
 */
export async function run(opts, client) {
  const root = resolve(opts.folder);
  const sharp = await loadSharp();
  const present = readdirSync(root).filter((n) => !n.startsWith("_") && !n.startsWith(".") && statSync(join(root, n)).isDirectory());
  for (const n of present) {
    if (LATER[n]) console.log(`\n${n}: ${LATER[n]}.`);
    else if (!SECTIONS[n]) console.log(`\n${n}: not a section I know (${Object.keys(SECTIONS).join(", ")}); skipped.`);
  }

  console.log(`\n${opts.apply ? "Publishing" : "Dry run (nothing is changed)"}: ${root}${opts.replace ? "  [--replace: removals are shown and, with --apply, made]" : ""}`);
  const plan = [];
  let problems = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const [name, def] of Object.entries(SECTIONS)) {
    const asked = !opts.only || opts.only.some((o) => o.split("/")[0] === name);
    if (!present.includes(def.folder) || !asked) continue;
    const sectionDir = join(root, def.folder);
    const folders = itemFolders(sectionDir);
    const items = folders.map((f) => readItem(sectionDir, f)).filter((it) => wanted(opts.only, name, it.slug));
    if (!items.length) continue;
    console.log(`\n=== ${def.title} (${items.length})`);
    const now = await existing(client, name, def);

    for (const item of items) {
      const roles = def.images(item);
      const fields = def.build(item);
      // Prepare and check each photograph.
      const prepared = [];
      for (const r of roles) {
        if (r.noDecorative && r.image.decorative) item.problems.push(`${r.image.file}: this photograph needs alt text (it cannot be decorative)`);
        const p = await preparePhoto(sharp, r.image.path, { hero: !!r.hero, minWidth: r.logo ? false : undefined });
        if (p.refused) item.problems.push(`${r.image.file} refused: ${p.refused}`);
        prepared.push({ ...r, p, sha1: createHash("sha1").update(p.buffer).digest("hex"), uploadName: `${item.slug}-${basename(r.image.file, extname(r.image.file))}.${p.format === "png" ? "png" : "jpg"}` });
        totalBefore += p.before;
        totalAfter += p.after;
      }
      // Images placed in the text (![](file.jpg)): only in a Journal entry, and only listed ones.
      for (const v of Object.values(fields)) {
        if (!(v && typeof v === "object" && "markdown" in v)) continue;
        const listed = new Set(roles.filter((r) => r.role === "body").map((r) => r.image.file));
        markdownToBlocks(v.markdown, { problems: item.problems, imageFor: (file) => (v.images && listed.has(file) ? { _type: "image" } : null) });
      }
      const current = def.kind === "list" ? matchEntry(def, now.entries, item) : matchDoc(def, now.docs, item);
      const changed = changedFields(fields, current);
      // Text (Markdown) fields: changed when the words differ.
      for (const [k, v] of Object.entries(fields)) if (v && typeof v === "object" && "markdown" in v && plain(current?.[k]) !== plain(markdownToBlocks(v.markdown, { imageFor: () => null, problems: [] }))) changed[k] = v;
      const files = current?.files ?? {};
      // A photograph is already there when Sanity holds the same prepared file
      // (matched by its SHA-1 fingerprint, so a photograph used in two places is found too).
      const newImages = prepared.filter((x) => {
        const have = files[x.role];
        return Array.isArray(have) ? !have.includes(x.sha1) : have !== x.sha1;
      });
      // With --replace, photographs in Sanity that the folder no longer lists are removed.
      const extra = opts.replace && Array.isArray(files.photographs) ? files.photographs.filter((h) => !prepared.some((x) => x.sha1 === h)).length : 0;
      const status = item.problems.length ? "SKIPPED" : !current ? "new" : Object.keys(changed).length || newImages.length || extra ? "update" : "no change";
      if (item.problems.length) problems++;

      console.log(`\n  ${item.folder}  ->  ${status}${current && def.kind === "document" ? ` (${current._id})` : ""}${now.drafts?.has?.(current?._id) ? "  [has unpublished edits in the Studio]" : ""}`);
      if (status === "update" && Object.keys(changed).length) console.log(`      fields: ${Object.keys(changed).join(", ")}`);
      if (extra) console.log(`      removes ${extra} photograph${extra === 1 ? "" : "s"} no longer in the folder`);
      for (const x of prepared) {
        const saved = x.p.before ? Math.round((1 - x.p.after / x.p.before) * 100) : 0;
        const fresh = newImages.includes(x) ? "" : " (already there)";
        console.log(`      ${x.image.file} -> ${x.role}${x.hero ? " (hero)" : ""}: ${x.p.width} x ${x.p.height}px, ${kb(x.p.before)} -> ${kb(x.p.after)} (${saved >= 0 ? `${saved}% smaller` : `${-saved}% larger`})${fresh}`);
        for (const flag of x.p.flags) console.log(`        Check: ${flag}`);
      }
      for (const w of item.warnings) console.log(`      Note: ${w}`);
      for (const pr of item.problems) console.log(`      Problem: ${pr}`);
      plan.push({ name, def, item, fields, changed, current, prepared, newImages, status, now });
    }

    // With --replace: what the folder no longer has (only for a whole section).
    if (opts.replace && (!opts.only || opts.only.includes(name))) {
      const kept = new Set(plan.filter((p) => p.name === name && p.current).map((p) => (def.kind === "list" ? p.current._key : p.current._id)));
      const gone = def.kind === "list" ? now.entries.filter((e) => !kept.has(e._key)) : now.docs.filter((d) => !kept.has(d._id));
      for (const g of gone) console.log(`\n  REMOVE ${def.kind === "list" ? `${g.year ?? ""} ${g.title ?? g.name ?? g._key}` : `${g.title ?? g.name ?? g.caption ?? g._id} (${g._id})`}: not in the folder`);
      plan.push({ name, def, remove: gone, now });
    }
  }

  const counts = plan.filter((p) => p.item).reduce((c, p) => ((c[p.status] = (c[p.status] ?? 0) + 1), c), {});
  console.log(`\nIn total: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ") || "nothing"}. Photographs ${kb(totalBefore)} before, ${kb(totalAfter)} after.`);
  if (problems) console.log(`${problems} item${problems === 1 ? "" : "s"} skipped because of a problem (listed above); the rest ${opts.apply ? "are published" : "can be published"}.`);

  if (!opts.apply) {
    console.log("\nDry run: nothing was uploaded or changed. Add --apply to publish.\n");
    return problems;
  }

  // Publish: upload new photographs, then write each item.
  for (const p of plan) {
    if (p.remove) {
      for (const g of p.remove) {
        if (p.def.kind === "list") await client.patch(p.now.aboutId).unset([`${p.def.field}[_key=="${g._key}"]`]).commit();
        else await client.delete(g._id).catch((e) => console.log(`  Could not remove ${g._id}: ${e.message}`));
      }
      continue;
    }
    if (p.status === "SKIPPED" || p.status === "no change") continue;
    const { name, def, item, current } = p;
    const assets = {};
    for (const x of p.prepared) {
      if (!p.newImages.includes(x) && !opts.replace) continue;
      process.stdout.write(`  Uploading ${item.folder}/${x.image.file} ... `);
      const asset = await client.assets.upload("image", x.p.buffer, { filename: x.uploadName, contentType: x.p.format === "png" ? "image/png" : "image/jpeg" });
      assets[x.image.file] = asset._id;
      console.log("done");
    }
    const one = (role) => p.prepared.find((x) => x.role === role && assets[x.image.file]);
    const imageSet = {};
    for (const role of ["image", "coverImage", "portrait", "logo"]) {
      const x = one(role);
      if (x) imageSet[role] = imageValue(name, role, x.image, assets[x.image.file], false);
    }
    const values = { ...p.changed };
    for (const [k, v] of Object.entries(values)) {
      if (!(v && typeof v === "object" && "markdown" in v)) continue;
      const bodyImages = p.prepared.filter((x) => x.role === "body");
      const placed = new Set();
      const problemsHere = [];
      values[k] = markdownToBlocks(v.markdown, {
        problems: problemsHere,
        imageFor: (file) => {
          const x = v.images ? bodyImages.find((b) => b.image.file === file) : null;
          if (!x) return null;
          placed.add(file);
          const id = assets[file] ?? null;
          return id ? imageValue(name, "body", x.image, id, true) : null;
        },
      });
      // Photographs listed but not placed in the text go at the end.
      if (v.images) for (const x of bodyImages) if (!placed.has(x.image.file) && assets[x.image.file]) values[k].push(imageValue(name, "body", x.image, assets[x.image.file], true));
      for (const pr of problemsHere) console.log(`  Note (${item.folder}): ${pr}`);
    }
    const newPhotos = p.prepared.filter((x) => x.role === "photographs" && assets[x.image.file]).map((x) => imageValue(name, "photographs", x.image, assets[x.image.file], true));

    if (def.kind === "list") {
      const entryKey = current?._key ?? item.slug;
      const entry = { ...values, ...imageSet };
      if (!current) {
        await client.patch(p.now.aboutId).setIfMissing({ [def.field]: [] }).append(def.field, [{ _key: entryKey, ...values, ...imageSet }]).commit();
      } else if (Object.keys(entry).length) {
        const set = Object.fromEntries(Object.entries(entry).map(([k, v]) => [`${def.field}[_key=="${entryKey}"].${k}`, v]));
        await client.patch(p.now.aboutId).set(set).commit();
      }
    } else {
      const id = current?._id ?? `${def.idPrefix}-${item.slug}`;
      const slug = def.slugged ? { slug: { _type: "slug", current: item.slug } } : {};
      if (!current) {
        await client.createIfNotExists({ _id: id, _type: def.type, ...slug, ...values, ...imageSet, ...(newPhotos.length ? { photographs: newPhotos } : {}) });
      } else {
        let patch = client.patch(id).set({ ...values, ...imageSet });
        if (newPhotos.length) patch = opts.replace ? patch.set({ photographs: newPhotos }) : patch.setIfMissing({ photographs: [] }).append("photographs", newPhotos);
        await patch.commit();
      }
    }
    console.log(`  Published ${item.folder}`);
  }
  console.log("\nDone. Open the Studio or the site to check.\n");
  return problems;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.folder) fail("Please give the HOS-content folder, for example:\n  node scripts/import-content.mjs ~/Documents/HOS-content");
  const root = resolve(opts.folder);
  if (!existsSync(root) || !statSync(root).isDirectory()) fail(`There is no folder at ${root}.`);
  if (opts.apply && !token) fail("No write token. Set SANITY_WRITE_TOKEN first (docs/content-import.md explains how), or leave out --apply to only look.");
  const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token: token || undefined, useCdn: !token, perspective: "raw" });
  const problems = await run(opts, client);
  process.exit(problems ? 1 : 0);
}

// Run only when called as a command (the test imports run()).
if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => fail(`Something went wrong: ${e.message}`));
