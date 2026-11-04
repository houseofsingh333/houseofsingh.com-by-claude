import type { Metadata, ResolvingMetadata } from "next";

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
