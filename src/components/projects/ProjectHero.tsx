import { ViewTransition } from "react";
import SanityImage from "@/components/SanityImage";
import { hotspotPosition } from "@/lib/projectHero";
import type { SanityImageAsset } from "@/lib/sanityImage";

/**
 * The full width photograph that opens a project page. It starts just clear
 * of the crest, at the same height as the plate on the Projects page
 * (--plate-top in styles/projects.css: 176px at 1280 wide, 188px on phone),
 * so it never covers the logo: 4:5 on phone, 16:9 from 768px, 16:7 from
 * 1024px (frame "Zamana, refined"; never taller than the screen below that
 * line). Cropped around the image's hotspot, loaded
 * with priority (it is the page's largest paint) and blurred up from its
 * preview. With no image, the same frame in the quiet canvas tone: never
 * placeholder art. The frame's size is fixed, so nothing moves as it loads.
 *
 * Entering a project from the Projects page, its plate grows into this
 * photograph: both carry the same view transition name (project-<slug>),
 * so the browser morphs one into the other (styles/projects.css).
 */
export default function ProjectHero({
  image,
  slug,
}: {
  image: SanityImageAsset | null;
  slug?: string;
}) {
  const frame = (
    <div className="relative mt-(--plate-top) w-full overflow-hidden bg-secondary aspect-[4/5] md:aspect-video lg:aspect-[16/7] md:max-h-[calc(100svh-var(--plate-top))]">
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
  if (!slug) return frame;
  return (
    <ViewTransition name={`project-${slug}`} share="project-plate" default="none">
      {frame}
    </ViewTransition>
  );
}
