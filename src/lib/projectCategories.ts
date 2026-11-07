/*
 * Project categories as addresses: /projects/category/<slug>. A project's
 * category is free text in Sanity ("Photography", "Photography,
 * Collaborations"), so its address is made from it: lowercase, and every
 * run of other characters becomes one hyphen.
 */

/** "Photography, Collaborations" becomes "photography-collaborations". */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The slug the filter used before (?filter=…): lowercase, spaces became
 * hyphens and everything else stayed. Old addresses are matched with it
 * and sent on to the new one.
 */
export function legacyCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

/** The address of a category's view, or of all projects. */
export function categoryHref(category: string | null): string {
  return category ? `/projects/category/${categorySlug(category)}` : "/projects";
}
