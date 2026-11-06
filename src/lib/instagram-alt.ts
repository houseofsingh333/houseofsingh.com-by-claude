import type { InstagramPhoto } from "@/components/contact/InstagramPhotoPlate";

/**
 * Lists Instagram photos that have no alt text and are not marked decorative.
 * Sanity requires alt text on these photos, so this should never find any;
 * if it does, the photo is named in the build and server log so it can be
 * fixed in the Studio. The site does not invent a generic description.
 */
export function reportInstagramAltGaps(photos: InstagramPhoto[]): void {
  const gaps = photos.filter((p) => !p.isDecorative && !p.alt?.trim());
  if (gaps.length === 0) return;
  console.warn(
    `[instagram] ${gaps.length} photo(s) without alt text: ` +
      gaps.map((p) => p.permalink || p.id).join(", "),
  );
}
