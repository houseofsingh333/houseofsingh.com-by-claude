/**
 * scripts/photo-prep.mjs
 *
 * Prepares one photograph for upload (used by add-project-photos.mjs):
 * turns it upright, keeps only its colour profile (every location, camera
 * and other metadata is removed), saves it as a progressive JPEG at quality
 * 83, and checks it: width, shape, sharpness and how compressed the source
 * already was. The checks warn; only a hero under 1600px wide is refused.
 * A cover or hero wider than COVER_MAX is resized to it.
 *
 * Image work uses sharp, which Next.js already installs for its image
 * optimisation. iPhone photographs (HEIC) are decoded by heic-decode (a
 * development package, used only on your computer); they are in Display P3
 * colour, so their JPEG is given the Display P3 profile, unchanged.
 */
import { readFileSync, statSync } from "node:fs";
import { basename, extname } from "node:path";

/** Output quality: within the approved 82 to 85. */
export const JPEG_QUALITY = 83;
/** Widths, in pixels. */
export const HERO_MIN = 2400;
export const HERO_REFUSE = 1600;
export const SECTION_MIN = 1600;
/**
 * A cover or hero is stored at most this wide (never enlarged): the site's
 * largest photograph size is 1920, so 2800 keeps room for a sharp crop and
 * a large screen without uploading a camera's full 6000px (the Sifti da
 * Ghar cover went up at 6248px, 13 Nov). Other photographs keep their size.
 */
export const COVER_MAX = 2800;
/**
 * Variance of the Laplacian (at 1024px) below which a photograph is likely
 * soft. Sharp photographs measure about 300 to 600; a 1.5px blur on a 2400px
 * photograph measures about 120. Soft on purpose (fog, shallow focus) can
 * also fall below it, so it only warns.
 */
export const SOFT_BELOW = 120;
/** Estimated JPEG quality of the source below which it was heavily compressed. */
export const COMPRESSED_BELOW = 70;

/** The photograph formats accepted. */
export const PHOTO = /\.(jpe?g|png|heic|heif|tiff?|webp)$/i;
const HEIC = /\.(heic|heif)$/i;

/** "hero.jpg", "00-hero.jpg" or "00 Hero.png" is the project's hero (its cover image). */
export function isHero(file) {
  return /^(\d+[\s._-]*)?hero$/i.test(basename(file, extname(file)).trim());
}

// The standard (IJG) luminance quantisation table, in zigzag order as JPEG stores it.
const STD_LUMA = [16, 11, 12, 14, 12, 10, 16, 14, 13, 14, 18, 17, 16, 19, 24, 40, 26, 24, 22, 22, 24, 49, 35, 37, 29, 40, 58, 51, 61, 60, 57, 51, 56, 55, 64, 72, 92, 78, 64, 68, 87, 69, 55, 56, 80, 109, 81, 87, 95, 98, 103, 104, 103, 62, 77, 113, 121, 112, 100, 120, 92, 101, 103, 99];

/**
 * The quality a JPEG was saved at, estimated from its luminance table
 * (the usual IJG scaling), or null for other formats or an unusual file.
 */
export function estimateJpegQuality(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 4 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xdb) {
      let j = i + 4;
      while (j < i + 2 + len) {
        const precision = buf[j] >> 4;
        const id = buf[j] & 0x0f;
        const table = [];
        for (let k = 0; k < 64; k++) table.push(precision ? buf.readUInt16BE(j + 1 + k * 2) : buf[j + 1 + k]);
        if (id === 0) {
          const scale = table.reduce((s, q, k) => s + (q * 100) / STD_LUMA[k], 0) / 64;
          const q = scale <= 100 ? (200 - scale) / 2 : 5000 / scale;
          return Math.max(1, Math.min(100, Math.round(q)));
        }
        j += 1 + 64 * (precision ? 2 : 1);
      }
    }
    if (marker === 0xda) return null; // image data began without a table
    i += 2 + len;
  }
  return null;
}

/** How sharp a photograph looks: the variance of its Laplacian, measured at 1024px. */
async function sharpness(sharp, buf) {
  const { data, info } = await sharp(buf)
    .rotate()
    .greyscale()
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let n = 0;
  let sum = 0;
  let sq = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const v = data[i - w] + data[i + w] + data[i - 1] + data[i + 1] - 4 * data[i];
      sum += v;
      sq += v * v;
      n++;
    }
  }
  const mean = sum / n;
  return Math.round(sq / n - mean * mean);
}

/** The ICC profile sharp uses for Display P3, read once from a tiny image. */
let p3Profile = null;
async function displayP3(sharp) {
  if (!p3Profile) {
    const probe = await sharp({ create: { width: 1, height: 1, channels: 3, background: "#808080" } }).withIccProfile("p3").jpeg().toBuffer();
    p3Profile = (await sharp(probe).metadata()).icc;
  }
  return p3Profile;
}

