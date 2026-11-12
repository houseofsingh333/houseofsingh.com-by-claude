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
  /**
   * CSS object-position for a cropped (object-cover) photo, e.g. from the
   * image's hotspot, so the crop keeps the subject. Default: centred.
   */
  objectPosition?: string;
  /**
   * Develop like a print the first time it is in view (see "Photographs
   * that develop" in styles/motion.css). On by default for content
   * photographs; never for priority images, so the largest paint is never
   * held back. Set false for images with their own reveal.
   */
  develop?: boolean;
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
  objectPosition,
  develop = true,
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

  // Blur up: the tiny lqip preview under the photo, which dissolves in over
  // it on load (BlurUp.tsx). Replaces next/image's own blur placeholder,
  // which swapped instantly instead of dissolving.
  const lqip = props.blurDataURL;
  // Attributes the pre paint script adds before React hydrates (data-loaded,
  // data-developed) are expected, not a mismatch.
  const marks = {
    ...blurUpImgProps(lqip),
    ...(develop && !priority
      ? { "data-develop": "", suppressHydrationWarning: true }
      : {}),
  };
  const preview = (
    <BlurUp lqip={lqip} position={objectPosition ?? objectPositionOf(className)} />
  );

  if (fill) {
    return (
      <>
        {preview}
        <Image
          src={props.src}
          alt={props.alt}
          fill
          sizes={sizes ?? props.sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          className={className}
          style={objectPosition ? { objectPosition } : undefined}
          loader={loader}
          {...marks}
        />
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
      fetchPriority={priority ? "high" : undefined}
      className={className}
      loader={loader}
      {...marks}
    />
  );
  // A non filling photo needs a positioned box for the preview to fill.
  return lqip ? (
    <span className="blurup-wrap">
      {preview}
      {img}
    </span>
  ) : (
    img
  );
}
