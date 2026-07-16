// --------------- Types ---------------

/** Shape returned by GROQ for image fields with asset metadata. */
export type SanityImageAsset = {
  url: string;
  lqip?: string;
  width?: number;
  height?: number;
  hotspot?: { x: number; y: number };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
  caption?: string;
  /** When true, the image is purely decorative — render an empty alt. */
  isDecorative?: boolean;
};

export type ImageContext = "thumbnail" | "body" | "hero";

// --------------- Profiles ---------------

const profiles: Record<
  ImageContext,
  {
    widths: number[];
    quality: number;
    fit: "crop" | "max";
    sizes: string;
    /** Fallback aspect ratio when dimensions are unknown */
    aspectRatio: number;
  }
> = {
  thumbnail: {
    widths: [320, 480, 640],
    quality: 65,
    fit: "crop",
    sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
    aspectRatio: 3 / 4,
  },
  body: {
    widths: [640, 960, 1280],
    quality: 75,
    fit: "max",
    sizes: "(min-width: 768px) 640px, 100vw",
    aspectRatio: 16 / 9,
  },
  hero: {
    widths: [640, 960, 1280, 1600, 1920],
    quality: 75,
    fit: "crop",
    sizes: "100vw",
    aspectRatio: 16 / 9,
  },
};

// --------------- URL Builder Helpers ---------------

/**
 * Build a Sanity CDN URL for a given base URL, width, quality, and fit.
 * Works by appending query parameters to the existing CDN URL.
 * No DPR multiplier — the responsive srcSet already provides multiple
 * widths so the browser picks the right one for its device pixel ratio.
 */
function buildUrl(
  baseUrl: string,
  width: number,
  quality: number,
  fit: "crop" | "max",
  hotspot?: { x: number; y: number },
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", fit);
  // When cropping, honour the editor's focal point so crops don't cut through
  // faces/subjects. Only applied when a hotspot exists — images without one are
  // unchanged (default centre crop).
  if (
    fit === "crop" &&
    hotspot &&
    typeof hotspot.x === "number" &&
    typeof hotspot.y === "number"
  ) {
    url.searchParams.set("crop", "focalpoint");
    url.searchParams.set("fp-x", String(hotspot.x));
    url.searchParams.set("fp-y", String(hotspot.y));
  }
  return url.toString();
}

/**
 * Returns true if the URL is a Sanity CDN URL that supports transforms.
 * Guards against null/undefined so it never calls string methods on nothing.
 */
function isSanityCdnUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && url.startsWith("https://cdn.sanity.io/");
}

/**
 * True only when an image field actually has a usable asset to render.
 *
 * A Sanity image object can be present yet carry no asset at all — for
 * example `{ _type: "image", alt: "…" }` with no `asset` key. GROQ then
 * projects `url` as null, so the object is truthy but unrenderable. Callers
 * must use this (not a bare truthiness check) before rendering an image or
 * building a URL, otherwise a null url reaches string methods and crashes.
 */
export function hasImageAsset(
  image: SanityImageAsset | string | null | undefined,
): image is SanityImageAsset | string {
  if (!image) return false;
  if (typeof image === "string") return image.length > 0;
  return typeof image.url === "string" && image.url.length > 0;
}

// --------------- Main API ---------------

export type ImageProps = {
  src: string;
  srcSet?: string;
  sizes: string;
  width: number;
  height: number;
  blurDataURL?: string;
  alt: string;
};

/**
 * Compute all image attributes for a given image and display context.
 *
 * Handles three cases:
 * 1. `SanityImageAsset` from CMS — full responsive srcSet + blur placeholder
 * 2. Plain Sanity CDN URL string — responsive srcSet, no blur
 * 3. Local path string (e.g. /images/...) — no transforms, pass through
 */
/**
 * Resolve the alt attribute for an image, enforcing accessible alt text.
 *
 * Precedence: explicit override → decorative (empty) → CMS alt. A meaningful
 * image with no alt is a content error: in development we surface a warning
 * instead of silently shipping an empty alt. Alt enforcement is primarily
 * guaranteed at the Sanity schema level (required unless marked decorative).
 */
function resolveAlt(
  altOverride: string | undefined,
  image?: SanityImageAsset,
): string {
  if (altOverride) return altOverride;
  if (image?.isDecorative) return "";
  const alt = image?.alt ?? "";
  if (!alt && process.env.NODE_ENV !== "production") {
    console.warn(
      `[SanityImage] Missing alt text for a non-decorative image${
        image?.url ? `: ${image.url}` : ""
      }. Add alt text in Sanity or mark the image decorative.`,
    );
  }
  return alt;
}

export function getImageProps(
  image: SanityImageAsset | string | null | undefined,
  context: ImageContext,
  altOverride?: string,
): ImageProps {
  const profile = profiles[context];

  const placeholder = (alt: string): ImageProps => ({
    src: "/images/project-placeholder-1.svg",
    sizes: profile.sizes,
    width: 640,
    height: Math.round(640 / profile.aspectRatio),
    alt,
  });

  // ——— No image at all ———
  if (!image) {
    return placeholder(altOverride || "");
  }

  // ——— Plain string URL ———
  if (typeof image === "string") {
    if (isSanityCdnUrl(image)) {
      const largest = profile.widths[profile.widths.length - 1];
      const src = buildUrl(image, largest, profile.quality, profile.fit);
      const srcSet = profile.widths
        .map((w) => `${buildUrl(image, w, profile.quality, profile.fit)} ${w}w`)
        .join(", ");
      return {
        src,
        srcSet,
        sizes: profile.sizes,
        width: largest,
        height: Math.round(largest / profile.aspectRatio),
        alt: altOverride || "",
      };
    }
    // Local file — no transforms
    return {
      src: image,
      sizes: profile.sizes,
      width: 640,
      height: Math.round(640 / profile.aspectRatio),
      alt: altOverride || "",
    };
  }

  // ——— Image object with no asset (present but unrenderable) ———
  // e.g. { _type: "image", alt: "…" } with no asset → url is null. Never
  // build a URL from it; fall back to the placeholder, keeping any alt.
  if (!image.url) {
    return placeholder(altOverride || image.alt || "");
  }

  // ——— Full SanityImageAsset ———
  const baseUrl = image.url;
  const largest = profile.widths[profile.widths.length - 1];

  const src = isSanityCdnUrl(baseUrl)
    ? buildUrl(baseUrl, largest, profile.quality, profile.fit, image.hotspot)
    : baseUrl;

  const srcSet = isSanityCdnUrl(baseUrl)
    ? profile.widths
        .map(
          (w) =>
            `${buildUrl(baseUrl, w, profile.quality, profile.fit, image.hotspot)} ${w}w`,
        )
        .join(", ")
    : undefined;

  const width = image.width || largest;
  const height = image.height || Math.round(width / profile.aspectRatio);

  return {
    src,
    srcSet,
    sizes: profile.sizes,
    width,
    height,
    blurDataURL: image.lqip || undefined,
    alt: resolveAlt(altOverride, image),
  };
}

/**
 * Next.js Image loader for Sanity CDN images.
 * Use as `loader={sanityLoader}` on `<Image>` when src is a Sanity CDN URL.
 */
export function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!isSanityCdnUrl(src)) return src;
  return buildUrl(src, width, quality || 75, "crop");
}

