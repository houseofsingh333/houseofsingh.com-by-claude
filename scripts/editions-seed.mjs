#!/usr/bin/env node
/**
 * Sample content for House of Singh Editions, so the preview shows every
 * state: Collection 01 (Vaisakhi 2027, marked as test data), four
 * categories, eight sample pieces made from existing Journal photographs
 * (with their own alt text), one sample collaborator and a sample shipping
 * table. Every sample document has an id starting "editions-test-" or is
 * one of the four categories and the shipping table, so it can all be
 * removed in one go.
 *
 *   node scripts/editions-seed.mjs            create or replace, published
 *   node scripts/editions-seed.mjs --delete   remove all sample content
 *
 * Needs a write token: SANITY_WRITE_TOKEN (or SANITY_API_TOKEN).
 *
 * The early access code is never stored: pass the fingerprint of one with
 * EDITIONS_TEST_CODE_HASH, or the Collection is left without early access.
 * The sample dates: early access from 1 November 2026, open to everyone at
 * 7 pm in Toronto on 13 April 2027 (4:30 am on 14 April in India), closing
 * at the end of May 2027.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "31g7gu7n";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || "";
if (!token) {
  console.error("No write token. Set SANITY_WRITE_TOKEN first.");
  process.exit(1);
}
const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

const ref = (id) => ({ _type: "reference", _ref: id });
const photo = (key, asset, alt) => ({ _type: "image", _key: key, asset: ref(asset), alt });

/** Existing Journal photographs, with the alt text they already have. */
const P = {
  windowSeat: ["image-b15efa307079406fa118cfed072ea49c5e0d2efb-4268x5335-jpg", "A man in a black turban sits at a cafe window counter beside a leafy plant, looking out to a grey street."],
  mending: ["image-73cfc76e335c216ab19c9eef824f1f6dd9341b5e-4672x7008-jpg", "Bearded man in a patterned turban works intently with his hands at a cafe table, a film camera beside him."],
  betweenShots: ["image-778611be6ba07f9b255a987d4f55a61edb610199-4672x7008-jpg", "Man in a grey turban and sunglasses leans on a stone wall with a film camera on his strap, holding a drink."],
  whiteWall: ["image-0a05adb33078f8da7046b0826bf95497b15998b3-4672x7008-jpg", "A man in a dark kurta and white turban walks past the stark corner of a white tiled building."],
  eclipse: ["image-3dcb400065918cbc0d0301887c63ee7b2ca4e6f4-3024x4032-jpg", "Crescent of a partial solar eclipse glows red through a break in dark, heavy cloud cover."],
  inlay: ["image-ee75d60e8f2299e8377e741219c28992fe43eff0-1212x2153-jpg", "Detailed Mughal style floral inlay and paintwork in blue, gold and green covers an old heritage wall."],
  stillWater: ["image-7c4c2b39e19836043289c63b81f96dd179dc4e41-3024x4032-jpg", "Calm lake stretches between dark mountain ridges under a soft pastel sky as evening settles in."],
  watcher: ["image-264fdf84927a2af19ba5897338a5d24aeee7e14e-3024x4032-jpg", "Carved wooden figure on a concrete base stands on a waterfront lawn with a marina and sea behind."],
  corner: ["image-5f188c6a932d0e1ff93f38b63c8d305c18f9381e-2671x3889-jpg", "Narrow flatiron shaped brick building meets a street corner at dusk as a single bird passes overhead."],
  lookUp: ["image-0330f6d390a7f3bcdf66cbaeb957a39f69a9c495-3008x4011-jpg", "Upward view of a black lamp post framed between two orange stucco buildings against a cloud brushed sky."],
  paperBox: ["image-2d88115a52d30248dbdc7c33622b84ddd7ce9d20-3024x4032-jpg", "Green and blue painted heritage corner building with arched windows and shopfronts under a clear sky."],
  goodEarth: ["image-50024acdcaf4c1272e20de4dcf96cfab65172271-2000x3000-jpg", "Sidewalk seating outside Good Earth Coffeehouse in a downtown tower, green chairs beside a Now Open sign."],
};
const photos = (...names) => names.map((n, i) => photo(`p${i}`, ...P[n]));

