import { placeholdersEnabled } from "@/lib/placeholders";

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

export type ImageContext = "thumbnail" | "body" | "hero" | "banner";

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
    widths: [640, 750, 828, 960, 1280],
    quality: 75,
    fit: "max",
    sizes: "(min-width: 768px) 640px, 100vw",
    aspectRatio: 16 / 9,
  },
  hero: {
    widths: [640, 750, 828, 960, 1280, 1600, 1920],
    quality: 75,
    fit: "crop",
    sizes: "100vw",
    aspectRatio: 16 / 9,
  },
  /**
   * Full-bleed decorative background (e.g. the Spotlight billboard). Same
   * full-width display as `hero`, but capped lower: these are portrait
   * source images behind heavy gradient/grain overlays, so requesting
   * 1600–1920px variants only wasted bandwidth.
   */
  banner: {
    widths: [640, 750, 828, 960, 1280],
    quality: 70,
    fit: "crop",
    sizes: "100vw",
    aspectRatio: 4 / 5,
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
  rect?: FrameRect,
): string {
  const url = new URL(baseUrl);
  // A framed photograph: only the part its frame shows (see frameRect).
  if (rect) url.searchParams.set("rect", `${rect.x},${rect.y},${rect.w},${rect.h}`);
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

type ImageProps = {
  src: string;
  srcSet?: string;
  sizes: string;
  width: number;
  height: number;
  blurDataURL?: string;
  alt: string;
  /** Per-context loader settings so transforms match the display profile. */
  quality?: number;
  /** True source width, so the loader never requests an upscaled variant. */
  intrinsicWidth?: number;
  /** True source height (with the width, the part a frame shows: frameRect). */
  intrinsicHeight?: number;
  fit?: "crop" | "max";
  hotspot?: { x: number; y: number };
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

  // A missing image shows placeholder art only in local development with
  // NEXT_PUBLIC_USE_PLACEHOLDERS. Everywhere else src is empty and
  // SanityImage renders nothing, leaving its calm frame in place.
  const placeholder = (alt: string): ImageProps => ({
    src: placeholdersEnabled ? "/images/project-placeholder-1.svg" : "",
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

  // For Sanity CDN images the loader (makeSanityLoader) applies every transform (width,
  // quality, format, focal point). Passing an already-transformed URL here
  // made next/image request the bare asset as well as the loader's variants —
  // the same image downloaded twice, once unoptimised. Hand the loader the
  // clean base URL and let it own the transforms.
  const src = baseUrl;

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
    quality: profile.quality,
    fit: profile.fit,
    hotspot: image.hotspot,
    intrinsicWidth: image.width,
    intrinsicHeight: image.height,
  };
}

/**
 * Build a next/image loader bound to a display profile, so the loader applies
 * the same quality, fit, and focal point that the profile intends.
 */
export function makeSanityLoader(opts: {
  quality?: number;
  fit?: "crop" | "max";
  hotspot?: { x: number; y: number };
  /** Intrinsic width of the source asset, used to avoid upscaling. */
  maxWidth?: number;
  /** Only this part of the photograph (a framed photograph, see frameRect). */
  rect?: FrameRect;
}) {
  return ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    if (!isSanityCdnUrl(src)) return src;
    // next/image builds its srcSet from next.config deviceSizes (up to 3840),
    // which for a 1080px-wide source meant requesting large upscaled variants
    // — wasted bytes for no visual gain. Never ask for more than the asset has
    // (for a framed photograph, more than the part its frame shows).
    const max = opts.rect?.w ?? opts.maxWidth;
    const capped = max ? Math.min(width, max) : width;
    return buildUrl(
      src,
      capped,
      quality ?? opts.quality ?? 75,
      opts.rect ? "max" : (opts.fit ?? "crop"),
      opts.rect ? undefined : opts.hotspot,
      opts.rect,
    );
  };
}

/** A rectangle of the source photograph, in its own pixels. */
export type FrameRect = { x: number; y: number; w: number; h: number };

/**
 * The part of a photograph its frame shows, so only that is downloaded
 * (14 Nov). A photograph filling a frame of another shape (object-fit:
 * cover) shows only a band of itself, placed by object-position; this is
 * that band, worked out the way the browser does: scaled to cover the frame,
 * then offset by the position (0 to 1, the same rounded values the page
 * gives object-position). The photograph in the frame looks the same; the
 * part the frame hides is no longer sent. Null when the photograph's size
 * is not known, or it already has the frame's shape.
 */
export function frameRect(
  width: number | undefined,
  height: number | undefined,
  aspect: number,
  position: { x: number; y: number } = { x: 0.5, y: 0.5 },
): FrameRect | null {
  if (!width || !height || !aspect) return null;
  const own = width / height;
  if (Math.abs(own - aspect) < 0.005) return null;
  if (own < aspect) {
    // Taller than the frame: the full width, a band of the height.
    const h = Math.round(width / aspect);
    return { x: 0, y: Math.round((height - h) * position.y), w: width, h };
  }
  // Wider than the frame: the full height, a band of the width.
  const w = Math.round(height * aspect);
  return { x: Math.round((width - w) * position.x), y: 0, w, h: height };
}


