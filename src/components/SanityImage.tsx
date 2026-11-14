"use client";

import Image, { getImageProps as nextImageProps } from "next/image";
import { useLayoutEffect, useRef } from "react";
import BlurUp, { blurUpImgProps, objectPositionOf } from "@/components/BlurUp";
import {
  getImageProps,
  makeSanityLoader,
  frameRect,
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
  /**
   * The frame's shape (width / height) and the photograph's place in it
   * (0 to 1, the same values as objectPosition), for a photograph that fills
   * a frame of another shape: only the part the frame shows is downloaded
   * (see frameRect in lib/sanityImage.ts). It looks the same.
   */
  frame?: { aspect: number; x?: number; y?: number };
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
  frame,
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
        rect: frame
          ? (frameRect(props.intrinsicWidth, props.intrinsicHeight, frame.aspect, { x: frame.x ?? 0.5, y: frame.y ?? 0.5 }) ?? undefined)
          : undefined,
      })
    : undefined;

  // A photograph further down the page waits (audit C1): its address is
  // written as data-src and data-srcset, and the pre paint script in
  // app/layout.tsx gives it to the browser when the photograph is near (on
  // screen while the page loads; within a screen and a half after). The
  // phone's own lazy loading started such photographs up to two screens
  // ahead, competing with the opening photograph. Priority photographs, and
  // photographs with their own reveal (develop false: plates, portraits,
  // the menu, the Shop), load as before.
  const deferred = develop && !priority;
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

  if (deferred) {
    const { props: p } = nextImageProps({
      src: props.src,
      alt: props.alt,
      ...(fill ? { fill: true } : { width: props.width, height: props.height }),
      sizes: sizes ?? props.sizes,
      className,
      style: fill && objectPosition ? { objectPosition } : undefined,
      loader,
    });
    const img = <DeferredImg {...p} marks={marks} />;
    if (fill) {
      return (
        <>
          {preview}
          {img}
        </>
      );
    }
    return lqip ? (
      <span className="blurup-wrap">
        {preview}
        {img}
      </span>
    ) : (
      img
    );
  }

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

type ImgProps = ReturnType<typeof nextImageProps>["props"];

/**
 * The waiting photograph: the browser's own img, with its address held in
 * data-src and data-srcset until the pre paint script releases it. Without
 * JavaScript the copy in noscript shows instead. When the photograph
 * changes in place after it has been released (a new src), the new one is
 * given to the browser at once, as next/image would.
 */
function DeferredImg({ src, srcSet, marks, ...rest }: ImgProps & { marks: Record<string, unknown> }) {
  const ref = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.hasAttribute("src")) return;
    if (srcSet && el.getAttribute("srcset") !== srcSet) el.srcset = srcSet;
    if (src && el.getAttribute("src") !== src) el.src = src;
  }, [src, srcSet]);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img ref={ref} {...rest} data-src={src} data-srcset={srcSet} {...marks} suppressHydrationWarning />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...rest} src={src} srcSet={srcSet} />
      </noscript>
    </>
  );
}
