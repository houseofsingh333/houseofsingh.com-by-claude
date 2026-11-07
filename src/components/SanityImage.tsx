"use client";

import Image from "next/image";
import BlurUp, { blurUpImgProps, objectPositionOf } from "@/components/BlurUp";
import {
  getImageProps,
  makeSanityLoader,
  type SanityImageAsset,
  type ImageContext,
} from "@/lib/sanityImage";

type Props = {
  /** Sanity image asset data, a plain URL string, or null. */
  image: SanityImageAsset | string | null | undefined;
  /** Display context — determines quality, sizes, and srcSet widths. */
  context: ImageContext;
  /** Alt text override (falls back to image.alt then empty string). */
  alt?: string;
  /** Mark as priority for above-the-fold hero images. */
  priority?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Use `fill` mode (parent must be relative/absolute). */
  fill?: boolean;
  /**
   * The displayed width, when it is fixed or narrower than the context's
   * default (for example the 280px Timeline cards). Without it the
   * profile's sizes apply.
   */
  sizes?: string;
};

/**
 * Optimized image component that uses:
 * - Sanity CDN transforms (auto format, responsive widths)
 * - next/image for lazy loading and layout stability
 * - a blur up preview (lqip) that dissolves once the photo loads (BlurUp)
 * - Centralized profiles from lib/sanityImage.ts
 */
export default function SanityImage({
  image,
  context,
  alt: altOverride,
  priority = false,
  className,
  fill = false,
  sizes,
}: Props) {
  const props = getImageProps(image, context, altOverride);
  // No image (and no local placeholder): render nothing. The parent frame
  // keeps its size and background, so the layout does not move.
  if (!props.src) return null;
  const useSanityLoader = props.src.startsWith("https://cdn.sanity.io/");
  // Loader bound to this context's profile so it reproduces the same
  // quality / fit / focal point the profile intends.
  const loader = useSanityLoader
    ? makeSanityLoader({
        quality: props.quality,
        fit: props.fit,
        hotspot: props.hotspot,
        maxWidth: props.intrinsicWidth,
      })
    : undefined;

  // Blur up: the tiny lqip preview over the photo, dissolving on load
  // (BlurUp.tsx). Replaces next/image's own blur placeholder, which swapped
  // instantly instead of dissolving.
  const lqip = props.blurDataURL;
  const preview = (
    <BlurUp lqip={lqip} position={objectPositionOf(className)} />
  );

  if (fill) {
    return (
      <>
        <Image
          src={props.src}
          alt={props.alt}
          fill
          sizes={sizes ?? props.sizes}
          priority={priority}
          className={className}
          loader={loader}
          {...blurUpImgProps(lqip)}
        />
        {preview}
      </>
    );
  }

  const img = (
    <Image
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      sizes={sizes ?? props.sizes}
      priority={priority}
      className={className}
      loader={loader}
      {...blurUpImgProps(lqip)}
    />
  );
  // A non filling photo needs a positioned box for the preview to cover.
  return lqip ? (
    <span className="blurup-wrap">
      {img}
      {preview}
    </span>
  ) : (
    img
  );
}
