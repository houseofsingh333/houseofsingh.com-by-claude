import { client } from "./client";
import { placeholdersEnabled } from "@/lib/placeholders";

/**
 * Server side fetch helper with ISR caching (revalidates every 60 seconds by
 * default).
 *
 * On any Sanity failure (network error, timeout, outage, or Sanity not
 * configured) this THROWS. That is deliberate: when a background
 * revalidation throws, Next.js keeps serving the last successfully rendered
 * page, so visitors keep seeing real content and never a cached placeholder.
 * At build time a failure fails the build, which is safer than deploying
 * placeholder content.
 *
 * It returns null only when Sanity answered successfully with no document,
 * or when local placeholders are explicitly enabled (see placeholders.ts).
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
  if (!client) {
    if (placeholdersEnabled) return null;
    throw new Error(
      "[sanity] Sanity is not configured: NEXT_PUBLIC_SANITY_PROJECT_ID is missing.",
    );
  }

  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate },
    });
  } catch (error) {
    if (placeholdersEnabled) {
      console.warn("[sanity] Request failed; using local placeholders.", error);
      return null;
    }
    console.error("[sanity] Request failed.", {
      query: query.slice(0, 120),
      params,
      error,
    });
    throw new Error("[sanity] Request failed.", { cause: error });
  }
}
