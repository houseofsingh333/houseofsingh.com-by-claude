import Image from "next/image";
import {
  getImageProps,
  sanityLoader,
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
};

/**
 * Optimized image component that uses:
 * - Sanity CDN transforms (auto format, responsive widths, DPR 2)
 * - next/image for lazy loading, layout stability, and blur placeholder
 * - Centralized profiles from lib/sanityImage.ts
 */
export default function SanityImage({
  image,
  context,
  alt: altOverride,
  priority = false,
  className,
  fill = false,
}: Props) {
  const props = getImageProps(image, context, altOverride);
  const useSanityLoader = props.src.startsWith("https://cdn.sanity.io/");

  if (fill) {
    return (
      <Image
        src={props.src}
        alt={props.alt}
        fill
        sizes={props.sizes}
        priority={priority}
        className={className}
        placeholder={props.blurDataURL ? "blur" : "empty"}
        blurDataURL={props.blurDataURL}
        loader={useSanityLoader ? sanityLoader : undefined}
      />
    );
  }

  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      sizes={props.sizes}
      priority={priority}
      className={className}
      placeholder={props.blurDataURL ? "blur" : "empty"}
      blurDataURL={props.blurDataURL}
      loader={useSanityLoader ? sanityLoader : undefined}
    />
  );
}
