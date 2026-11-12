/**
 * scripts/import/sections.mjs
 *
 * What each section of the HOS-content folder fills in Sanity: its fields
 * and their limits (as in the Studio's schema), which photograph goes where,
 * and how an item is matched to what is already there.
 *
 * The field list for people is docs/content-import.md; keep the two together.
 */
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { randomUUID } from "node:crypto";

/** The project categories, read from the schema so the two never drift. */
export const PROJECT_CATEGORIES = (() => {
  const src = readFileSync(new URL("../../src/sanity/schemas/rules.ts", import.meta.url), "utf8");
  const m = src.match(/PROJECT_CATEGORIES\s*=\s*\[([^\]]*)\]/);
  return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
})();

const base = (file) => basename(file, extname(file)).toLowerCase().replace(/^\d+[\s._-]*/, "");
const text = (v) => (v == null ? undefined : String(v).trim() || undefined);

/** Field rules: each returns the value to write, or pushes a problem. */
const F = {
  string: (max) => (v, p, name) => {
    const t = text(v);
    if (t && max && t.length > max) p.push(`${name} is ${t.length} characters; at most ${max}`);
    return t;
  },
  required: (rule) => (v, p, name, w) => {
    const out = rule(v, p, name, w);
    if (out === undefined) p.push(`${name} is required`);
    return out;
  },
  recommended: (rule) => (v, p, name, w) => {
    const out = rule(v, p, name, w);
    if (out === undefined) w.push(`${name} is empty (recommended)`);
    return out;
  },
  int: (min, max) => (v, p, name) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) p.push(`${name} must be a whole number from ${min} to ${max}`);
    return n;
  },
  number: () => (v, p, name) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    if (Number.isNaN(n)) p.push(`${name} must be a number`);
    return n;
  },
  bool: () => (v, p, name) => {
    if (v == null) return undefined;
    if (typeof v !== "boolean") p.push(`${name} must be true or false`);
    return v === true;
  },
  date: () => (v, p, name) => {
    if (v == null || v === "") return undefined;
    // YAML reads 2024-05-01 as a date; keep the day as written (no time zone shift).
    const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) p.push(`${name} must be a date written 2024-05-01`);
    return s;
  },
  year: () => (v, p, name) => {
    const s = text(v);
    if (s && !/^\d{4}$/.test(s)) p.push(`${name} must be four digits, for example 2024`);
    return s;
  },
  https: () => (v, p, name) => {
    const s = text(v);
    if (s && !/^https:\/\/\S+$/.test(s)) p.push(`${name} must be a full https:// address`);
    return s;
  },
  categories: () => (v, p, name) => {
    const s = text(Array.isArray(v) ? v.join(", ") : v);
    if (!s) return undefined;
    const unknown = s.split(",").map((c) => c.trim()).filter((c) => c && !PROJECT_CATEGORIES.includes(c));
    if (unknown.length) p.push(`${name}: "${unknown.join(", ")}" is not a category (use ${PROJECT_CATEGORIES.join(", ")})`);
    return s;
  },
};

/** One section's fields: [name in item.md, field in Sanity, rule]. */
function fields(item, list) {
  const out = {};
  for (const [name, field, rule] of list) {
    const value = rule(item.data[name], item.problems, name, item.warnings);
    if (value !== undefined) out[field] = value;
  }
  return out;
}

/** The link of a slide: an address on this site (/about) or a full https:// address. */
function slideLink(item) {
  const link = text(item.data.link);
  if (!link) return {};
  if (link.startsWith("/") && !link.startsWith("//")) return { internalLink: link };
  if (/^https:\/\/\S+$/.test(link)) return { externalLink: link };
  item.problems.push(`link must start with / (a page on this site) or https://`);
  return {};
}

/**
 * The sections. Each one:
 *   folder     its folder in HOS-content
 *   kind       "document" (one Sanity document per item) or "list" (an entry in the About page)
 *   images(item)  assigns each listed photograph a role: { image, role, hero, logo }
 *   build(item)   the fields to write (photographs are added by the importer)
 */
