/**
 * Sanity client — to be configured when Sanity is wired up.
 *
 * Required env vars (set in Vercel):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_TOKEN (for mutations like contact form)
 *
 * Install: npm install next-sanity @sanity/client
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2024-01-01";
