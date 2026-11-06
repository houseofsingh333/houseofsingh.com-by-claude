import type { Metadata, ResolvingMetadata } from "next";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/**
 * Share card metadata (Open Graph and Twitter) for a page.
 *
 * In Next.js a page that sets `openGraph` or `twitter` replaces the parent's
 * object entirely, which would drop the sitewide share image, site name,
 * locale and Twitter handles. So this reads the already resolved parent
 * metadata and keeps everything from it, changing only the title and
 * description to the page's own.
 */
export async function shareCard(
  parent: ResolvingMetadata,
  title: string,
  description: string,
): Promise<Pick<Metadata, "openGraph" | "twitter">> {
  const { openGraph, twitter } = await parent;
  // `type` exists only on some members of Next's resolved Open Graph union.
  const ogType =
    openGraph && "type" in openGraph ? openGraph.type : undefined;

  return {
    openGraph: {
      ...(ogType ? { type: ogType } : {}),
      ...(openGraph?.locale ? { locale: openGraph.locale } : {}),
      ...(openGraph?.siteName ? { siteName: openGraph.siteName } : {}),
      ...(openGraph?.images ? { images: openGraph.images } : {}),
      title,
      description,
    } as Metadata["openGraph"],
    twitter: {
      ...(twitter?.card ? { card: twitter.card } : {}),
      ...(twitter?.site ? { site: twitter.site } : {}),
      ...(twitter?.creator ? { creator: twitter.creator } : {}),
      ...(twitter?.images ? { images: twitter.images } : {}),
      title,
      description,
    } as Metadata["twitter"],
  };
}

/**
 * Share images for a page whose opengraph-image and twitter-image routes live
 * outside its own folder.
 *
 * The journal and project article pages sit in the (site) route group, but
 * their share image routes stay at src/app/journal/[slug]/ and
 * src/app/projects/[slug]/. Inside a route group Next.js would add a hash
 * suffix to those image URLs (opengraph-image-abc123), changing addresses
 * that social platforms have already cached. Because the routes are not
 * colocated, Next.js no longer links them automatically, so the page links
 * them here with the same size, type and alt text as the routes themselves.
 */
export function routeShareImages(path: string, alt: string) {
  const image = (name: "opengraph-image" | "twitter-image") => ({
    url: `${path}/${name}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    type: OG_CONTENT_TYPE,
    alt,
  });
  return {
    openGraph: [image("opengraph-image")],
    twitter: [image("twitter-image")],
  };
}