export const SECTIONS = {
  hero: {
    folder: "hero",
    title: "Homepage hero slides",
    kind: "document",
    type: "heroSlide",
    idPrefix: "heroSlide",
    // Slides are matched by their caption (they have no address).
    matchKey: (doc) => (doc.caption ?? "").trim().toLowerCase(),
    itemKey: (item) => text(item.data.caption)?.toLowerCase() ?? item.slug,
    images(item) {
      if (item.images.length !== 1) item.problems.push("a slide needs exactly one photograph");
      return item.images.slice(0, 1).map((image) => ({ image, role: "image", hero: true, noDecorative: true }));
    },
    build(item) {
      const out = fields(item, [
        ["caption", "caption", F.recommended(F.string())],
        ["heading", "heading", F.string()],
        ["subheading", "subheading", F.string()],
      ]);
      if (item.order == null) item.problems.push("the folder name must start with its number, for example 01-port-credit");
      else out.order = item.order;
      return { ...out, ...slideLink(item) };
    },
  },

  projects: {
    folder: "projects",
    title: "Projects",
    kind: "document",
    type: "project",
    idPrefix: "project",
    slugged: true,
    images(item) {
      const covers = item.images.filter((i) => base(i.file) === "cover");
      if (covers.length > 1) item.problems.push("more than one cover");
      return item.images.map((image) => (base(image.file) === "cover" ? { image, role: "coverImage", hero: true } : { image, role: "photographs" }));
    },
    build(item) {
      return {
        ...fields(item, [
          ["title", "title", F.required(F.string())],
          ["category", "category", F.required(F.categories())],
          ["year", "year", F.int(1900, 2100)],
          ["role", "role", F.string()],
          ["shortIntro", "shortIntro", F.string()],
          ["excerpt", "excerpt", F.recommended(F.string())],
          ["featuredOnHomepage", "featuredOnHomepage", F.bool()],
          ["homepageOrder", "homepageOrder", F.number()],
          ["isUpcoming", "isUpcoming", F.bool()],
        ]),
        ...(item.body ? { story: { markdown: item.body } } : {}),
      };
    },
  },

  journal: {
    folder: "journal",
    title: "Journal entries",
    kind: "document",
    type: "journalEntry",
    idPrefix: "journalEntry",
    slugged: true,
    images(item) {
      const cover = item.images.find((i) => base(i.file) === "cover") ?? item.images[0];
      if (!cover) item.problems.push("an entry needs a cover photograph (cover.jpg, or the first listed)");
      return item.images.map((image) => (image === cover ? { image, role: "coverImage" } : { image, role: "body" }));
    },
    build(item) {
      return {
        ...fields(item, [
          ["title", "title", F.required(F.string())],
          ["date", "date", F.required(F.date())],
          ["excerpt", "excerpt", F.recommended(F.string())],
          ["author", "author", F.string()],
          ["seoTitle", "seoTitle", F.string(60)],
          ["seoDescription", "seoDescription", F.string(160)],
        ]),
        ...(item.body ? { body: { markdown: item.body, images: true } } : {}),
      };
    },
  },

  journey: {
    folder: "journey",
    title: "About: the Journey (milestones)",
    kind: "list",
    field: "milestones",
    // Matched by its folder name, or else by the same year and title.
    matchKey: (entry) => `${entry.year}|${(entry.title ?? "").trim().toLowerCase()}`,
    itemKey: (item) => `${text(item.data.year)}|${text(item.data.title)?.toLowerCase()}`,
    images(item) {
      if (item.images.length !== 1) item.problems.push("a milestone needs exactly one photograph (photo.jpg)");
      return item.images.slice(0, 1).map((image) => ({ image, role: "image" }));
    },
    build(item) {
      return fields(item, [
        ["year", "year", F.required(F.year())],
        ["title", "title", F.required(F.string(30))],
        ["text", "text", F.string(75)],
      ]);
    },
  },

  featured: {
    folder: "featured",
    title: "About: Featured on",
    kind: "list",
    field: "featuredOn",
    matchKey: (entry) => (entry.name ?? "").trim().toLowerCase() + "|" + (entry.title ?? "").trim().toLowerCase(),
    itemKey: (item) => (text(item.data.name)?.toLowerCase() ?? "") + "|" + (text(item.data.title)?.toLowerCase() ?? ""),
    images(item) {
      return item.images.map((image) => (base(image.file).startsWith("logo") ? { image, role: "logo", logo: true } : { image, role: "image" }));
    },
    build(item) {
      return fields(item, [
        ["name", "name", F.required(F.string())],
        ["title", "title", F.string()],
        ["date", "date", F.date()],
        ["description", "description", F.string()],
        ["url", "url", F.https()],
      ]);
    },
  },

  collaborators: {
    folder: "collaborators",
    title: "Shop artists (House of Singh Editions collaborators)",
    kind: "document",
    type: "editionsCollaborator",
    idPrefix: "editionsCollaborator",
    slugged: true,
    images(item) {
      if (item.images.length > 1) item.problems.push("an artist has one photograph (portrait.jpg)");
      return item.images.slice(0, 1).map((image) => ({ image, role: "portrait", noDecorative: true }));
    },
    build(item) {
      const out = fields(item, [
        ["name", "name", F.required(F.string(60))],
        ["discipline", "discipline", F.string(40)],
        ["city", "city", F.string(40)],
      ]);
      const about = text(item.data.text) ?? text(item.body);
      if (about && about.length > 600) item.problems.push(`the text is ${about.length} characters; at most 600`);
      if (about) out.text = about;
      const links = item.data.links == null ? [] : Array.isArray(item.data.links) ? item.data.links : [item.data.links];
      if (links.length) {
        out.links = links.map((line) => {
          const [label, url] = String(line).split("|").map((s) => s.trim());
          if (!label || !/^https:\/\/\S+$/.test(url ?? "")) item.problems.push(`link "${line}" must be written Label | https://...`);
          return { _type: "link", _key: randomUUID().replace(/-/g, "").slice(0, 12), label, url };
        });
      }
      out.isTestData = false;
      return out;
    },
  },
};

/** Section folders recognised but not imported yet. */
export const LATER = { editions: "House of Singh Editions (pieces and collections): not imported yet; use the Studio" };
