import {
  renderOgImage,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "House of Singh — Maninder Singh";

// Sitewide default OG image — branded, text-only on the warm background.
// Used by the home page, listing pages, and utility pages that don't have
// their own cover-based opengraph-image.
export default async function Image() {
  return renderOgImage({
    title: "Design, photography, and intentional living.",
    coverUrl: null,
  });
}
