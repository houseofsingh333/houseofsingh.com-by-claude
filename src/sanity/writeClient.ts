import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, isSanityConfigured } from "./env";

/**
 * Sanity client with write access — used only in server-side API routes.
 * Requires SANITY_API_WRITE_TOKEN in environment variables.
 * Returns null when env vars are not set.
 */
const token = process.env.SANITY_API_WRITE_TOKEN ?? "";

export const writeClient =
  isSanityConfigured && token.length > 0
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token,
      })
    : null;
