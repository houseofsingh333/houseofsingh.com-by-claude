/**
 * The Studio guardrails (src/sanity/guardrails.ts), checked the way the
 * Studio runs them: the real schema, with each field's own validation
 * called against a stand in for Sanity's rule and for the uploaded file.
 *
 *   npx tsx scripts/guardrails-test.ts
 */
import { schemaTypes } from "../src/sanity/schemas";
import { altChecks, descriptionCheck, photoChecks, titleCheck, type AssetInfo } from "../src/sanity/guardrails";

let failures = 0;
function check(ok: boolean, what: string, detail?: unknown) {
  console.log(`${ok ? "pass" : "FAIL"}  ${what}${!ok && detail !== undefined ? `  (${JSON.stringify(detail)})` : ""}`);
  if (!ok) failures++;
}

// ——— The checks themselves ———
const png: AssetInfo = { mimeType: "image/png", hasAlpha: false, size: 2_000_000, width: 3000 };
check(photoChecks(png, "photo").warnings.some((w) => /PNG with no transparency/.test(w)), "a PNG with no transparency: warn, suggest JPEG");
check(photoChecks({ ...png, hasAlpha: true }, "photo").warnings.length === 0, "a PNG with transparency: no warning");
check(photoChecks({ mimeType: "image/jpeg", size: 7 * 1024 * 1024, width: 3000 }, "photo").warnings.some((w) => /7\.0 MB, over 5 MB/.test(w)), "over 5 MB: warn");
check(photoChecks({ mimeType: "image/jpeg", size: 1e6, width: 2000 }, "cover").warnings.some((w) => /2000px wide.*2400px/.test(w)), "a cover 2000px wide: warn (2400 recommended)");
const narrow = photoChecks({ mimeType: "image/jpeg", size: 1e6, width: 1200 }, "cover");
check(!!narrow.error && /1200px wide/.test(narrow.error), "a cover under 1600px: blocks publishing");
check(photoChecks({ mimeType: "image/jpeg", size: 1e6, width: 1200 }, "photo").error === null && photoChecks({ mimeType: "image/jpeg", size: 1e6, width: 1200 }, "photo").warnings.some((w) => /1600px/.test(w)), "another photograph under 1600px: warns only");
check(photoChecks({ mimeType: "image/jpeg", size: 900_000, width: 2800 }, "cover").warnings.length === 0 && photoChecks({ mimeType: "image/jpeg", size: 900_000, width: 2800 }, "cover").error === null, "a good cover: nothing");

for (const generic of ["House of Singh", "image", "Photo.", "IMG_1234.jpg", "DSC0042", "hero"]) check(altChecks(generic).length === 1, `generic alt text warns: "${generic}"`);
check(altChecks("sifti da ghar cover", "Sifti-da-Ghar_cover.jpg").length === 1, "alt text that is the file's name warns");
check(altChecks("x".repeat(126)).some((w) => /126 characters/.test(w)), "alt text over 125 characters warns");
check(altChecks("Maninder in a dark turban, seated on a wooden stool in a black and white studio portrait").length === 0, "a real description: nothing");

check(titleCheck("x".repeat(61)) !== null && titleCheck("x".repeat(60)) === null, "titles over 60 characters warn");
check(descriptionCheck("x".repeat(69)) !== null && descriptionCheck("x".repeat(70)) === null && descriptionCheck("x".repeat(160)) === null && descriptionCheck("x".repeat(161)) !== null && descriptionCheck("") === null, "descriptions outside 70 to 160 characters warn; empty is fine");

// ——— Run as the Studio runs them ———
type Found = { fn: (v: unknown, c: unknown) => unknown; level: "error" | "warning" };
/** A stand in for Sanity's rule: every method chains; custom checks are collected with their level. */
function fakeRule(found: Found[]) {
  const make = (): unknown =>
    new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (prop === "custom") return (fn: Found["fn"]) => { const f: Found = { fn, level: "error" }; found.push(f); const chain: Record<string, unknown> = new Proxy({}, { get: (_x, p) => (p === "warning" ? () => ((f.level = "warning"), chain) : p === "error" ? () => ((f.level = "error"), chain) : () => chain) }); return chain; };
          return () => make();
        },
      },
    );
  return make();
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function field(typeName: string, path: string[]): any {
  let node: any = (schemaTypes as any[]).find((t) => t.name === typeName);
  for (const name of path) {
    const pool = [...(node.fields ?? []), ...(node.of ?? [])];
    node = name === "[]" ? node.of?.[0] : pool.find((f: any) => f.name === name);
    if (!node) throw new Error(`No field ${path.join(".")} on ${typeName}`);
  }
  return node;
}
async function run(f: any, value: unknown, asset: AssetInfo | null, parent?: unknown) {
  const found: Found[] = [];
  const out = f.validation?.(fakeRule(found));
  void out;
  const context = { parent, getClient: () => ({ fetch: async () => asset }) };
  const results: { level: string; message: string }[] = [];
  for (const c of found) {
    const r = await c.fn(value, context);
    if (typeof r === "string") results.push({ level: c.level, message: r });
  }
  return results;
}

