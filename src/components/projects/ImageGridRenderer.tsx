import AspectImage from "./AspectImage";
import { hasImageAsset } from "@/lib/sanityImage";
import type { ImageGridBlock } from "@/lib/placeholder-data";

type Props = { section: ImageGridBlock };

export default function ImageGridRenderer({ section }: Props) {
  const cols = section.layout === "3col" ? "md:grid-cols-3" : "md:grid-cols-2";
  const images = (section.images ?? []).filter(hasImageAsset);
  if (images.length === 0) return null;

  return (
    <div className={`project-section mx-auto max-w-6xl px-6 md:px-16 grid grid-cols-1 ${cols} gap-5 md:gap-8`}>
      {images.map((img, i) => (
        <figure key={img.url || i}>
          <AspectImage image={img} className="overflow-hidden" />
          {img.caption?.trim() && (
            <figcaption className="mt-3 text-xs text-muted-foreground/50 tracking-wide">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
