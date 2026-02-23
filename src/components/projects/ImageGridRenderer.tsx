import AspectImage from "./AspectImage";
import type { ImageGridBlock } from "@/lib/placeholder-data";

type Props = { section: ImageGridBlock };

export default function ImageGridRenderer({ section }: Props) {
  const cols = section.layout === "3col" ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`project-section mx-auto max-w-6xl px-6 md:px-16 grid grid-cols-1 ${cols} gap-5 md:gap-8`}>
      {section.images.map((img, i) => (
        <figure key={i}>
          <AspectImage image={img} className="overflow-hidden" />
          {img.caption && (
            <figcaption className="mt-3 text-xs text-muted-foreground/50 tracking-wide">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
