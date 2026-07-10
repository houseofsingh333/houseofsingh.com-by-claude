import AspectImage from "./AspectImage";
import Caption from "./Caption";
import { hasImageAsset } from "@/lib/sanityImage";
import type { ImageRow3Block } from "@/lib/placeholder-data";

type Props = { section: ImageRow3Block };

export default function ImageRow3Renderer({ section }: Props) {
  const images = (section.images ?? []).filter(hasImageAsset);
  if (images.length === 0) return null;
  return (
    <div className="project-section mx-auto max-w-6xl px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
      {images.map((img, i) => (
        <figure key={img.url || i}>
          <AspectImage image={img} className="overflow-hidden" />
          <Caption text={img.caption} />
        </figure>
      ))}
    </div>
  );
}