(async () => {
  let n = 0;
  const upload = (a: AssetInfo) => ({ value: { asset: { _ref: `image-test-${++n}` } }, asset: a });

  const hero = field("heroSlide", ["image"]);
  let u = upload({ mimeType: "image/jpeg", size: 800_000, width: 1400 });
  const heroNarrow = await run(hero, u.value, u.asset);
  check(heroNarrow.some((r) => r.level === "error" && /1400px/.test(r.message)), "Studio, hero slide 1400px wide: an error, cannot publish", heroNarrow);

  const cover = field("project", ["coverImage"]);
  u = upload({ mimeType: "image/png", hasAlpha: false, size: 6 * 1024 * 1024, width: 2000 });
  const coverPng = await run(cover, u.value, u.asset);
  check(coverPng.length === 1 && coverPng[0].level === "warning" && /PNG/.test(coverPng[0].message) && /6\.0 MB/.test(coverPng[0].message) && /2400px/.test(coverPng[0].message), "Studio, project cover PNG, 6 MB, 2000px: one warning naming all three", coverPng);

  const portrait = field("aboutPage", ["portrait"]);
  u = upload({ mimeType: "image/png", hasAlpha: false, size: 70_000, width: 1121 });
  const p = await run(portrait, u.value, u.asset);
  check(p.some((r) => r.level === "warning" && /PNG/.test(r.message)) && p.every((r) => r.level !== "error" || /required/i.test(r.message)), "Studio, the About portrait as a PNG: warns (the mistake that slipped in)", p);

  const logo = field("aboutPage", ["monikerLogo"]);
  u = upload({ mimeType: "image/png", hasAlpha: false, size: 20_000, width: 400 });
  check((await run(logo, u.value, u.asset)).length === 0, "Studio, a logo: no photograph checks");

  const journalCover = field("journalEntry", ["coverImage"]);
  u = upload({ mimeType: "image/jpeg", size: 1e6, width: 1080 });
  const jc = await run(journalCover, u.value, u.asset);
  check(jc.length === 1 && jc[0].level === "warning" && /1600px/.test(jc[0].message), "Studio, a Journal cover 1080px wide (a phone photograph): warns, does not block", jc);

  const sectionImage = field("imageSingle", ["image"]);
  u = upload({ mimeType: "image/jpeg", size: 1e6, width: 1400 });
  const sec = await run(sectionImage, u.value, u.asset);
  check(sec.length === 1 && sec[0].level === "warning" && /1600px/.test(sec[0].message), "Studio, a section photograph 1400px: warns, does not block", sec);

  const alt = field("project", ["coverImage", "alt"]);
  u = upload({ mimeType: "image/jpeg", size: 1e6, width: 3000, originalFilename: "zamana-cover.jpg" });
  const altGeneric = await run(alt, "House of Singh", u.asset, u.value);
  check(altGeneric.some((r) => r.level === "warning" && /does not describe/.test(r.message)), "Studio, alt text \"House of Singh\": warns", altGeneric);
  const altFile = await run(alt, "zamana cover", u.asset, u.value);
  check(altFile.some((r) => r.level === "warning"), "Studio, alt text that is the file's name: warns", altFile);
  const altMissing = await run(alt, "", u.asset, u.value);
  check(altMissing.some((r) => r.level === "error" && /required/i.test(r.message)), "Studio, alt text missing: still an error (as before)", altMissing);
  const altDecorative = await run(alt, "", u.asset, { ...u.value, isDecorative: true });
  check(altDecorative.length === 0, "Studio, a decorative photograph: no alt text needed, no warning");

  const shopAlt = field("editionsPiece", ["photographs", "[]", "alt"]);
  check((await run(shopAlt, "image", u.asset, u.value)).some((r) => r.level === "warning"), "Studio, a Shop photograph's alt text \"image\": warns");

  const metaDesc = field("seo", ["metaDescription"]);
  check((await run(metaDesc, "Too short.", null)).some((r) => r.level === "warning" && /70 to 160/.test(r.message)), "Studio, a 10 character search description: warns");
  const metaTitle = field("seo", ["metaTitle"]);
  check((await run(metaTitle, "x".repeat(70), null)).some((r) => r.level === "warning" && /60/.test(r.message)), "Studio, a 70 character search title: warns");

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exit(failures ? 1 : 0);
})();
