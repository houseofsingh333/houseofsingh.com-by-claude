import { createClient, type SanityClient } from "next-sanity";
import { projectId, dataset, apiVersion, isSanityConfigured } from "./env";

/**
 * Read-only Sanity client used in server components.
 * Returns null when env vars are not set (build without Sanity).
 *
 * The 8 second timeout makes a slow Sanity fail fast instead of holding a
 * render for the library default of 5 minutes; sanityFetch then throws and
 * ISR keeps the last good page.
 *
 * The library's own retries are off (maxRetries: 0): sanityFetch retries
 * brief network failures and HTTP 429, 502, 503 and 504 itself, logged and
 * within one 8 second budget, so the two never stack.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      timeout: 8000,
      maxRetries: 0,
    })
  : null;
