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
    widths: [960, 1280, 1600, 1920],
    quality: 80,
    fit: "crop",
    sizes: "100vw",
    aspectRatio: 16 / 9,
  },
};

// --------------- URL Builder Helpers ---------------

/**
 * Build a Sanity CDN URL for a given base URL, width, quality, and fit.
 * Works by appending query parameters to the existing CDN URL.
 * DPR is capped at 2 so we never serve 3× images on Retina.
 */
function buildUrl(
  baseUrl: string,
  width: number,
  quality: number,
  fit: "crop" | "max",
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", fit);
  url.searchParams.set("dpr", "2");
  return url.toString();
}

/**
 * Returns true if the URL is a Sanity CDN URL that supports transforms.
 */
function isSanityCdnUrl(url: string): boolean {
  return url.startsWith("https://cdn.sanity.io/");
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
export function getImageProps(
  image: SanityImageAsset | string | null | undefined,
  context: ImageContext,
  altOverride?: string,
): ImageProps {
  const profile = profiles[context];

  // ——— No image ———
  if (!image) {
    return {
      src: "/images/project-placeholder-1.svg",
      sizes: profile.sizes,
      width: 640,
      height: Math.round(640 / profile.aspectRatio),
      alt: altOverride || "",
    };
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

  // ——— Full SanityImageAsset ———
  const baseUrl = image.url;
  const largest = profile.widths[profile.widths.length - 1];

  const src = isSanityCdnUrl(baseUrl)
    ? buildUrl(baseUrl, largest, profile.quality, profile.fit)
    : baseUrl;

  const srcSet = isSanityCdnUrl(baseUrl)
    ? profile.widths
        .map(
          (w) =>
            `${buildUrl(baseUrl, w, profile.quality, profile.fit)} ${w}w`,
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
    alt: altOverride || image.alt || "",
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

