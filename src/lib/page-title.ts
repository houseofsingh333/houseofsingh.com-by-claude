import type { Metadata } from "next";

/**
 * Page titles: one separator, one site name.
 *
 * The root layout's title template appends " | House of Singh". Pages pass
 * only their own part ("About Maninder Singh"). Sanity SEO titles are free
 * text, so an editor may already have typed the site name or used a dash as
 * a separator; these helpers make sure neither reaches the rendered title.
 */

const SITE_NAME = "House of Singh";

/** The root layout's title template. Kept here so fullTitle() matches it. */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/**
 * Clean a title: trim leading and trailing whitespace first, collapse runs of
 * spaces to one, then replace a spaced dash used as a separator
 * (" — ", " – ", " - ") with " | ".
 */
export function normalizeTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\s{2,}/g, " ")
    .replace(/\s+[—–-]\s+/g, " | ");
}

/**
 * Value for `metadata.title`. If the title already names the site, it is
 * returned as `absolute` so the layout template does not append it again.
 */
export function pageTitle(raw: string): Metadata["title"] {
  const title = normalizeTitle(raw);
  return title.includes(SITE_NAME) ? { absolute: title } : title;
}

/**
 * The final rendered <title> string for a page part, exactly as the layout
 * template produces it. Used for share card titles so they match the tab.
 */
export function fullTitle(raw: string): string {
  const title = normalizeTitle(raw);
  return title.includes(SITE_NAME)
    ? title
    : TITLE_TEMPLATE.replace("%s", title);
}