/** The JPEG with an ICC profile attached (an APP2 segment after the start), pixels unchanged. */
function attachIcc(jpeg, icc) {
  const head = Buffer.from("ICC_PROFILE\0", "latin1");
  const length = 2 + head.length + 2 + icc.length;
  if (length > 0xffff) return jpeg;
  const seg = Buffer.alloc(4);
  seg.writeUInt16BE(0xffe2, 0);
  seg.writeUInt16BE(length, 2);
  return Buffer.concat([jpeg.subarray(0, 2), seg, head, Buffer.from([1, 1]), icc, jpeg.subarray(2)]);
}

/** A HEIC photograph as sharp input: its pixels, already upright. */
async function decodeHeic(sharp, source) {
  let decode;
  try {
    decode = (await import("heic-decode")).default;
  } catch {
    console.error("\nThe HEIC decoder (heic-decode) is missing. Run npm ci in the website's folder first.\n");
    process.exit(1);
  }
  const { width, height, data } = await decode({ buffer: source });
  return sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), { raw: { width, height, channels: 4 } });
}

/**
 * Reads, checks and prepares one photograph.
 * Returns { file, hero, width, height, before, after, buffer, flags, refused }.
 * `options.hero` overrides the file name rule; `options.minWidth` false skips
 * the width checks (a logo).
 */
export async function preparePhoto(sharp, path, options = {}) {
  const file = basename(path);
  const hero = options.hero ?? isHero(file);
  const raw = readFileSync(path);
  const heic = HEIC.test(file);
  // HEIC is decoded once to pixels (upright); everything else is read by sharp itself.
  const source = heic ? await (await decodeHeic(sharp, raw)).png({ compressionLevel: 1 }).toBuffer() : raw;
  const meta = await sharp(source).metadata();
  // Upright dimensions (a phone's portrait photograph is often stored sideways).
  const sideways = (meta.orientation ?? 1) >= 5;
  const width = sideways ? meta.height : meta.width;
  const height = sideways ? meta.width : meta.height;
  const flags = [];
  let refused = null;

  if (options.minWidth === false) {
    /* a logo: no width checks */
  } else if (hero && width < HERO_REFUSE) refused = `hero only ${width}px wide; a hero must be at least ${HERO_REFUSE}px (${HERO_MIN}px recommended)`;
  else if (hero && width < HERO_MIN) flags.push(`hero under ${HERO_MIN}px wide (${width}px)`);
  else if (!hero && width < SECTION_MIN) flags.push(`under ${SECTION_MIN}px wide (${width}px)`);
  if (hero && height > width) flags.push("portrait photograph in the hero slot, which is shown wide (about 16:9) on desktop");

  const logo = options.minWidth === false;
  const sharpVar = logo ? null : await sharpness(sharp, source);
  if (sharpVar !== null && sharpVar < SOFT_BELOW) flags.push(`likely soft or blurred (sharpness ${sharpVar}, below ${SOFT_BELOW})`);
  const quality = meta.format === "jpeg" ? estimateJpegQuality(raw) : null;
  if (quality !== null && quality < COMPRESSED_BELOW) flags.push(`heavily compressed source (saved at about quality ${quality})`);

  // Upright, flattened onto white if it has transparency, colour profile
  // kept, everything else (location, camera, dates, software) removed.
  // A logo with transparency stays a PNG (on the canvas a JPEG would show a
  // white box); every photograph becomes a JPEG.
  const png = logo && meta.hasAlpha;
  // Covers and heroes: at most COVER_MAX wide (options.maxWidth overrides).
  const maxWidth = logo ? null : (options.maxWidth ?? (hero ? COVER_MAX : null));
  const resize = maxWidth && width > maxWidth ? { width: maxWidth, withoutEnlargement: true } : null;
  let buffer = png
    ? await sharp(source).rotate().keepIccProfile().png({ compressionLevel: 9, palette: false }).toBuffer()
    : await (resize ? sharp(source).rotate().resize(resize) : sharp(source).rotate())
        .flatten({ background: "#ffffff" })
        .keepIccProfile()
        // mozjpeg's smaller files, with the standard (Annex K) tables, so
        // quality 83 here is the quality 83 every other tool reports.
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true, quantisationTable: 0 })
        .toBuffer();
  // An iPhone's HEIC is in Display P3: the decoded pixels keep those colours,
  // so the JPEG is labelled Display P3 (not converted, which would dull them).
  if (heic) buffer = attachIcc(buffer, await displayP3(sharp));

  // The size stored: the source's, or the cover's resized width.
  const stored = resize ? { width: maxWidth, height: Math.round((height * maxWidth) / width) } : { width, height };
  return { file, hero, width, height, stored, before: statSync(path).size, after: buffer.length, buffer, format: png ? "png" : "jpeg", flags, refused, sharpness: sharpVar, quality };
}

/** sharp, from Next.js's own install; a clear message if it is missing. */
export async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error("\nThe image library (sharp) is missing. Run npm ci in the website's folder first.\n");
    process.exit(1);
  }
}

export const kb = (bytes) => `${Math.round(bytes / 1024).toLocaleString("en-CA")} KB`;
