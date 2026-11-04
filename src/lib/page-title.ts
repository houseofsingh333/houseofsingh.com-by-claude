import type { Metadata } from "next";

/**
 * Page titles: one separator, one site name.
 *
 * The root layout's title template appends " | House of Singh". Pages pass
 * only their own part ("About Maninder Singh"). Sanity SEO titles are free
 * text, so an editor may already have typed the site name or used a dash as
 * a separator; these helpers make sure neither reaches the rendered title.
 */

export const SITE_NAME = "House of Singh";

/** Replace a spaced dash used as a separator (" — ", " – ", " - ") with " | ". */
export function normalizeTitle(raw: string): string {
  return raw
    .replace(/\s+[—–-]\s+/g, " | ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Value for `metadata.title`. If the title already names the site, it is
 * returned as `absolute` so the layout template does not append it again.
 */
export function pageTitle(raw: string): Metadata["title"] {
  const title = normalizeTitle(raw);
  return title.includes(SITE_NAME) ? { absolute: title } : title;
}
