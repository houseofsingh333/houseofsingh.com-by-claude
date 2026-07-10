import SanityImage from "@/components/SanityImage";
import Caption from "./Caption";
import { hasImageAsset } from "@/lib/sanityImage";
import type { FullBleedImageBlock } from "@/lib/placeholder-data";

type Props = { section: FullBleedImageBlock };

/**
 * A dramatic beat: the image spans the full content width, edge to edge,
 * breaking past the inset max-width the other blocks use. `w-full` (rather
 * than 100vw) keeps it flush to the content edges without risking horizontal
 * overflow from the stable scrollbar gutter.
 */
export default function FullBleedImageRenderer({ section }: Props) {
  const { image } = section;
  if (!hasImageAsset(image)) return null;
  const w = image.width || 1920;
  const h = image.height || 1080;

  return (
    <figure className="project-section w-full">
      <div
        className="w-full overflow-hidden"
        style={{ position: "relative", aspectRatio: `${w} / ${h}` }}
      >
        <SanityImage
          image={image}
          context="hero"
          fill
          className="object-cover"
        />
      </div>
      <div className="mx-auto max-w-5xl px-6 md:px-16">
        <Caption text={image.caption} />
      </div>
    </figure>
  );
}
