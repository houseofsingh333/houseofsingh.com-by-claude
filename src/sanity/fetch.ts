import { client } from "./client";

/**
 * Server-side fetch helper with ISR caching.
 * All pages revalidate every 60 seconds by default.
 * Returns null when Sanity is not configured or the API is unreachable.
 * This means a Sanity outage never breaks the site — components fall back
 * to placeholder data instead.
 *
 * Usage in a server component:
 *   const data = await sanityFetch<MyType>({ query, params });
 */
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
}: {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
}): Promise<T | null> {
  if (!client) return null;

  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate },
    });
  } catch {
    // Network error, Sanity outage, or build environment without internet.
    // Fall back to null so components use placeholder data.
    return null;
  }
}
