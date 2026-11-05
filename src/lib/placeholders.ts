/**
 * Placeholder content switch.
 *
 * The demo content in placeholder-data.ts (fake projects, journal entries,
 * hero slides, intro and About text, Instagram placeholder images) may only
 * ever appear when a developer opts in locally:
 *
 *   NEXT_PUBLIC_USE_PLACEHOLDERS=1 npm run dev
 *
 * It is forced off on Vercel (production and preview) and in CI, even if the
 * variable is set there by mistake. Everywhere else, a Sanity failure throws,
 * so ISR keeps serving the last real page instead of caching fake content.
 */

const requested = process.env.NEXT_PUBLIC_USE_PLACEHOLDERS === "1";

/** True on Vercel deployments (production or preview) and in CI. */
const hostedOrCI =
  (process.env.VERCEL_ENV !== undefined &&
    process.env.VERCEL_ENV !== "development") ||
  process.env.CI === "true";

export const placeholdersEnabled = requested && !hostedOrCI;

/**
 * Returns `placeholder` only when placeholders are enabled, otherwise
 * `empty`. Use it where a page previously fell back to demo content.
 */
export function devPlaceholder<T>(placeholder: T, empty: T): T {
  return placeholdersEnabled ? placeholder : empty;
}
