#!/usr/bin/env node
/**
 * scripts/share-image.mjs
 *
 * Makes the site's share image (approved 12 Nov): the crest's emblem alone
 * (eagle, the lion's shield, horse and elephant; no HOUSE OF SINGH
 * wordmark, no "Estd." or "MMXIV"), from public/images/hos-logo.svg, its
 * lines in charcoal #221F1C on the canvas #F9F7F5, centred on a 1200 by
 * 630 image with generous margins. It is the share image of Home and of
 * every page without its own (About, Projects, project pages, Journal,
 * Contact, a month and the Shop keep theirs).
 *
 *   node scripts/share-image.mjs
 *
 * Writes src/app/opengraph-image.png and src/app/twitter-image.png (the
 * same picture; Next.js links them sitewide). It then checks the picture:
 * the whole crest lies inside the centre square (630 by 630, which
 * WhatsApp shows) with a margin all round, and nothing else is drawn.
 *
 * Needs Playwright with its Chromium (not a dependency of the site), as
 * scripts/favicons.mjs does.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const INK = "#221F1C";
const CANVAS = "#F9F7F5";
const SIZE = { width: 1200, height: 630 };
/** The crest's width on the image: 540 of 1200 (approved 13 Nov, from 480, so it reads at thumbnail size); the centre square keeps 45px either side. */
const CREST_WIDTH = 540;
/** The least margin, in pixels, the crest keeps inside the centre square. */
const SQUARE_MARGIN = 40;

const crest = readFileSync("public/images/hos-logo.svg", "utf8");
const inner = crest
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<defs>[\s\S]*?<\/defs>/, "")
  // "Estd." and "MMXIV".
  .replace(/<text[\s\S]*?<\/text>/g, "");

/**
 * The wordmark's letters share a shape with parts of the emblem, so they
 * are cut away rather than removed: the emblem ends at 636 (the animals'
 * feet and the shield's tip) and the letters start at 654, in the crest's
 * 900 units, and the cut is in that empty band.
 */
const CUT = 645;
const emblem = `<defs><clipPath id="emblem"><rect x="0" y="0" width="900" height="${CUT}"/></clipPath></defs><g clip-path="url(#emblem)">${inner}</g>`;

/** Where anything darker than the canvas is drawn on a PNG, in pixels. */
async function drawnArea(page, png) {
  return page.evaluate(async (dataUrl) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const { data } = g.getImageData(0, 0, c.width, c.height);
    let left = c.width, right = -1, top = c.height, bottom = -1;
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        // The canvas is #F9F7F5 (249, 247, 245).
        if (data[i] < 240 || data[i + 1] < 238 || data[i + 2] < 236) {
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
    return { left, right, top, bottom };
  }, `data:image/png;base64,${png.toString("base64")}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1800 }, deviceScaleFactor: 1 });

// First the emblem at twice the crest's size, to measure exactly where it is drawn.
await page.setContent(`<body style="margin:0;background:${CANVAS}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="1800" height="1800" fill="${INK}">${emblem}</svg></body>`);
const at2 = await drawnArea(page, await page.screenshot({ type: "png" }));
const box = { x: at2.left / 2, y: at2.top / 2, width: (at2.right + 1 - at2.left) / 2, height: (at2.bottom + 1 - at2.top) / 2 };

// Then the image: the emblem CREST_WIDTH wide, centred.
const scale = CREST_WIDTH / box.width;
const w = box.width * scale;
const h = box.height * scale;
await page.setViewportSize(SIZE);
await page.setContent(
  `<body style="margin:0;background:${CANVAS}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" width="${w}" height="${h}" fill="${INK}" style="position:absolute;left:${(SIZE.width - w) / 2}px;top:${(SIZE.height - h) / 2}px">${emblem}</svg></body>`,
);
const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, ...SIZE } });

// The check: where anything other than the canvas is drawn.
const drawn = await drawnArea(page, png);
await browser.close();

const square = { left: (SIZE.width - SIZE.height) / 2, right: (SIZE.width + SIZE.height) / 2, top: 0, bottom: SIZE.height };
const margins = {
  left: drawn.left - square.left,
  right: square.right - 1 - drawn.right,
  top: drawn.top - square.top,
  bottom: square.bottom - 1 - drawn.bottom,
};
const least = Math.min(...Object.values(margins));
if (least < SQUARE_MARGIN) throw new Error(`The crest comes within ${least}px of the centre square's edge (at least ${SQUARE_MARGIN} wanted): ${JSON.stringify(margins)}`);

writeFileSync("src/app/opengraph-image.png", png);
writeFileSync("src/app/twitter-image.png", png);
console.log(
  `Written: src/app/opengraph-image.png and twitter-image.png, ${SIZE.width} by ${SIZE.height}, ${Math.round(png.length / 1024)} KB.`,
  `\nThe crest: ${Math.round(w)} by ${Math.round(h)}, centred. Inside the centre square its margins are`,
  `left ${margins.left}, right ${margins.right}, top ${margins.top}, bottom ${margins.bottom} px.`,
);
