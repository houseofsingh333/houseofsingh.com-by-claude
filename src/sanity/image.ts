import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

/**
 * Generate optimised Sanity CDN image URLs.
 * Returns null when Sanity is not configured.
 * Usage: sanityImage(source)?.width(800).url()
 */
export function sanityImage(
  source: Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0]
) {
  if (!client) return null;
  return imageUrlBuilder(client).image(source);
}
