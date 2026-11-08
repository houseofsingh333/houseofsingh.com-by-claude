import { hasImageAsset, type SanityImageAsset } from "@/lib/sanityImage";
import type { SpotlightLink } from "@/lib/types";

export type HeroSource = "spotlight" | "cover" | "thumbnail" | "none";

type ProjectImages = {
  slug: string;
  isUpcoming?: boolean;
  /** The project's Photographs: the first stands in for a missing cover. */
  photographs?: SanityImageAsset[] | null;
  coverImage?: SanityImageAsset | null;
  thumbnail?: SanityImageAsset | null;
};

/** The site path a spotlight link points to, without origin or trailing slash. */
function spotlightPath(linkUrl: string | null | undefined): string | null {
  if (!linkUrl?.trim()) return null;
  try {
    const url = new URL(linkUrl.trim(), "https://houseofsingh.com");
    if (url.hostname !== "houseofsingh.com" && url.hostname !== "www.houseofsingh.com") {
      return null;
    }
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

/**
 * The photograph that opens a project page, and where it came from.
 *
 * An upcoming project uses the homepage spotlight image when the spotlight
 * links to this project. Otherwise: the cover image, then the thumbnail.
 * With none of these, no image ("none"): the page shows a calm canvas frame.
 */
export function projectHeroImage(
  project: ProjectImages,
  spotlight?: SpotlightLink | null,
): { image: SanityImageAsset | null; source: HeroSource } {
  if (
    project.isUpcoming &&
    spotlight &&
    hasImageAsset(spotlight.image) &&
    spotlightPath(spotlight.linkUrl) === `/projects/${project.slug}`
  ) {
    return { image: spotlight.image as SanityImageAsset, source: "spotlight" };
  }
  if (hasImageAsset(project.coverImage)) {
    return { image: project.coverImage as SanityImageAsset, source: "cover" };
  }
  const first = project.photographs?.[0];
  if (first?.url) {
    return { image: first, source: "cover" };
  }
  if (hasImageAsset(project.thumbnail)) {
    return { image: project.thumbnail as SanityImageAsset, source: "thumbnail" };
  }
  return { image: null, source: "none" };
}

/** The CSS object-position for an image's hotspot, so crops keep the subject. */
export function hotspotPosition(image: SanityImageAsset | null | undefined): string | undefined {
  const h = image?.hotspot;
  if (!h || typeof h.x !== "number" || typeof h.y !== "number") return undefined;
  const pct = (v: number) => `${Math.round(Math.min(1, Math.max(0, v)) * 1000) / 10}%`;
  return `${pct(h.x)} ${pct(h.y)}`;
}
