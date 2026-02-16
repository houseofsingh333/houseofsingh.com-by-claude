import { createClient, type SanityClient } from "next-sanity";
import { projectId, dataset, apiVersion, isSanityConfigured } from "./env";

/**
 * Read-only Sanity client used in server components.
 * Returns null when env vars are not set (build without Sanity).
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;
