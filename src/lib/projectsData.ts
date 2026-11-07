import { sanityFetch } from "@/sanity/fetch";
import { projectsListQuery } from "@/sanity/queries";
import { fallbackProjects } from "@/lib/placeholder-data";
import { devPlaceholder } from "@/lib/placeholders";
import { categorySlug } from "@/lib/projectCategories";
import type { SanityImageAsset } from "@/lib/sanityImage";

/*
 * The projects as the Projects page (the monograph) shows them: plain data,
 * safe to hand to the browser.
 */

/** One photograph on a project's plate. */
export type PlatePhoto = {
  url: string;
  lqip: string | null;
  /** Empty only for a photograph marked decorative in Sanity. */
  alt: string;
  hotspot: { x: number; y: number } | null;
};

export type MonographProject = {
  id: string;
  slug: string;
  title: string;
  /** The project's categories: "Photography, Collaborations" is both. */
  categories: string[];
  year: number | null;
  role: string | null;
  excerpt: string;
  isUpcoming: boolean;
  /** Up to four photographs that take turns on the plate (may be empty). */
  plates: PlatePhoto[];
};

/** A category the page can filter by, with its address slug. */
export type MonographCategory = { label: string; slug: string };

type RawImage = (SanityImageAsset & { isDecorative?: boolean | null }) | null | undefined;

type RawProject = {
  _id: string;
  title: string;
  slug: string;
  category?: string | null;
  year?: number | null;
  role?: string | null;
  excerpt?: string | null;
  isUpcoming?: boolean | null;
  thumbnail?: RawImage | string;
  thumbnailAlt?: string | null;
  plates?: RawImage[] | null;
  cover?: RawImage;
  sectionImages?: RawImage[] | null;
};

/** Split "Photography, Collaborations" into its categories. */
export function splitCategories(category: string | null | undefined): string[] {
  return (category ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function toPhoto(image: RawImage, title: string): PlatePhoto | null {
  if (!image?.url) return null;
  return {
    url: image.url,
    lqip: image.lqip ?? null,
    alt: image.isDecorative ? "" : (image.alt?.trim() || title),
    hotspot: image.hotspot ?? null,
  };
}

/**
 * The plate's photographs: the project's own Plate photographs when set,
 * otherwise the cover and then the first images of its content sections;
 * repeats removed, at most four. The thumbnail stands in when there is
 * nothing else.
 */
function platesOf(p: RawProject): PlatePhoto[] {
  const chosen = p.plates?.length ? p.plates : [p.cover, ...(p.sectionImages ?? [])];
  const seen = new Set<string>();
  const out: PlatePhoto[] = [];
  for (const image of chosen) {
    const photo = toPhoto(image, p.title);
    if (!photo || seen.has(photo.url)) continue;
    seen.add(photo.url);
    out.push(photo);
    if (out.length === 4) break;
  }
  if (out.length) return out;
  const thumb = typeof p.thumbnail === "string" ? { url: p.thumbnail } : p.thumbnail;
  const fallback = toPhoto(thumb as RawImage, p.title);
  if (fallback && typeof p.thumbnail !== "string" && p.thumbnailAlt) fallback.alt = fallback.alt || p.thumbnailAlt;
  return fallback ? [fallback] : [];
}

/** Every project, in the order the Projects page shows them. */
export async function loadMonographProjects(): Promise<MonographProject[]> {
  const data = await sanityFetch<RawProject[] | null>({ query: projectsListQuery });
  if (data?.length) {
    return data.map((p) => ({
      id: p._id,
      slug: p.slug,
      title: p.title,
      categories: splitCategories(p.category),
      year: typeof p.year === "number" ? p.year : null,
      role: p.role?.trim() || null,
      excerpt: p.excerpt?.trim() ?? "",
      isUpcoming: !!p.isUpcoming,
      plates: platesOf(p),
    }));
  }
  // Placeholder projects only in local development.
  return devPlaceholder(fallbackProjects, []).map((p) => ({
    id: p._id,
    slug: p.slug,
    title: p.title,
    categories: splitCategories(p.category),
    year: null,
    role: null,
    excerpt: p.excerpt ?? "",
    isUpcoming: !!p.isUpcoming,
    plates: p.thumbnailSrc ? [{ url: p.thumbnailSrc, lqip: null, alt: p.thumbnailAlt, hotspot: null }] : [],
  }));
}

/** The categories found across the projects, in first seen order. */
export function categoriesOf(projects: MonographProject[]): MonographCategory[] {
  const seen = new Map<string, MonographCategory>();
  for (const p of projects) {
    for (const label of p.categories) {
      const slug = categorySlug(label);
      if (slug && !seen.has(slug)) seen.set(slug, { label, slug });
    }
  }
  return [...seen.values()];
}
