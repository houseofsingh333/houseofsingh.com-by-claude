import { client } from "./client";

/**
 * Server-side fetch helper with ISR caching.
 * All pages revalidate every 60 seconds by default.
 * Returns null when Sanity is not configured (env vars missing).
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

  return client.fetch<T>(query, params, {
    next: { revalidate },
  });
}