const SAMPLE = "Sample piece for the preview, test data.";

const categories = [
  { _id: "editions-category-print", _type: "editionsCategory", singular: "Print", plural: "Prints", descriptor: "Archival print", order: 10 },
  { _id: "editions-category-clothing", _type: "editionsCategory", singular: "Clothing", plural: "Clothing", descriptor: "Clothing", order: 20 },
  { _id: "editions-category-original", _type: "editionsCategory", singular: "Original", plural: "Originals", descriptor: "Original", order: 30 },
  { _id: "editions-category-object", _type: "editionsCategory", singular: "Object", plural: "Objects", descriptor: "Object", order: 40 },
];

const collaborator = {
  _id: "editions-test-collaborator",
  _type: "editionsCollaborator",
  name: "Sample Artist",
  slug: { _type: "slug", current: "sample-artist" },
  discipline: "Ceramicist",
  city: "Toronto",
  text: "Test data for the preview: a sample collaborator, to show how an artist's own page reads. Delete before launch.",
};

const collection = {
  _id: "editions-test-collection-01",
  _type: "editionsCollection",
  number: 1,
  season: "Vaisakhi 2027",
  colour: "saffron",
  intro: "Prints, clothing and objects. Released once, never restocked.",
  releaseLine: "Released on the eve of Vaisakhi",
  closedLine: "Every piece has found its home. Collection 02 is being made, for winter.",
  earlyAccessOpens: "2026-11-01T14:00:00Z",
  opens: "2027-04-13T23:00:00Z",
  closes: "2027-05-31T03:59:00Z",
  ...(process.env.EDITIONS_TEST_CODE_HASH ? { earlyAccessCodeHash: process.env.EDITIONS_TEST_CODE_HASH } : {}),
  isTestData: true,
};

const band = (key, upToKg, price) => ({ _type: "band", _key: key, upToKg, price });
const route = (key, origin, zone, a, b) => ({ _type: "route", _key: key, origin, zone, bands: [band("a", 1, a), band("b", 3, b)] });
const shipping = {
  _id: "editionsShipping",
  _type: "editionsShipping",
  routes: [
    route("cc", "canada", "canada", 18, 28),
    route("cu", "canada", "united-states", 26, 40),
    route("ci", "canada", "india", 34, 52),
    route("cw", "canada", "world", 38, 60),
    route("ic", "india", "canada", 30, 48),
    route("iu", "india", "united-states", 32, 50),
    route("ii", "india", "india", 8, 14),
    route("iw", "india", "world", 28, 45),
  ],
};

const size = (key, label, stock, sold) => ({ _type: "size", _key: key, label, stock, sold });
const piece = (n, fields) => ({
  _id: `editions-test-piece-${n}`,
  _type: "editionsPiece",
  order: n * 10,
  collection: ref(collection._id),
  statement: SAMPLE,
  maker: "Maninder Singh",
  soldCount: 0,
  packedWeight: 0.6,
  shipsFrom: "canada",
  isTestData: true,
  ...fields,
});

