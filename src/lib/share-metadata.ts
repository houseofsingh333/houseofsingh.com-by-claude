import type { Metadata, ResolvingMetadata } from "next";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import type { SanityImage } from "@/lib/types";

/**
 * Share card metadata (Open Graph and Twitter) for a page.
 *
 * In Next.js a page that sets `openGraph` or `twitter` replaces the parent's
 * object entirely, which would drop the sitewide share image, site name,
 * locale and Twitter handles. So this reads the already resolved parent
 * metadata and keeps everything from it, changing only the title and
 * description to the page's own, and giving the card the page's own address
 * (og:url, its canonical path; metadataBase makes it absolute).
 */
export async function shareCard(
  parent: ResolvingMetadata,
  title: string,
  description: string,
  url: string,
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
      url,
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

/** Share photo size: the standard Open Graph and Twitter large card. */
const SHARE_PHOTO = { width: 1200, height: 630 };

/**
 * The page's cover photo as a share image, straight from the Sanity CDN:
 * 1200x630, cropped around the editor's focal point (the same crop the site
 * uses for covers), JPEG at quality 80. JPEG rather than AVIF or WebP
 * because some social platforms still reject the newer formats.
 * Null when the page has no cover on the Sanity CDN.
 */
function coverShareImage(
  cover: SanityImage | null | undefined,
  alt: string,
) {
  if (!cover) return null;
  const raw = typeof cover === "string" ? cover : cover.url;
  if (!raw || !raw.startsWith("https://cdn.sanity.io/")) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  url.search = "";
  url.searchParams.set("w", String(SHARE_PHOTO.width));
  url.searchParams.set("h", String(SHARE_PHOTO.height));
  url.searchParams.set("fit", "crop");
  const hotspot = typeof cover === "object" ? cover.hotspot : undefined;
  if (hotspot && typeof hotspot.x === "number" && typeof hotspot.y === "number") {
    url.searchParams.set("crop", "focalpoint");
    url.searchParams.set("fp-x", String(hotspot.x));
    url.searchParams.set("fp-y", String(hotspot.y));
  }
  url.searchParams.set("fm", "jpg");
  url.searchParams.set("q", "80");
  return {
    url: url.toString(),
    width: SHARE_PHOTO.width,
    height: SHARE_PHOTO.height,
    type: "image/jpeg",
    alt,
  };
}

/**
 * Share images for a journal entry or project: its cover photo when it has
 * one, otherwise the generated branded card from the page's opengraph-image
 * and twitter-image routes.
 */
export function pageShareImages({
  path,
  cover,
  pageTitle,
  cardAlt,
}: {
  path: string;
  cover: SanityImage | null | undefined;
  pageTitle: string;
  cardAlt: string;
}) {
  // The cover's own alt text describes the photo; a decorative cover, or one
  // without alt text, is described by the page title instead.
  const coverAlt =
    cover && typeof cover === "object" && !cover.isDecorative && cover.alt?.trim()
      ? cover.alt.trim()
      : pageTitle;
  const photo = coverShareImage(cover, coverAlt);
  if (photo) return { openGraph: [photo], twitter: [photo] };
  return routeShareImages(path, cardAlt);
}

/**
 * The share card with a photograph instead of the sitewide card: the given
 * photo, cropped 1200 by 630 around its focal point. Unchanged when there is
 * no photo on the Sanity CDN (audit P1).
 */
export function withSharePhoto<T extends Pick<Metadata, "openGraph" | "twitter">>(
  card: T,
  photo: { image: SanityImage; alt?: string | null } | null | undefined,
  fallbackAlt: string,
): T {
  const shared = photo ? coverShareImage(photo.image, photo.alt?.trim() || fallbackAlt) : null;
  if (!shared) return card;
  return {
    ...card,
    openGraph: { ...(card.openGraph ?? {}), images: [shared] },
    twitter: { ...(card.twitter ?? {}), images: [shared] },
  } as T;
}
