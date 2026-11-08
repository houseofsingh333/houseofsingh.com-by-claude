/** Any Studio rule that takes a custom check (string, url and so on). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Customisable<R> = { custom: (fn: (value: any) => true | string) => R };

/*
 * Shared Studio rules, so the same mistake is caught the same way
 * everywhere (Studio safety, 8 Nov 2026).
 */

/** The categories a project may have; a project can have several, separated by commas. */
export const PROJECT_CATEGORIES = ["Photography", "Collaborations", "Design"] as const;

/** A link must be an address on this site (starting with /) or a full https:// address. */
export function linkRule<R>(rule: Customisable<R>): R {
  return rule.custom((value: unknown) => {
    if (value === undefined || value === null || value === "") return true;
    const v = String(value).trim();
    if (/^\/(?!\/)/.test(v) || /^https:\/\/[^\s]+$/.test(v)) return true;
    return "Use an address on this site starting with / (for example /projects/zamana) or a full address starting with https://";
  });
}

/** Only a full https:// address (outside links). */
export function httpsRule<R>(rule: Customisable<R>): R {
  return rule.custom((value: unknown) => {
    if (value === undefined || value === null || value === "") return true;
    return /^https:\/\/[^\s]+$/.test(String(value).trim()) ? true : "Use a full address starting with https://";
  });
}

/** The note on every slug field. */
export const SLUG_NOTE =
  "The page's address. Changing it after publishing breaks old links and search results: if you change it, add a Redirect from the old address to the new one (Redirects, in the Studio).";
