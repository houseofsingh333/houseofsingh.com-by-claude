#!/usr/bin/env node
/**
 * scripts/import-content-test.mjs
 *
 * Checks for the content import tool, without Sanity:
 *
 *   node scripts/import-content-test.mjs [an-iphone-photo.heic]
 *
 * Makes small test photographs in a temporary folder and checks the
 * preparation (quality 83, progressive, colour profile kept, location and
 * camera metadata removed, the checks and the refusal), item.md reading,
 * image lines, folder names and Markdown. Give an iPhone HEIC photograph to
 * also check HEIC decoding and its Display P3 label.
 */
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { preparePhoto, loadSharp, estimateJpegQuality, isHero, JPEG_QUALITY } from "./photo-prep.mjs";
import { parseImageLine, parseItemMd, slugOf, orderOf, readItem } from "./import/read.mjs";
import { markdownToBlocks } from "./import/markdown.mjs";
import { SECTIONS, PROJECT_CATEGORIES } from "./import/sections.mjs";
import { fakeSanity } from "./import/fake-sanity.mjs";
import { run } from "./import-content.mjs";

let failed = 0;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "pass" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failed++;
};

const sharp = await loadSharp();
const dir = mkdtempSync(join(tmpdir(), "hos-import-test-"));

// A detailed test photograph: noise, so it is sharp; with GPS, camera and a colour profile.
async function photo(name, width, height, { blur = 0, quality = 92, exif = true } = {}) {
  // Noise seeded by the name, so every test photograph is different.
  const seed = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const noise = Buffer.alloc(width * height * 3);
  for (let i = 0; i < noise.length; i++) noise[i] = ((i + seed) * 2654435761) >>> 24;
  let img = sharp(noise, { raw: { width, height, channels: 3 } });
  if (blur) img = img.blur(blur);
  const buf = await img
    .withIccProfile("p3")
    .withExif(exif ? { IFD0: { Make: "Apple", Model: "iPhone 15 Pro", Software: "Test" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "43/1 39/1 0/1", GPSLongitudeRef: "W", GPSLongitude: "79/1 23/1 0/1" } } : {})
    .jpeg({ quality })
    .toBuffer();
  const path = join(dir, name);
  writeFileSync(path, buf);
  return path;
}

