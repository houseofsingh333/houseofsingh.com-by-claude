import SanityImage from "@/components/SanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import type { SanityImageAsset } from "@/lib/sanityImage";

/**
 * The full width photograph that opens a project page, directly under the
 * fixed 68px header: 4:5 on phone, about 16:9 from 768px (never taller than
 * the screen below the header). Cropped around the image's hotspot, loaded
 * with priority (it is the page's largest paint) and blurred up from its
 * preview. With no image, the same frame in the quiet canvas tone: never
 * placeholder art. The frame's size is fixed, so nothing moves as it loads.
 */
export default function ProjectHero({
  image,
}: {
  image: SanityImageAsset | null;
}) {
  return (
    <div className="relative mt-[68px] w-full overflow-hidden bg-secondary aspect-[4/5] md:aspect-video md:max-h-[calc(100svh-68px)]">
      {image && (
        <SanityImage
          image={image}
          context="hero"
          priority
          fill
          sizes="100vw"
          className="object-cover"
          objectPosition={hotspotPosition(image)}
        />
      )}
    </div>
  );
}
