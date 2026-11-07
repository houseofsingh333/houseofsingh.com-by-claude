/**
 * Blur up preview for a photo: Sanity's low quality image preview (lqip, a
 * tiny inline JPEG) shown blurred over the photo's frame, then dissolved away
 * once the sharp photo has loaded.
 *
 * Render it as the NEXT sibling after the photo's <img>, which must carry
 * `data-blurup` (see blurUpImgProps). The pre paint script in the root
 * layout marks each such image `data-loaded` on its load (or error) event,
 * from the first byte of the page, so this works before and without React.
 * CSS ("Blur up" in globals.css) then fades the preview out over --dur-image
 * on --ease-slow; instantly under reduced motion. Without JavaScript the
 * preview is never shown at all.
 *
 * It sits over the photo rather than hiding the photo, so the photo keeps
 * its own transitions and paints as soon as it arrives (good for LCP), and
 * it takes the same box, so nothing moves.
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
