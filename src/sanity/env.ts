/**
 * Shared Sanity environment config.
 * Used by both the client (fetching) and the embedded Studio.
 *
 * Env vars required in Vercel and local .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  — your Sanity project id
 *   NEXT_PUBLIC_SANITY_DATASET     — usually "production"
 */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const isSanityConfigured = projectId.length > 0;
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2024-01-01";
