/*
 * Search descriptions written in the code (the rest come from Sanity).
 * Each is 120 to 155 characters, the length search results show in full,
 * written only from facts already on the page.
 */

export const JOURNAL_TITLE = "Journal";
export const JOURNAL_DESCRIPTION =
  "The House of Singh journal: photographs and short notes by Maninder Singh, a Toronto creative, kept by year and month since 2021.";

export const PROJECTS_TITLE = "Projects";
export const PROJECTS_DESCRIPTION =
  "Selected projects by Maninder Singh, from photography to collaborations, including Zamana, a vintage inspired study of Sikh migration.";

export const PRIVACY_DESCRIPTION =
  "What House of Singh collects through this website, where it is kept, how it is used, and how to leave the newsletter. No tracking, no ads.";

export const TERMS_DESCRIPTION =
  "The conditions for using the House of Singh website: browse freely, ask before using any work commercially, and Ontario law applies.";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** A month of the journal archive, for example "July 2025". */
export function monthName(year: number, month: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

/** The description of one month of the journal archive. */
export function journalMonthDescription(year: number, month: number): string {
  return `Entries from ${monthName(year, month)} in the House of Singh journal: photographs and short notes kept by Maninder Singh, a Toronto creative.`;
}

/**
 * A project page's description when the project has none of its own in
 * Sanity (no SEO description and no excerpt): its title, then who made it.
 * Kept within 155 characters for any title up to about 40 characters.
 */
export function projectFallbackDescription(title: string): string {
  const full = `${title}, a project from House of Singh by Maninder Singh, creative director, photographer and multidisciplinary designer.`;
  if (full.length <= 155) return full.length >= 120 ? full : `${full} Based in Toronto.`;
  return `${title}, a project from House of Singh by Maninder Singh in Toronto.`;
}

/** Pages kept out of search engines still say what they are, under their own address (audit S2). */
export const ARTISTS_DESCRIPTION =
  "For artists: propose a collaboration with House of Singh Editions. How it works, and a short form to send your work and an idea.";
export const EDITIONS_TERMS_DESCRIPTION =
  "The terms of sale for House of Singh Editions: who sells the pieces, prices, shipping and duties, returns and how to reach us.";
export const UNSUBSCRIBE_DESCRIPTION = "Stop receiving emails from House of Singh.";
