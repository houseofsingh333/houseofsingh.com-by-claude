/**
 * Blur up preview for a photo: Sanity's low quality image preview (lqip, a
 * tiny inline JPEG) shown blurred in the photo's frame, under the photo,
 * which then dissolves in over it once loaded.
 *
 * Render it as the PREVIOUS sibling of the photo's <img>, which must carry
 * `data-blurup` (see blurUpImgProps). The pre paint script in the root
 * layout marks each such image `data-loaded` on its load (or error) event,
 * from the first byte of the page, so this works before React starts.
 * The photo is visible by default; only when JavaScript runs (the "js"
 * class) does it start hidden and dissolve in over --dur-image on
 * --ease-slow, instantly under reduced motion. Without JavaScript the
 * preview is not drawn and the photo shows as normal. The preview takes the
 * photo's own box, so nothing moves. See "Blur up" in styles/motion.css.
 */
export default function BlurUp({
  lqip,
  position,
}: {
  lqip?: string | null;
  /** The photo's object-position, so the preview lines up with the crop. */
  position?: string;
}) {
  if (!lqip) return null;
  return (
    <span
      aria-hidden="true"
      className="blurup"
      style={{
        backgroundImage: `url("${lqip}")`,
        backgroundPosition: position ?? "center",
      }}
    />
  );
}

/** Attributes for the photo's <img> that the preview pairs with. */
export function blurUpImgProps(lqip?: string | null) {
  return lqip
    ? {
        "data-blurup": "",
        // The pre paint script may add data-loaded before React hydrates.
        suppressHydrationWarning: true,
      }
    : {};
}

/** The object-position implied by a Tailwind className, for the preview. */
export function objectPositionOf(className?: string): string | undefined {
  if (!className) return undefined;
  const arbitrary = className.match(/\[object-position:([^\]]+)\]/);
  if (arbitrary) return arbitrary[1].replace(/_/g, " ");
  const named = className.match(/(?:^|\s)object-(top|bottom|left|right|center)(?:\s|$)/);
  return named ? named[1] : undefined;
}

/**
 * Marks a content photograph to develop like a print when first in view
 * (see "Photographs that develop" in styles/motion.css). SanityImage sets it
 * itself; images rendered with next/image directly spread this.
 */
export const developImgProps = {
  "data-develop": "",
  // The pre paint script adds data-developed before React may hydrate.
  suppressHydrationWarning: true,
} as const;
