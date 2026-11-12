#!/usr/bin/env node
/**
 * scripts/favicons.mjs
 *
 * Makes the site's icons from the crest's lion (approved 12 Nov): the crest
 * (public/images/hos-logo.svg, a 900 by 900 viewBox) clipped to the lion's
 * shield and cropped to viewBox "322 356 246 246", its lines in charcoal
 * #221F1C at their original weight on the canvas #F9F7F5.
 *
 *   node scripts/favicons.mjs
 *
 * Writes:
 *   public/images/favicon-lion.svg   the cropped source, for reference
 *   src/app/favicon.ico              16, 32 and 48 (Next.js app icon)
 *   src/app/icon.png                 32 (Next.js app icon)
 *   src/app/apple-icon.png           180 (Next.js app icon)
 *   public/apple-touch-icon.png      180, for devices that ask for it directly
 *   public/icon-192.png, icon-512.png  listed in public/site.webmanifest
 *
 * Needs Playwright with its Chromium (not a dependency of the site), as the
 * tests in tests/ do. Each size is drawn by the browser straight from the
 * vector at that size, so nothing is scaled down from a larger picture.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const INK = "#221F1C";
const CANVAS = "#F9F7F5";
const VIEW = "322 356 246 246";
const SHIELD = "356,366 534,366 534,520 468,592 446,601 424,592 356,520";

const crest = readFileSync("public/images/hos-logo.svg", "utf8");
// The crest's drawing, without its "Estd." and "MMXIV" words and their style.
const inner = crest
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<defs>[\s\S]*?<\/defs>/, "")
  .replace(/<text[\s\S]*?<\/text>/g, "");

const [x, y, w, h] = VIEW.split(" ").map(Number);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW}">
<defs><clipPath id="lion"><polygon points="${SHIELD}"/></clipPath></defs>
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${CANVAS}"/>
<g clip-path="url(#lion)" fill="${INK}">${inner}</g>
</svg>
`;
writeFileSync("public/images/favicon-lion.svg", svg);

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
/** The lion drawn at `size` on a canvas, as an RGBA PNG (the format .ico expects). */
async function png(size) {
  const dataUrl = await page.evaluate(
    async ({ svg, size }) => {
      const img = new Image(size, size);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.getContext("2d").drawImage(img, 0, 0, size, size);
      return canvas.toDataURL("image/png");
    },
    { svg, size },
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/** An .ico holding PNG images (supported by every current browser). */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, at);
    head.writeUInt8(size >= 256 ? 0 : size, at + 1);
    head.writeUInt8(0, at + 2);
    head.writeUInt8(0, at + 3);
    head.writeUInt16LE(1, at + 4);
    head.writeUInt16LE(32, at + 6);
    head.writeUInt32LE(data.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((im) => im.data)]);
}

const sizes = {};
for (const size of [16, 32, 48, 180, 192, 512]) sizes[size] = await png(size);
await browser.close();

writeFileSync("src/app/favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: sizes[size] }))));
writeFileSync("src/app/icon.png", sizes[32]);
writeFileSync("src/app/apple-icon.png", sizes[180]);
writeFileSync("public/apple-touch-icon.png", sizes[180]);
writeFileSync("public/icon-192.png", sizes[192]);
writeFileSync("public/icon-512.png", sizes[512]);
console.log("favicon.ico (16, 32, 48), icon.png 32, apple-icon.png 180, icon-192.png, icon-512.png, favicon-lion.svg");
