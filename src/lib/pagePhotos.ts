import { sanityFetch } from "@/sanity/fetch";
import { menuPhotosQuery } from "@/sanity/queries";
import { hasImageAsset } from "@/lib/sanityImage";
import type { MenuPhoto, SanityImage } from "@/lib/types";

type Photo = { image?: SanityImage | null; alt?: string | null } | null;
type Sources = Partial<Record<PageKey, Photo>> & { set?: Partial<Record<PageKey, Photo>> | null };

export type PageKey = "home" | "about" | "projects" | "journal" | "contact";

/**
 * A main page's own photograph: the one chosen for it in Site Settings
 * (Menu), else its default (the first hero slide, the About portrait, the
 * first homepage project, the latest Journal entry, the Contact portrait
 * or else the About portrait).
 * The same photograph the menu shows, used as the page's share image so
 * the choice is made in one place (audit P1).
 */
export async function pagePhoto(key: PageKey): Promise<MenuPhoto | null> {
  const d = await sanityFetch<Sources | null>({ query: menuPhotosQuery });
  const options = key === "contact" ? [d?.set?.contact, d?.contact, d?.about] : [d?.set?.[key], d?.[key]];
  for (const o of options) if (o?.image && hasImageAsset(o.image)) return { image: o.image, alt: o.alt };
  return null;
}