// Preparation.
{
  const path = await photo("01-street.jpg", 1800, 1200);
  const before = await sharp(path).metadata();
  check(!!before.exif && !!before.icc, "the test photograph has camera, GPS and a colour profile");
  const p = await preparePhoto(sharp, path);
  const after = await sharp(p.buffer).metadata();
  check(after.format === "jpeg" && after.isProgressive === true, "output is a progressive JPEG");
  check(Math.abs(estimateJpegQuality(p.buffer) - JPEG_QUALITY) <= 2, "output quality is about 83", String(estimateJpegQuality(p.buffer)));
  check(!after.exif && !after.xmp && !after.iptc, "camera, GPS and all other metadata removed");
  check(!!after.icc && after.icc.length === before.icc.length, "colour profile kept");
  check(p.flags.length === 0 && !p.refused, "a sharp 1800px section photograph has no warnings", p.flags.join("; "));
  check(p.before > 0 && p.after > 0, "sizes before and after reported", `${p.before} -> ${p.after}`);
}
{
  const p = await preparePhoto(sharp, await photo("02-soft.jpg", 1800, 1200, { blur: 6 }));
  check(p.flags.some((f) => /soft/.test(f)), "a blurred photograph is flagged as soft", `sharpness ${p.sharpness}`);
  const q = await preparePhoto(sharp, await photo("03-crushed.jpg", 1800, 1200, { quality: 30 }));
  check(q.flags.some((f) => /compressed/.test(f)), "a heavily compressed source is flagged", `quality ${q.quality}`);
  const n = await preparePhoto(sharp, await photo("04-narrow.jpg", 1200, 900));
  check(n.flags.some((f) => /under 1600px/.test(f)), "a section photograph under 1600px wide is flagged");
}
{
  const small = await preparePhoto(sharp, await photo("hero.jpg", 1400, 900));
  check(!!small.refused, "a hero under 1600px wide is refused");
  const mid = await preparePhoto(sharp, await photo("00-hero.jpg", 2000, 1200));
  check(!mid.refused && mid.flags.some((f) => /under 2400px/.test(f)), "a hero from 1600 to 2399px wide only warns");
  const tall = await preparePhoto(sharp, await photo("tall.jpg", 2600, 3400), { hero: true });
  check(tall.flags.some((f) => /portrait/.test(f)), "a portrait hero is flagged");
  check(isHero("hero.jpg") && isHero("00 Hero.png") && !isHero("heron.jpg"), "hero file names");
}
{
  const logoPath = join(dir, "logo.png");
  writeFileSync(logoPath, await sharp({ create: { width: 400, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer());
  const p = await preparePhoto(sharp, logoPath, { minWidth: false });
  check(p.format === "png" && (await sharp(p.buffer).metadata()).hasAlpha, "a transparent logo stays a transparent PNG");
}

// HEIC, when an iPhone photograph is given.
const heic = process.argv[2];
if (heic) {
  const p = await preparePhoto(sharp, heic);
  const m = await sharp(p.buffer).metadata();
  check(m.format === "jpeg" && !m.exif, "HEIC becomes a JPEG without camera or GPS data", `${p.width} x ${p.height}`);
  check(!!m.icc, "HEIC JPEG is labelled with a colour profile (Display P3)");
} else console.log("skip  HEIC (give an iPhone .heic photograph to check it)");

// Reading items.
check(slugOf("03-Port Credit, Ontario") === "port-credit-ontario" && orderOf("03-Port Credit") === 3, "folder names give the address and the order");
const line = parseImageLine("cover.jpg | A man in a turban | Toronto, 2019");
check(line.alt === "A man in a turban" && line.caption === "Toronto, 2019" && !line.decorative, "an image line: file | alt | caption");
check(parseImageLine("texture.jpg | decorative").decorative === true, "an image line: file | decorative");
check(typeof parseImageLine("cover.jpg") === "string", "an image line without alt text is a problem");
const md = parseItemMd("---\ntitle: Zamana\ndate: 2024-05-01\n---\nHello");
check(md.data.title === "Zamana" && md.body === "Hello", "item.md: front matter and body");
check(!!parseItemMd("no front matter").error, "item.md without front matter is a problem");
{
  const sec = join(dir, "projects");
  mkdirSync(join(sec, "test"), { recursive: true });
  writeFileSync(join(sec, "test", "item.md"), "---\ntitle: T\ncategory: Painting\nimages:\n  - missing.jpg | x\n---\n");
  const it = readItem(sec, "test");
  SECTIONS.projects.build(it);
  check(it.problems.some((p) => /missing\.jpg/.test(p)), "a listed photograph that is not in the folder is a problem");
  check(it.problems.some((p) => /not a category/.test(p)), "an unknown project category is a problem", PROJECT_CATEGORIES.join(", "));
}

// Markdown.
const blocks = markdownToBlocks("A **bold** and *quiet* [link](https://houseofsingh.com).\n\n## Heading\n\n- one\n- two\n\n> A quote");
check(blocks.length === 5 && blocks[1].style === "h2" && blocks[2].listItem === "bullet" && blocks[4].style === "blockquote", "Markdown: paragraph, heading, list, quote");
check(blocks[0].children.some((c) => c.marks.includes("strong")) && blocks[0].markDefs[0]?.href === "https://houseofsingh.com", "Markdown: bold, italic and links");

// Publishing, against a stand-in for Sanity that records every write.
{
  const root = join(dir, "HOS-content");
  const put = async (rel, md, photos = {}) => {
    mkdirSync(join(root, rel), { recursive: true });
    writeFileSync(join(root, rel, "item.md"), md);
    for (const [name, [w, h]] of Object.entries(photos)) writeFileSync(join(root, rel, name), await sharp(await photo(`src-${rel.replace(/\W/g, "")}-${name}`, w, h, {})).toBuffer());
  };
  await put("hero/01-port", "---\ncaption: Port Credit\nlink: /about\nalt: Boats at the pier\n---\n", { "slide.jpg": [2600, 1500] });
  await put("hero/02-tiny", "---\ncaption: Tiny\nalt: A small photograph\n---\n", { "slide.jpg": [1200, 800] });
  await put("projects/zamana", "---\ntitle: Zamana\ncategory: Photography\nimages:\n  - cover.jpg | A man in a turban\n  - 01.jpg | A street | Toronto\n  - 02.jpg | decorative\n---\nThe story, with **bold**.\n", { "cover.jpg": [2600, 1500], "01.jpg": [1800, 1200], "02.jpg": [1800, 1200] });
  await put("journal/the-saddle", "---\ntitle: The saddle\ndate: 2026-07-05\nimages:\n  - cover.jpg | A horse\n  - 02.jpg | The yard\n---\nFirst.\n\n![](02.jpg)\n\nLast.\n", { "cover.jpg": [1800, 1200], "02.jpg": [1800, 1200] });
  await put("journey/2026-horse", "---\nyear: 2026\ntitle: Horse riding\nimages:\n  - photo.jpg | On the horse\n---\n", { "photo.jpg": [1800, 1200] });
  await put("featured/press", "---\nname: MensXP\ntitle: A feature\nurl: https://example.com/a\nimages:\n  - image.jpg | The feature\n---\n", { "image.jpg": [1800, 1200] });
  await put("collaborators/test-artist", "---\nname: Test Artist\nlinks:\n  - Instagram | https://www.instagram.com/test\nimages:\n  - portrait.jpg | Test Artist\n---\nAbout them.\n", { "portrait.jpg": [1800, 1200] });
  // Already in Sanity: the About page with one milestone, and a project the folder no longer has.
  const sanity = fakeSanity([
    { _id: "about", _type: "aboutPage", milestones: [{ _key: "m2013", year: "2013", title: "House of Singh begins" }], featuredOn: [] },
    { _id: "project-old", _type: "project", title: "Old", slug: { current: "old" } },
  ]);
  const quiet = console.log;
  console.log = () => {};
  const problems = await run({ folder: root, apply: true, replace: false, only: null }, sanity);
  console.log = quiet;
  const docs = sanity.docs;
  check(problems === 1 && !docs.has("heroSlide-tiny"), "publish: the small hero is refused and not written, the rest go through");
  const slide = docs.get("heroSlide-port");
  check(slide?.order === 1 && slide.internalLink === "/about" && slide.image?.alt === "Boats at the pier", "publish: a hero slide with its order, link and alt text");
  const project = docs.get("project-zamana");
  check(project?.slug?.current === "zamana" && project.coverImage?.asset && project.photographs?.length === 2, "publish: a project with its cover and photographs");
  check(project?.photographs?.[0]?.caption === "Toronto" && project.photographs[0].layout === "auto" && project.photographs[1].isDecorative === true, "publish: captions, layout Auto and decorative photographs");
  check(project?.story?.[0]?.children?.some((c) => c.marks.includes("strong")), "publish: the project text from the Markdown");
  const entry = docs.get("journalEntry-the-saddle");
  check(entry?.body?.map((b) => b._type).join(",") === "block,image,block" && entry.date === "2026-07-05", "publish: a Journal entry with its photograph placed in the text");
  const about = docs.get("about");
  check(about.milestones.length === 2 && about.milestones[1]._key === "horse" && about.milestones[1].image?.alt === "On the horse", "publish: a Journey milestone added after the others");
  check(about.featuredOn.length === 1 && about.featuredOn[0].url === "https://example.com/a", "publish: a Featured on entry");
  const artist = docs.get("editionsCollaborator-test-artist");
  check(artist?.links?.[0]?._key && artist.text === "About them." && artist.isTestData === false, "publish: a Shop artist with links and text");
  check(docs.has("project-old"), "publish: nothing is deleted without --replace");

  // Again: nothing new, nothing written, nothing uploaded.
  const before = { ...sanity.log };
  console.log = () => {};
  await run({ folder: root, apply: true, replace: false, only: null }, sanity);
  console.log = quiet;
  check(sanity.log.uploads === before.uploads && sanity.log.writes === before.writes, "publish twice: the second run changes nothing", `${sanity.log.writes - before.writes} writes`);
  check([...docs.values()].filter((d) => d._type === "project").length === 2, "publish twice: no duplicates");

  // A new photograph in an existing project is added, not duplicated.
  writeFileSync(join(root, "projects/zamana/03.jpg"), await sharp(await photo("src-03.jpg", 1800, 1200)).toBuffer());
  writeFileSync(join(root, "projects/zamana/item.md"), "---\ntitle: Zamana\ncategory: Photography\nimages:\n  - cover.jpg | A man in a turban\n  - 01.jpg | A street | Toronto\n  - 02.jpg | decorative\n  - 03.jpg | A third\n---\nThe story, with **bold**.\n");
  console.log = () => {};
  await run({ folder: root, apply: true, replace: false, only: ["projects/zamana"] }, sanity);
  console.log = quiet;
  check(docs.get("project-zamana").photographs.length === 3, "update: a new photograph is added to the project, the others kept");

  // --replace removes what the folder no longer has (here: the project "old").
  console.log = () => {};
  await run({ folder: root, apply: true, replace: true, only: ["projects"] }, sanity);
  console.log = quiet;
  check(!docs.has("project-old") && docs.has("project-zamana"), "--replace: a project missing from the folder is removed, the others kept");
}

rmSync(dir, { recursive: true, force: true });
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
