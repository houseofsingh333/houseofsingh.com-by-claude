/**
 * scripts/import/read.mjs
 *
 * Reads the HOS-content folder: one folder per section, one folder per item,
 * each with an item.md (YAML front matter, then a Markdown body) and its
 * photographs. Folders starting with "_" (or ".") are skipped.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { PHOTO } from "../photo-prep.mjs";

/** File name order, with numbers compared as numbers (2 before 10). */
export const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" }).compare;

const skipped = (name) => name.startsWith("_") || name.startsWith(".");

/** "02-Port Credit" becomes "port-credit"; the leading number is the order, not the name. */
export function slugOf(folder) {
  return folder
    .replace(/^\d+[\s._-]*/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The leading number of a folder name ("03-..." is 3), or null. */
export function orderOf(folder) {
  const m = folder.match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

/** The item folders of one section, in name order. */
export function itemFolders(sectionDir) {
  if (!existsSync(sectionDir)) return [];
  return readdirSync(sectionDir)
    .filter((n) => !skipped(n) && statSync(join(sectionDir, n)).isDirectory())
    .sort(byName);
}

/**
 * "cover.jpg | A man in a turban | Toronto, 2019" or "texture.jpg | decorative".
 * Returns { file, alt, caption, decorative } or an error string.
 */
export function parseImageLine(line) {
  const parts = String(line).split("|").map((p) => p.trim());
  const [file, second = "", caption = ""] = parts;
  if (!file) return "an image line has no file name";
  if (parts.length > 3) return `"${line}" has more than three parts (file | alt text | caption)`;
  if (second.toLowerCase() === "decorative") return { file, alt: "", caption, decorative: true };
  if (!second) return `${file} has no alt text (write "${file} | what it shows", or "${file} | decorative")`;
  return { file, alt: second, caption, decorative: false };
}

/** Splits item.md into its front matter (an object) and its Markdown body. */
export function parseItemMd(text) {
  const m = text.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { error: "item.md must start with front matter between two lines of ---" };
  let data;
  try {
    data = parseYaml(m[1]) ?? {};
  } catch (e) {
    return { error: `the front matter is not valid YAML (${e.message.split("\n")[0]})` };
  }
  if (typeof data !== "object" || Array.isArray(data)) return { error: "the front matter must be a list of name: value lines" };
  return { data, body: m[2].trim() };
}

/**
 * One item: its folder, front matter, body, the images it lists (in order)
 * and any problems found while reading.
 */
export function readItem(sectionDir, folder) {
  const dir = join(sectionDir, folder);
  const photos = readdirSync(dir).filter((f) => PHOTO.test(f) && !skipped(f)).sort(byName);
  const item = { folder, dir, slug: slugOf(folder), order: orderOf(folder), data: {}, body: "", images: [], photos, problems: [], warnings: [] };
  const mdPath = join(dir, "item.md");
  if (!existsSync(mdPath)) {
    item.problems.push("no item.md");
    return item;
  }
  const parsed = parseItemMd(readFileSync(mdPath, "utf8"));
  if (parsed.error) {
    item.problems.push(parsed.error);
    return item;
  }
  item.data = parsed.data;
  item.body = parsed.body;
  if (typeof item.data.slug === "string" && item.data.slug.trim()) item.slug = slugOf(item.data.slug);

  let lines = item.data.images == null ? [] : Array.isArray(item.data.images) ? item.data.images : [item.data.images];
  // A folder with a single photograph may give its alt text as "alt:" instead of an images list.
  if (!lines.length && photos.length === 1 && (item.data.alt || item.data.decorative === true)) {
    lines = [`${photos[0]} | ${item.data.decorative === true ? "decorative" : item.data.alt}`];
  }
  for (const line of lines) {
    const image = parseImageLine(line);
    if (typeof image === "string") {
      item.problems.push(image);
      continue;
    }
    if (!photos.includes(image.file)) {
      item.problems.push(`${image.file} is listed but not in the folder (JPEG, PNG, HEIC, TIFF or WebP)`);
      continue;
    }
    item.images.push({ ...image, path: join(dir, image.file) });
  }
  const listed = new Set(item.images.map((i) => i.file));
  const unlisted = photos.filter((f) => !listed.has(f));
  if (unlisted.length) item.warnings.push(`not listed under images, so not imported: ${unlisted.join(", ")}`);
  return item;
}