/** Eight pieces: one sold out, one with a sold out size, a one of one, a collaboration. */
const pieces = [
  piece(1, { name: "Window Seat", slug: { _type: "slug", current: "window-seat" }, category: ref("editions-category-print"), editionType: "numbered", quantity: 25, price: 180, soldCount: 7, photographs: photos("windowSeat", "mending"), details: "Archival pigment print on cotton rag, 40 by 50 cm, signed and numbered. Test data.", care: "Frame behind glass, away from direct sun." }),
  piece(2, {
    name: "Mending Tee",
    slug: { _type: "slug", current: "mending-tee" },
    category: ref("editions-category-clothing"),
    editionType: "limited",
    quantity: 40,
    price: 85,
    sizes: [size("s", "S", 10, 10), size("m", "M", 12, 4), size("l", "L", 10, 2), size("xl", "XL", 8, 0)],
    photographs: photos("betweenShots", "whiteWall", "mending"),
    maker: "Designed by Maninder Singh, made in Ludhiana",
    madeWith: "a workshop in Ludhiana",
    shipsFrom: "india",
    packedWeight: 0.4,
    details: "Heavyweight cotton, garment dyed, printed by hand. Test data.",
    sizeAndFit: "Relaxed fit. Size S is sold out in this sample, to show a refused size.",
    care: "Wash cold, inside out. Dry flat in the shade.",
  }),
  piece(3, { name: "Eclipse", slug: { _type: "slug", current: "eclipse" }, category: ref("editions-category-print"), editionType: "numbered", quantity: 25, price: 180, soldCount: 25, photographs: photos("eclipse"), details: "Archival pigment print, 40 by 50 cm. Sold out in this sample. Test data." }),
  piece(4, { name: "Inlay", slug: { _type: "slug", current: "inlay" }, category: ref("editions-category-original"), editionType: "one-of-one", quantity: 1, price: 1200, packedWeight: 2.5, photographs: photos("inlay", "paperBox"), details: "One original, signed. Test data." }),
  piece(5, { name: "Still Water Tray", slug: { _type: "slug", current: "still-water-tray" }, category: ref("editions-category-object"), editionType: "limited", quantity: 30, price: 140, soldCount: 4, packedWeight: 1.4, photographs: photos("stillWater", "watcher"), maker: "Sample Artist with Maninder Singh", collaborators: [{ ...ref(collaborator._id), _key: "c1" }], details: "Glazed stoneware. Test data." }),
  piece(6, { name: "Corner Overshirt", slug: { _type: "slug", current: "corner-overshirt" }, category: ref("editions-category-clothing"), editionType: "limited", quantity: 24, price: 160, sizes: [size("m", "M", 8, 3), size("l", "L", 8, 1), size("xl", "XL", 8, 0)], photographs: photos("corner", "whiteWall"), packedWeight: 0.8, details: "Washed cotton twill. Test data." }),
  piece(7, { name: "Look Up", slug: { _type: "slug", current: "look-up" }, category: ref("editions-category-print"), editionType: "numbered", quantity: 20, price: 150, soldCount: 11, photographs: photos("lookUp"), details: "Archival pigment print, 30 by 40 cm. Test data." }),
  piece(8, { name: "Paper Box Notebook", slug: { _type: "slug", current: "paper-box-notebook" }, category: ref("editions-category-object"), editionType: "limited", quantity: 50, price: 45, soldCount: 3, packedWeight: 0.3, photographs: photos("paperBox", "goodEarth"), maker: "Made with a bindery in Toronto", madeWith: "a bindery in Toronto", details: "Cloth bound, 96 pages. Test data." }),
];

const ALL = [...categories, collaborator, collection, shipping, ...pieces];

if (process.argv.includes("--delete")) {
  const ids = (await client.fetch(`*[(_type match "editions*") && (isTestData == true || _id in $fixed)]._id`, { fixed: ALL.map((d) => d._id) }))
    .concat(ALL.map((d) => `drafts.${d._id}`));
  const tx = client.transaction();
  // Pieces before what they reference.
  [...new Set(ids)].sort((a, b) => Number(b.includes("piece")) - Number(a.includes("piece"))).forEach((id) => tx.delete(id));
  await tx.commit();
  console.log(`Removed the sample content (${new Set(ids).size} ids checked).`);
} else {
  const tx = client.transaction();
  ALL.forEach((d) => tx.createOrReplace(d).delete(`drafts.${d._id}`));
  await tx.commit();
  console.log(`Published ${ALL.length} sample documents (test data).`);
}
